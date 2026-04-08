/**
 * Tests for patients Server Actions
 */

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const OTHER_UUID = '123e4567-e89b-12d3-a456-426614174000'

// Mock dependencies
jest.mock('@upstash/ratelimit', () => ({ Ratelimit: jest.fn() }))
jest.mock('@upstash/redis', () => ({ Redis: jest.fn() }))

const mockGetUser = jest.fn()
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

const mockPrismaPsychProfileFindUnique = jest.fn()
const mockPrismaApptFindMany = jest.fn()
const mockPrismaApptFindFirst = jest.fn()
const mockPrismaLinkFindMany = jest.fn()
const mockPrismaAnamnesisFindFirst = jest.fn()
const mockPrismaEvolutionCreate = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    psychologistProfile: {
      findUnique: (...args: unknown[]) => mockPrismaPsychProfileFindUnique(...args),
    },
    appointment: {
      findMany: (...args: unknown[]) => mockPrismaApptFindMany(...args),
      findFirst: (...args: unknown[]) => mockPrismaApptFindFirst(...args),
    },
    patientPsychologistLink: {
      findMany: (...args: unknown[]) => mockPrismaLinkFindMany(...args),
      findFirst: jest.fn(),
    },
    anamnesis: {
      findFirst: (...args: unknown[]) => mockPrismaAnamnesisFindFirst(...args),
    },
    evolution: {
      create: (...args: unknown[]) => mockPrismaEvolutionCreate(...args),
    },
  },
}))

jest.mock('@/lib/security', () => ({
  encryptData: jest.fn((data) => `encrypted-${data}`),
  decryptData: jest.fn((data) => data.replace('encrypted-', '')),
  isValidUUID: jest.fn(() => true),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

import { getPsychologistPatients, getAnamnesis, saveEvolution } from '@/lib/actions/patients'

const MOCK_PSYCH_USER = { id: VALID_UUID, email: 'p@p.com', app_metadata: { role: 'PSYCHOLOGIST' } }
const MOCK_PSYCH_PROFILE = { id: OTHER_UUID, userId: VALID_UUID }

describe('patients actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: MOCK_PSYCH_USER } })
    mockPrismaPsychProfileFindUnique.mockResolvedValue(MOCK_PSYCH_PROFILE)
    // Avoid "Data Isolation" errors by default
    const { prisma } = require('@/lib/prisma')
    prisma.patientPsychologistLink.findFirst = jest.fn().mockResolvedValue({ id: 'link_id' })
    mockPrismaApptFindFirst.mockResolvedValue({ id: 'appt_id' })
  })

  describe('getPsychologistPatients', () => {
    it('should return empty list if profile missing', async () => {
      mockPrismaPsychProfileFindUnique.mockResolvedValue(null)
      const res = await getPsychologistPatients(undefined)
      expect(res.success).toBe(true)
      if (!res.success) return
      expect(res.data).toEqual([])
    })
  })

  describe('getAnamnesis', () => {
    it('should decrypt data', async () => {
      mockPrismaAnamnesisFindFirst.mockResolvedValue({
        id: VALID_UUID,
        mainComplaint: 'encrypted-complaint',
      })
      const res = await getAnamnesis(OTHER_UUID)
      expect(res.success).toBe(true)
      if (!res.success || !res.data) return
      expect(res.data.mainComplaint).toBe('complaint')
    })
  })

  describe('saveEvolution', () => {
    it('should succeed with correct role and profile', async () => {
      mockPrismaEvolutionCreate.mockResolvedValue({ id: VALID_UUID })
      const res = await saveEvolution({
        patientId: OTHER_UUID,
        publicSummary: 'ps',
        privateNotes: 'pn',
      })
      expect(res.success).toBe(true)
    })
  })
})
