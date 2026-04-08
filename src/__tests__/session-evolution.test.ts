/**
 * Data isolation tests for createSessionEvolution.
 */

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const OTHER_UUID = '123e4567-e89b-12d3-a456-426614174000'

// Use a pattern that allows accessing the mock from outside
const mockGetUser = jest.fn()
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

jest.mock('@upstash/ratelimit', () => ({ Ratelimit: jest.fn() }))
jest.mock('@upstash/redis', () => ({ Redis: jest.fn() }))

const mockPrismaAppointmentFindUnique = jest.fn()
const mockPrismaAppointmentUpdate = jest.fn()
const mockPrismaEvolutionCreate = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findUnique: (...args: unknown[]) => mockPrismaAppointmentFindUnique(...args),
      update: (...args: unknown[]) => mockPrismaAppointmentUpdate(...args),
    },
    evolution: {
      create: (...args: unknown[]) => mockPrismaEvolutionCreate(...args),
    },
  },
}))

jest.mock('@/lib/security', () => ({
  encryptData: jest.fn((v: string) => `enc:${v}`),
  decryptData: jest.fn((v: string) => v),
  isValidUUID: jest.fn(() => true),
}))

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('@/lib/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

import { createSessionEvolution } from '@/lib/actions/evolutions'

const MOCK_APPOINTMENT = {
  id: VALID_UUID,
  psychologistId: OTHER_UUID,
  psychologist: { userId: VALID_UUID },
  patient: { profiles: { id: OTHER_UUID } },
}

const VALID_INPUT = {
  appointmentId: VALID_UUID,
  mood: 'Bem',
  publicSummary: 'ps',
  privateNotes: 'pn',
}

describe('createSessionEvolution', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({
      data: { user: { id: VALID_UUID, app_metadata: { role: 'PSYCHOLOGIST' } } },
    })
    mockPrismaAppointmentFindUnique.mockResolvedValue(MOCK_APPOINTMENT)
    mockPrismaEvolutionCreate.mockResolvedValue({ id: 'evo-1' })
  })

  it('fails if no user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await createSessionEvolution(VALID_INPUT)
    expect(res.success).toBe(false)
    if (res.success) return
    expect(res.code).toBe('UNAUTHENTICATED')
  })

  it('fails if session not found', async () => {
    mockPrismaAppointmentFindUnique.mockResolvedValue(null)
    const res = await createSessionEvolution(VALID_INPUT)
    expect(res.success).toBe(false)
    if (res.success) return
    expect(res.error).toBe('Agendamento não encontrado')
  })

  it('succeeds if valid', async () => {
    const res = await createSessionEvolution(VALID_INPUT)
    expect(res.success).toBe(true)
  })
})
