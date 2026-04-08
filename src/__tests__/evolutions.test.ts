/**
 * Tests for evolutions Server Actions
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
    profile: { findUnique: jest.fn() },
    evolution: { findMany: jest.fn() },
    psychologistProfile: { findMany: jest.fn() },
  },
}))

jest.mock('@/lib/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getPatientPublicEvolutions } from '@/lib/actions/evolutions'

const MOCK_USER = { id: 'user-1', email: 'test@test.com' }

function mockAuth(user: Record<string, unknown> | null) {
  ;(createClient as jest.Mock).mockResolvedValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
  })
}

describe('evolutions actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPatientPublicEvolutions', () => {
    it('should return error if user is not authenticated', async () => {
      mockAuth(null)
      const result = await getPatientPublicEvolutions()
      expect(result.success).toBe(false)
    })

    it('should return empty array if profile is not found', async () => {
      mockAuth(MOCK_USER)
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await getPatientPublicEvolutions()
      expect(result.success).toBe(true)
      expect(result.success && result.data).toEqual([])
    })

    it('should return formatted evolutions with psychologist names', async () => {
      mockAuth(MOCK_USER)
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue({ id: 'profile-1' })

      const now = new Date('2026-03-01T10:00:00Z')
      ;(prisma.evolution.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'ev-1',
          patientId: 'profile-1',
          psychologistId: 'psych-1',
          publicSummary: 'Progresso',
          mood: 'Bem',
          date: now,
        },
        {
          id: 'ev-2',
          patientId: 'profile-1',
          psychologistId: 'psych-2',
          publicSummary: null,
          mood: 'Neutro',
          date: now,
        },
      ])
      ;(prisma.psychologistProfile.findMany as jest.Mock).mockResolvedValue([
        { id: 'psych-1', user: { name: 'Dra. Ana' } },
        { id: 'psych-2', user: { name: 'Dr. Carlos' } },
      ])

      const result = await getPatientPublicEvolutions()

      expect(result.success).toBe(true)
      if (!result.success) return
      expect(result.data).toHaveLength(2)
      expect(result.data[0]).toEqual(
        expect.objectContaining({ id: 'ev-1', psychologistName: 'Dra. Ana', mood: 'Bem' })
      )
      expect(result.data[1]).toEqual(
        expect.objectContaining({ id: 'ev-2', psychologistName: 'Dr. Carlos', publicSummary: null })
      )
    })

    it('should return error on DB exception', async () => {
      mockAuth(MOCK_USER)
      ;(prisma.profile.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'))

      const result = await getPatientPublicEvolutions()
      expect(result.success).toBe(false)
    })

    it('should use fallback name when psychologist is not found', async () => {
      mockAuth(MOCK_USER)
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue({ id: 'profile-1' })
      ;(prisma.evolution.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'ev-1',
          psychologistId: 'unknown',
          publicSummary: 'S',
          mood: 'Bem',
          date: new Date(),
        },
      ])
      ;(prisma.psychologistProfile.findMany as jest.Mock).mockResolvedValue([])

      const result = await getPatientPublicEvolutions()
      expect(result.success).toBe(true)
      expect(result.success && result.data[0].psychologistName).toBe('Psicólogo')
    })
  })
})
