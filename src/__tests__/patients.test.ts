import {
  getPsychologistPatients,
  getAnamnesis,
  getEvolutions,
  saveEvolution,
  updateAnamnesis,
} from '../lib/actions/patients'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { encryptData, decryptData } from '@/lib/security'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    psychologistProfile: {
      findUnique: jest.fn(),
    },
    appointment: {
      findMany: jest.fn(),
    },
    patientPsychologistLink: {
      findMany: jest.fn(),
    },
    anamnesis: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    evolution: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    profile: {
      findUnique: jest.fn(),
    },
  },
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}))

jest.mock('@/lib/security', () => ({
  encryptData: jest.fn((data) => `encrypted-${data}`),
  decryptData: jest.fn((data) => data.replace('encrypted-', '')),
  isValidUUID: jest.fn(() => true),
}))

describe('patients actions', () => {
  const mockUser = { id: 'user-1' }
  const mockPsychologist = { id: 'psych-1' }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    })
    ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(mockPsychologist)
  })

  describe('getPsychologistPatients', () => {
    it('should return empty list if psychologist profile not found', async () => {
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(null)
      const patients = await getPsychologistPatients(undefined)
      expect((patients as any).data).toEqual([])
    })

    it('should combine patients from appointments and explicit links', async () => {
      ;(prisma.appointment.findMany as jest.Mock).mockResolvedValue([
        {
          patientId: 'p1',
          scheduledAt: new Date(),
          price: 100,
          status: 'COMPLETED',
          patient: {
            id: 'p1',
            email: 'p1@test.com',
            profiles: { id: 'prof-1', fullName: 'Patient One', phone: '123' },
          },
        },
      ])
      ;(prisma.patientPsychologistLink.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'link-1',
          status: 'active',
          patient: {
            user_id: 'p1',
            users: { id: 'p1', email: 'p1@test.com' },
          },
        },
      ])

      const patients = await getPsychologistPatients(undefined)
      expect(patients.success).toBe(true)
      expect((patients as any).data!.length).toBe(1)
      expect((patients as any).data![0].name).toBe('Patient One')
    })
  })

  describe('getAnamnesis', () => {
    it('should decrypt anamnesis data correctly', async () => {
      ;(prisma.anamnesis.findFirst as jest.Mock).mockResolvedValue({
        id: 'ana-1',
        mainComplaint: 'encrypted-complaint',
        familyHistory: 'encrypted-history',
      })

      const res = await getAnamnesis('prof-1')
      const anamnesis = (res as any).data

      expect(anamnesis?.mainComplaint).toBe('complaint')
      expect(decryptData).toHaveBeenCalledWith('encrypted-complaint')
    })
  })

  describe('saveEvolution', () => {
    it('should encrypt notes before saving', async () => {
      const mockEvolution = { id: 'evo-1' }
      ;(prisma.evolution.create as jest.Mock).mockResolvedValue(mockEvolution)

      const result = await saveEvolution({
        patientId: 'prof-1',
        publicSummary: 'public notes',
        privateNotes: 'private notes',
      })

      expect(result.success).toBe(true)
      expect(encryptData).toHaveBeenCalledWith('public notes')
      expect(encryptData).toHaveBeenCalledWith('private notes')
      expect(prisma.evolution.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            publicSummary: 'encrypted-public notes',
            privateNotes: 'encrypted-private notes',
          }),
        })
      )
    })
  })

  // ─── Data Isolation ──────────────────────────────────────────────────────────

  describe('getAnamnesis — data isolation', () => {
    it('returns null when user is not authenticated', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      })

      const result = await getAnamnesis('prof-1')
      expect(result).toBeNull()
    })

    it('returns null when caller has no psychologist profile (patient trying to read)', async () => {
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await getAnamnesis('prof-1')
      expect(result).toBeNull()
      expect(prisma.anamnesis.findFirst).not.toHaveBeenCalled()
    })

    it('queries anamnesis scoped to the authenticated psychologist ID', async () => {
      ;(prisma.anamnesis.findFirst as jest.Mock).mockResolvedValue(null)

      await getAnamnesis('prof-1')

      expect(prisma.anamnesis.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ psychologistId: mockPsychologist.id }),
        })
      )
    })

    it('returns null when anamnesis belongs to a different psychologist', async () => {
      // findFirst returns null because psych-1 cannot see psych-2's records
      ;(prisma.anamnesis.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await getAnamnesis('prof-1')
      expect(result).toBeNull()
    })

    it('returns decrypted data only when the psychologist owns the anamnesis', async () => {
      ;(prisma.anamnesis.findFirst as jest.Mock).mockResolvedValue({
        id: 'ana-1',
        mainComplaint: 'encrypted-dor',
        familyHistory: 'encrypted-hist',
        medication: 'encrypted-med',
        diagnosticHypothesis: 'encrypted-diag',
      })

      const result = await getAnamnesis('prof-1')
      expect((result as any).data).not.toBeNull()
      expect((result as any).data?.mainComplaint).toBe('dor')
    })
  })

  describe('getEvolutions — data isolation', () => {
    it('returns empty array when caller has no psychologist profile', async () => {
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await getEvolutions('prof-1')
      expect(result).toEqual([])
      expect(prisma.evolution.findMany).not.toHaveBeenCalled()
    })

    it('queries evolutions scoped to the authenticated psychologist ID', async () => {
      ;(prisma.evolution.findMany as jest.Mock).mockResolvedValue([])

      await getEvolutions('prof-1')

      expect(prisma.evolution.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ psychologistId: mockPsychologist.id }),
        })
      )
    })

    it('returns empty array when evolutions belong to a different psychologist', async () => {
      // DB returns [] because psychologistId filter doesn't match
      ;(prisma.evolution.findMany as jest.Mock).mockResolvedValue([])

      const result = await getEvolutions('prof-1')
      expect(result).toEqual([])
    })

    it('returns only own records when psychologist has data for this patient', async () => {
      ;(prisma.evolution.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'evo-1',
          date: new Date(),
          mood: 'Bem',
          publicSummary: 'encrypted-s',
          privateNotes: 'encrypted-p',
        },
      ])

      const result = await getEvolutions('prof-1')
      expect((result as any).data).toHaveLength(1)
      expect((result as any).data![0].id).toBe('evo-1')
    })
  })

  describe('updateAnamnesis — data isolation', () => {
    it('returns error when user is not authenticated', async () => {
      ;(createClient as jest.Mock).mockResolvedValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null } }) },
      })

      const result = await updateAnamnesis({
        patientProfileId: 'prof-1',
        data: { mainComplaint: 'x' },
      })
      expect(result.success).toBe(false)
    })

    it('returns error when caller has no psychologist profile', async () => {
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await updateAnamnesis({
        patientProfileId: 'prof-1',
        data: { mainComplaint: 'x' },
      })
      expect(result.success).toBe(false)
      expect(prisma.anamnesis.update).not.toHaveBeenCalled()
    })

    it('never calls update for anamnesis belonging to another psychologist', async () => {
      // findFirst returns null because the existing anamnesis belongs to another psychologist
      ;(prisma.anamnesis.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.anamnesis.create as jest.Mock).mockResolvedValue({ id: 'new-ana' })

      await updateAnamnesis({ patientProfileId: 'prof-1', data: { mainComplaint: 'attempt' } })

      // The attacker's request must never reach the update path
      expect(prisma.anamnesis.update).not.toHaveBeenCalled()
    })

    it('scopes the ownership check to the authenticated psychologist', async () => {
      ;(prisma.anamnesis.findFirst as jest.Mock).mockResolvedValue(null)
      ;(prisma.anamnesis.create as jest.Mock).mockResolvedValue({ id: 'ana-new' })

      await updateAnamnesis({ patientProfileId: 'prof-1', data: { mainComplaint: 'test' } })

      expect(prisma.anamnesis.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ psychologistId: mockPsychologist.id }),
        })
      )
    })
  })
})
