/**
 * Tests for sessions Server Actions
 * Rule 1: Appointments are visible to BOTH patient and psychologist
 * Rule 2: Conflict checks prevent double-booking for both parties
 */

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const PSYCH_PROFILE_ID = '123e4567-e89b-12d3-a456-426614174000'
const OTHER_SESSION_ID = '789e4567-e89b-12d3-a456-426614174999'

const mockGetUser = jest.fn()
const mockFrom = jest.fn()
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

jest.mock('@/lib/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

jest.mock('@upstash/ratelimit', () => ({ Ratelimit: jest.fn() }))
jest.mock('@upstash/redis', () => ({ Redis: jest.fn() }))

jest.mock('@/lib/stripe', () => ({
  stripe: {
    refunds: { create: jest.fn().mockResolvedValue({ id: 'refund_mock' }) },
    paymentIntents: { retrieve: jest.fn().mockResolvedValue({ id: 'pi_mock', amount: 10000 }) },
  },
}))

jest.mock('@/lib/security', () => ({
  encryptData: jest.fn((data) => `encrypted-${data}`),
  decryptData: jest.fn((data) => data.replace('encrypted-', '')),
  isValidUUID: jest.fn(() => true),
}))

jest.mock('@/lib/actions/notifications', () => ({
  sendAppointmentNotifications: jest.fn().mockResolvedValue(undefined),
  sendCancellationNotifications: jest.fn().mockResolvedValue(undefined),
  sendRescheduleNotifications: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

const mockPrismaAppointmentFindMany = jest.fn()
const mockPrismaAppointmentFindFirst = jest.fn()
const mockPrismaAppointmentCount = jest.fn().mockResolvedValue(0)
const mockPrismaAppointmentFindUnique = jest.fn()
const mockPrismaAppointmentUpdate = jest.fn()
const mockPrismaAppointmentCreate = jest.fn()
const mockPrismaTransaction = jest.fn()
jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findMany: (...args: any[]) => mockPrismaAppointmentFindMany(...args),
      findFirst: (...args: any[]) => mockPrismaAppointmentFindFirst(...args),
      findUnique: (...args: any[]) => mockPrismaAppointmentFindUnique(...args),
      count: (...args: any[]) => mockPrismaAppointmentCount(...args),
      update: (...args: any[]) => mockPrismaAppointmentUpdate(...args),
      create: (...args: any[]) => mockPrismaAppointmentCreate(...args),
    },
    $transaction: (...args: any[]) => mockPrismaTransaction(...args),
  },
}))

import {
  getUserSessions,
  getNextSession,
  getSessionHistory,
  cancelSession,
  rescheduleSession,
} from '@/lib/actions/sessions'

const MOCK_USER = {
  id: VALID_UUID,
  email: 'test@test.com',
  app_metadata: { role: 'PATIENT' },
}

// Sample appointment returned by Prisma (includes nested relations)
function makePrismaAppointment(overrides: Record<string, any> = {}) {
  return {
    id: VALID_UUID,
    patientId: VALID_UUID,
    psychologistId: PSYCH_PROFILE_ID,
    scheduledAt: new Date('2024-06-01T10:00:00Z'),
    durationMinutes: 50,
    status: 'SCHEDULED',
    price: 150,
    meetingUrl: null,
    paymentMethod: null,
    sessionType: 'Terapia Individual',
    createdAt: new Date(),
    updatedAt: new Date(),
    patient: {
      id: VALID_UUID,
      profiles: { full_name: 'Patient Name', role: 'PATIENT', avatar_url: null },
    },
    psychologist: {
      id: PSYCH_PROFILE_ID,
      user: {
        id: 'psych-user-1',
        profiles: { full_name: 'Psych Name', role: 'PSYCHOLOGIST', avatar_url: null },
      },
    },
    ...overrides,
  }
}

describe('sessions actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
    // Default mock behavior - no conflict
    mockPrismaAppointmentFindFirst.mockResolvedValue(null)
    mockPrismaAppointmentFindUnique.mockResolvedValue(makePrismaAppointment())
    mockPrismaAppointmentUpdate.mockResolvedValue(makePrismaAppointment())
    mockPrismaAppointmentCreate.mockResolvedValue(makePrismaAppointment())
    mockPrismaTransaction.mockResolvedValue([[], 0])
  })

  // ──────────────────────────────────────────────────────────────────
  // Rule 1: Appointments must appear on BOTH patient and psychologist
  // ──────────────────────────────────────────────────────────────────
  describe('getUserSessions - both-party visibility (Rule 1)', () => {
    it('should return empty sessions when Prisma throws an error', async () => {
      mockPrismaTransaction.mockRejectedValue(new Error('DB error'))

      const result: any = await getUserSessions({ limit: 20 })
      expect(result.success).toBe(false)
      expect(result.code).toBe('INTERNAL_ERROR')
    })

    it('should return appointments when patient queries their sessions', async () => {
      const appt = makePrismaAppointment()
      mockPrismaTransaction.mockResolvedValue([[appt], 1])

      const result: any = await getUserSessions({ limit: 20 })

      expect(result.success).toBe(true)
      expect(result.data.sessions).toHaveLength(1)
      expect(result.data.sessions[0].patient_id).toBe(VALID_UUID)
      expect(result.data.total).toBe(1)
    })
  })

  // ──────────────────────────────────────────────────────────────────
  // cancelSession
  // ──────────────────────────────────────────────────────────────────
  describe('cancelSession', () => {
    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result: any = await cancelSession(VALID_UUID)
      expect(result.success).toBe(false)
      expect(result.code).toBe('UNAUTHENTICATED')
    })

    it('should return error if session is not found', async () => {
      mockPrismaAppointmentFindUnique.mockResolvedValue(null)
      const result: any = await cancelSession(VALID_UUID)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Sessão não encontrada')
    })

    it('should reject cancellation by unauthorized user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'attacker-id', email: 'a@a.com' } } })
      mockPrismaAppointmentFindUnique.mockResolvedValue({
        id: VALID_UUID,
        patientId: 'real-patient-id',
        psychologist: { userId: 'real-psych-id' },
      })

      const result: any = await cancelSession(VALID_UUID)
      expect(result.success).toBe(false)
      expect(result.error).toContain('permissão')
    })
  })

  // ──────────────────────────────────────────────────────────────────
  // rescheduleSession
  // ──────────────────────────────────────────────────────────────────
  describe('rescheduleSession', () => {
    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result: any = await rescheduleSession({
        sessionId: VALID_UUID,
        newScheduledAt: new Date().toISOString(),
      })
      expect(result.success).toBe(false)
      expect(result.code).toBe('UNAUTHENTICATED')
    })

    it('should return error if session is not found', async () => {
      mockPrismaAppointmentFindUnique.mockResolvedValue(null)
      const result: any = await rescheduleSession({
        sessionId: VALID_UUID,
        newScheduledAt: new Date().toISOString(),
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Sessão não encontrada')
    })

    it('should reject rescheduling by unauthorized user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'attacker-id', email: 'a@a.com' } } })
      mockPrismaAppointmentFindUnique.mockResolvedValue({
        id: VALID_UUID,
        patientId: 'real-patient-id',
        psychologist: { userId: 'real-psych-id' },
      })

      const result: any = await rescheduleSession({
        sessionId: VALID_UUID,
        newScheduledAt: new Date().toISOString(),
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Acesso negado')
    })

    it('should block rescheduling into a conflicting slot (Rule 2)', async () => {
      mockPrismaAppointmentFindUnique.mockResolvedValue({
        id: VALID_UUID,
        patientId: MOCK_USER.id,
        psychologistId: PSYCH_PROFILE_ID,
        durationMinutes: 50,
        scheduledAt: new Date(),
        psychologist: { userId: 'psych-user-1' },
      })

      const now = new Date()
      // Conflict check calls findFirst
      mockPrismaAppointmentFindFirst.mockResolvedValue({
        id: OTHER_SESSION_ID,
        psychologistId: PSYCH_PROFILE_ID,
        patientId: 'another-patient',
        scheduledAt: now,
        durationMinutes: 50,
      })

      const result: any = await rescheduleSession({
        sessionId: VALID_UUID,
        newScheduledAt: now.toISOString(),
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('compromisso')
    })
  })
})
