/**
 * Data isolation tests for createSessionEvolution.
 *
 * Critical security property: only the psychologist who owns an appointment
 * may write evolution notes for it.
 */

jest.mock('@upstash/ratelimit', () => ({ Ratelimit: jest.fn() }))
jest.mock('@upstash/redis', () => ({ Redis: jest.fn() }))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn() },
  })),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    evolution: {
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/security', () => ({
  encryptData: jest.fn((v: string) => `enc:${v}`),
  assertValidUUID: jest.fn(),
  isValidUUID: jest.fn(() => true),
}))

jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))

jest.mock('@/lib/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { createSessionEvolution } from '@/lib/actions/evolutions'

const PSYCHOLOGIST_USER_ID = 'psych-user-1'
const OTHER_PSYCHOLOGIST_USER_ID = 'psych-user-2'

const MOCK_APPOINTMENT = {
  id: 'appt-1',
  psychologistId: 'psych-profile-1',
  psychologist: { userId: PSYCHOLOGIST_USER_ID },
  patient: { profiles: { id: 'patient-profile-1' } },
}

function mockAuth(userId: string | null) {
  ;(createClient as jest.Mock).mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: userId ? { id: userId } : null },
      }),
    },
  })
}

const VALID_INPUT = {
  appointmentId: 'appt-1',
  mood: 'Bem',
  publicSummary: 'Sessão produtiva',
  privateNotes: 'Notas privadas',
}

describe('createSessionEvolution — data isolation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(prisma.appointment.update as jest.Mock).mockResolvedValue({})
    ;(prisma.evolution.create as jest.Mock).mockResolvedValue({ id: 'evo-new' })
  })

  it('returns error when user is not authenticated', async () => {
    mockAuth(null)

    const result = await createSessionEvolution(VALID_INPUT)

    expect(result.success).toBe(false)
    expect(prisma.evolution.create).not.toHaveBeenCalled()
  })

  it('returns error when appointment is not found', async () => {
    mockAuth(PSYCHOLOGIST_USER_ID)
    ;(prisma.appointment.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await createSessionEvolution(VALID_INPUT)

    expect(result.success).toBe(false)
    expect(prisma.evolution.create).not.toHaveBeenCalled()
  })

  it('rejects a psychologist trying to write notes for another psychologist appointment', async () => {
    mockAuth(OTHER_PSYCHOLOGIST_USER_ID)
    ;(prisma.appointment.findUnique as jest.Mock).mockResolvedValue(MOCK_APPOINTMENT)

    const result = await createSessionEvolution(VALID_INPUT)

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/permissão/i)
    expect(prisma.evolution.create).not.toHaveBeenCalled()
  })

  it('allows the correct psychologist to create an evolution note', async () => {
    mockAuth(PSYCHOLOGIST_USER_ID)
    ;(prisma.appointment.findUnique as jest.Mock).mockResolvedValue(MOCK_APPOINTMENT)

    const result = await createSessionEvolution(VALID_INPUT)

    expect(result.success).toBe(true)
    expect(prisma.evolution.create).toHaveBeenCalledTimes(1)
  })

  it('stores evolution scoped to the appointment psychologist profile ID', async () => {
    mockAuth(PSYCHOLOGIST_USER_ID)
    ;(prisma.appointment.findUnique as jest.Mock).mockResolvedValue(MOCK_APPOINTMENT)

    await createSessionEvolution(VALID_INPUT)

    expect(prisma.evolution.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          psychologistId: MOCK_APPOINTMENT.psychologistId,
          patientId: MOCK_APPOINTMENT.patient.profiles.id,
        }),
      })
    )
  })

  it('encrypts both public and private notes before persisting', async () => {
    mockAuth(PSYCHOLOGIST_USER_ID)
    ;(prisma.appointment.findUnique as jest.Mock).mockResolvedValue(MOCK_APPOINTMENT)

    await createSessionEvolution(VALID_INPUT)

    expect(prisma.evolution.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          publicSummary: 'enc:Sessão produtiva',
          privateNotes: 'enc:Notas privadas',
        }),
      })
    )
  })
})
