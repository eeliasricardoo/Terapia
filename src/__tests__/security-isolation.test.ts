/**
 * Critical Security Isolation Tests
 * Ensures that psychologists cannot access each other's patients or medical records.
 */

import { getAnamnesis, getEvolutions, getPatientById } from '@/lib/actions/patients'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    psychologistProfile: { findUnique: jest.fn() },
    appointment: { findMany: jest.fn(), findUnique: jest.fn() },
    patientPsychologistLink: { findUnique: jest.fn() },
    anamnesis: { findFirst: jest.fn() },
    evolution: { findMany: jest.fn() },
    profile: { findUnique: jest.fn() },
  },
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/security', () => ({
  encryptData: jest.fn((d) => d),
  decryptData: jest.fn((d) => d),
  isValidUUID: jest.fn(() => true),
}))

describe('Security Isolation', () => {
  const PSYCH_A = {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    userId: '550e8400-e29b-41d4-a716-446655440001',
  }
  const PSYCH_B = {
    id: '6ba7b810-9dad-11d1-80b4-00c04fd430c9',
    userId: '550e8400-e29b-41d4-a716-446655440002',
  }
  const PATIENT_A = {
    id: '550e8400-e29b-41d4-a716-446655440003',
    profileId: '550e8400-e29b-41d4-a716-446655440004',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  function mockAuth(userId: string) {
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: {
            user: { id: userId, email: 'test@test.com', app_metadata: { role: 'PSYCHOLOGIST' } },
          },
        }),
      },
    })
  }

  it('Psychologist B should NOT be able to access Anamnesis of Patient A', async () => {
    mockAuth(PSYCH_B.userId)
    ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(PSYCH_B)
    ;(prisma.anamnesis.findFirst as jest.Mock).mockResolvedValue(null)

    const result = await getAnamnesis(PATIENT_A.profileId)

    expect(result).toEqual({ success: true, data: null })
    expect(prisma.anamnesis.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          patientId: PATIENT_A.profileId,
          psychologistId: PSYCH_B.id,
        }),
      })
    )
  })

  it('Psychologist B should NOT be able to access Patient A details if no link exists', async () => {
    mockAuth(PSYCH_B.userId)
    ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(PSYCH_B)
    ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue({
      id: PATIENT_A.profileId,
      user_id: PATIENT_A.id,
    })
    ;(prisma.appointment.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.patientPsychologistLink.findUnique as jest.Mock).mockResolvedValue(null)

    const result = await getPatientById(PATIENT_A.profileId)

    expect(result).toEqual({
      success: false,
      error: 'Você não tem permissão para acessar este paciente.',
      code: 'INTERNAL_ERROR', // safe action rethrows original errors
    })
  })

  it('Psychologist B should NOT be able to access Evolutions of Patient A', async () => {
    mockAuth(PSYCH_B.userId)
    ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(PSYCH_B)
    ;(prisma.evolution.findMany as jest.Mock).mockResolvedValue([])

    const result = await getEvolutions(PATIENT_A.profileId)

    expect(result).toEqual({ success: true, data: [] })
    expect(prisma.evolution.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          patientId: PATIENT_A.profileId,
          psychologistId: PSYCH_B.id,
        }),
      })
    )
  })
})
