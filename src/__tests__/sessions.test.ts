/**
 * Tests for sessions Server Actions
 * Rule 1: Appointments are visible to BOTH patient and psychologist
 * Rule 2: Conflict checks prevent double-booking for both parties
 */

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

jest.mock('@/lib/security', () => ({
  encryptData: jest.fn((data) => `encrypted-${data}`),
  decryptData: jest.fn((data) => data.replace('encrypted-', '')),
  isValidUUID: jest.fn(() => true),
}))

jest.mock('@/lib/actions/notifications', () => ({
  sendAppointmentNotifications: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

const mockPrismaAppointmentFindMany = jest.fn()
const mockPrismaAppointmentFindFirst = jest.fn()
jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findMany: (...args: any[]) => mockPrismaAppointmentFindMany(...args),
      findFirst: (...args: any[]) => mockPrismaAppointmentFindFirst(...args),
    },
  },
}))

import {
  getUserSessions,
  getNextSession,
  getSessionHistory,
  createSession,
  cancelSession,
  rescheduleSession,
} from '@/lib/actions/sessions'

const MOCK_USER = { id: 'user-1', email: 'test@test.com' }

// Sample appointment returned by Prisma (includes nested relations)
function makePrismaAppointment(overrides: Record<string, any> = {}) {
  return {
    id: 'appt-1',
    patientId: 'user-1',
    psychologistId: 'psych-profile-1',
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
      id: 'user-1',
      profiles: { full_name: 'Patient Name', role: 'PATIENT', avatar_url: null },
    },
    psychologist: {
      id: 'psych-profile-1',
      user: {
        id: 'psych-user-1',
        profiles: { full_name: 'Psych Name', role: 'PSYCHOLOGIST', avatar_url: null },
      },
    },
    ...overrides,
  }
}

// Helper to build chainable Supabase mock
function mockSupabaseQuery(data: any = null, error: any = null) {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  }

  mockFrom.mockReturnValue(chain)
  return chain
}

describe('sessions actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ──────────────────────────────────────────────────────────────────
  // Rule 1: Appointments must appear on BOTH patient and psychologist
  // ──────────────────────────────────────────────────────────────────
  describe('getUserSessions - both-party visibility (Rule 1)', () => {
    it('should return empty array when Prisma throws an error', async () => {
      mockPrismaAppointmentFindMany.mockRejectedValue(new Error('DB error'))

      const result = await getUserSessions('user-1')
      expect(result).toEqual([])
    })

    it('should query using OR filter covering both patient and psychologist roles', async () => {
      mockPrismaAppointmentFindMany.mockResolvedValue([])

      await getUserSessions('user-1')

      expect(mockPrismaAppointmentFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [{ patientId: 'user-1' }, { psychologist: { userId: 'user-1' } }],
          },
        })
      )
    })

    it('should return appointments when patient queries their sessions', async () => {
      const appt = makePrismaAppointment({ patientId: 'user-1' })
      mockPrismaAppointmentFindMany.mockResolvedValue([appt])

      const result = await getUserSessions('user-1')

      expect(result).toHaveLength(1)
      expect(result[0].patient_id).toBe('user-1')
      expect(result[0].psychologist_id).toBe('psych-profile-1')
      expect(result[0].scheduled_at).toBe('2024-06-01T10:00:00.000Z')
      expect(result[0].duration_minutes).toBe(50)
      expect(result[0].status).toBe('SCHEDULED')
      expect(result[0].price).toBe(150)
    })

    it('should return same appointment when psychologist queries their sessions (both-party visibility)', async () => {
      // The appointment was booked by patient-user-id with psychologist psych-user-id.
      // Both should see it — verified here from the psychologist's perspective.
      const appt = makePrismaAppointment({
        patientId: 'patient-user-id',
        psychologist: {
          id: 'psych-profile-1',
          user: {
            id: 'psych-user-id',
            profiles: { full_name: 'Dr. Silva', role: 'PSYCHOLOGIST', avatar_url: null },
          },
        },
      })
      mockPrismaAppointmentFindMany.mockResolvedValue([appt])

      // Psychologist queries using their user ID
      const result = await getUserSessions('psych-user-id')

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('appt-1')
      // Patient info is present so the psychologist can see who booked
      expect(result[0].patient).not.toBeNull()
      // Psychologist info is present so both sides can identify the session
      expect(result[0].psychologist).not.toBeNull()
    })

    it('should return multiple sessions ordered correctly', async () => {
      const first = makePrismaAppointment({
        id: 'appt-a',
        scheduledAt: new Date('2024-06-01T09:00:00Z'),
      })
      const second = makePrismaAppointment({
        id: 'appt-b',
        scheduledAt: new Date('2024-06-02T10:00:00Z'),
      })
      mockPrismaAppointmentFindMany.mockResolvedValue([first, second])

      const result = await getUserSessions('user-1')

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('appt-a')
      expect(result[1].id).toBe('appt-b')
    })
  })

  // ──────────────────────────────────────────────────────────────────
  // createSession
  // ──────────────────────────────────────────────────────────────────
  describe('createSession', () => {
    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const result = await createSession({
        patientId: 'patient-1',
        psychologistId: 'psych-1',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 50,
      })

      expect(result).toEqual({ success: false, error: 'Usuário não autenticado' })
    })

    it('should reject session creation by unauthorized user (spoofing prevention)', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'attacker-id' } },
      })

      const result = await createSession({
        patientId: 'patient-1',
        psychologistId: 'psych-1',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 50,
      })

      expect(result).toEqual({
        success: false,
        error: 'Acesso negado. Você não pode agendar para terceiros.',
      })
    })

    it('should return error when psychologist not found', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
      mockSupabaseQuery(null, { message: 'Not found' })

      const result = await createSession({
        patientId: MOCK_USER.id,
        psychologistId: 'psych-1',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 50,
      })

      expect(result.success).toBe(false)
    })

    it('should block double-booking when there is a conflict (Rule 2)', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
      mockSupabaseQuery({ id: 'psych-profile-1', price_per_session: 150 })

      const now = new Date()
      // Simulate an existing appointment overlapping the requested slot
      mockPrismaAppointmentFindMany.mockResolvedValue([
        {
          id: 'existing-session',
          psychologistId: 'psych-profile-1',
          patientId: 'other-patient',
          scheduledAt: now,
          durationMinutes: 50,
        },
      ])

      const result = await createSession({
        patientId: MOCK_USER.id,
        psychologistId: 'psych-1',
        scheduledAt: now.toISOString(),
        durationMinutes: 50,
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('horário já foi reservado')
    })

    it('should block double-booking when patient already has an appointment at the same time (Rule 2)', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
      mockSupabaseQuery({ id: 'psych-profile-2', price_per_session: 200 })

      const now = new Date()
      // Patient has an existing session with ANOTHER psychologist at the same time
      mockPrismaAppointmentFindMany.mockResolvedValue([
        {
          id: 'patient-existing-session',
          psychologistId: 'different-psych-profile',
          patientId: MOCK_USER.id,
          scheduledAt: now,
          durationMinutes: 50,
        },
      ])

      const result = await createSession({
        patientId: MOCK_USER.id,
        psychologistId: 'psych-2',
        scheduledAt: now.toISOString(),
        durationMinutes: 50,
      })

      expect(result.success).toBe(false)
      // Patient conflict message
      expect(result.error).toContain('agenda')
    })
  })

  // ──────────────────────────────────────────────────────────────────
  // cancelSession
  // ──────────────────────────────────────────────────────────────────
  describe('cancelSession', () => {
    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await cancelSession('session-1')
      expect(result).toEqual({ success: false, error: 'Usuário não autenticado' })
    })

    it('should return error if session is not found', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
      mockSupabaseQuery(null, { message: 'Not found' })

      const result = await cancelSession('session-nonexistent')

      expect(result).toEqual({ success: false, error: 'Sessão não encontrada' })
    })

    it('should reject cancellation by unauthorized user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
      const chain = mockSupabaseQuery()
      chain.single.mockResolvedValue({
        data: { patient_id: 'other-user', psychologist_id: 'other-psych' },
        error: null,
      })

      const result = await cancelSession('session-1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Acesso negado')
    })
  })

  // ──────────────────────────────────────────────────────────────────
  // rescheduleSession
  // ──────────────────────────────────────────────────────────────────
  describe('rescheduleSession', () => {
    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await rescheduleSession({
        sessionId: 'session-1',
        newScheduledAt: new Date().toISOString(),
      })
      expect(result).toEqual({ success: false, error: 'Usuário não autenticado' })
    })

    it('should return error if session is not found', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
      mockSupabaseQuery(null, { message: 'Not found' })

      const result = await rescheduleSession({
        sessionId: 'session-nonexistent',
        newScheduledAt: new Date().toISOString(),
      })

      expect(result).toEqual({ success: false, error: 'Sessão não encontrada' })
    })

    it('should reject rescheduling by unauthorized user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
      const chain = mockSupabaseQuery()
      chain.single.mockResolvedValue({
        data: { patient_id: 'other-user', psychologist_id: 'other-psych' },
        error: null,
      })

      const result = await rescheduleSession({
        sessionId: 'session-1',
        newScheduledAt: new Date().toISOString(),
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Acesso negado')
    })

    it('should block rescheduling into a conflicting slot (Rule 2)', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
      const chain = mockSupabaseQuery()
      chain.single.mockResolvedValue({
        data: {
          id: 'session-1',
          patient_id: MOCK_USER.id,
          psychologist_id: 'psych-1',
          duration_minutes: 50,
          scheduled_at: new Date().toISOString(),
        },
        error: null,
      })

      const now = new Date()
      mockPrismaAppointmentFindMany.mockResolvedValue([
        {
          id: 'other-existing-session',
          psychologistId: 'psych-1',
          patientId: 'another-patient',
          scheduledAt: now,
          durationMinutes: 50,
        },
      ])

      const result = await rescheduleSession({
        sessionId: 'session-1',
        newScheduledAt: now.toISOString(),
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('horário já foi reservado')
    })
  })
})
