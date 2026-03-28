/**
 * Tests for onboarding Server Actions
 */

jest.mock('@upstash/ratelimit', () => ({ Ratelimit: jest.fn() }))
jest.mock('@upstash/redis', () => ({ Redis: jest.fn() }))

const mockGetUser = jest.fn()
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    profile: {
      update: jest.fn(),
    },
    psychologistProfile: {
      upsert: jest.fn(),
    },
  },
}))

import { savePsychologistProfile, type PsychologistOnboardingData } from '@/lib/actions/onboarding'
import { prisma } from '@/lib/prisma'

const MOCK_USER = {
  id: 'psych-user-1',
  email: 'psych@test.com',
  app_metadata: { role: 'PSYCHOLOGIST' },
}

const VALID_DATA: PsychologistOnboardingData = {
  fullName: 'Dra. Ana Maria Silva',
  crp: '06/123456',
  specialties: ['Ansiedade', 'Depressão'],
  approaches: ['TCC', 'Humanista'],
  bio: '<p>Psicóloga clínica com 10 anos de experiência.</p>',
  price: 150,
  videoUrl: 'https://youtube.com/watch?v=example',
}

describe('onboarding actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(prisma.profile.update as jest.Mock).mockResolvedValue({})
    ;(prisma.psychologistProfile.upsert as jest.Mock).mockResolvedValue({})
  })

  describe('savePsychologistProfile', () => {
    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'Not auth' } })

      const result = await savePsychologistProfile(VALID_DATA)

      expect(result.success).toBe(false)
      expect(result.success === false && result.code).toBe('UNAUTHENTICATED')
    })

    it('should successfully save psychologist profile', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

      const result = await savePsychologistProfile(VALID_DATA)

      expect(result.success).toBe(true)
      expect(prisma.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: MOCK_USER.id },
        })
      )
      expect(prisma.psychologistProfile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: MOCK_USER.id },
        })
      )
    })

    it('should return error when profile update fails', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })
      ;(prisma.profile.update as jest.Mock).mockRejectedValue(new Error('Profile update failed'))

      const result = await savePsychologistProfile(VALID_DATA)

      expect(result.success).toBe(false)
    })

    it('should sanitize input data (XSS prevention)', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

      const xssData: PsychologistOnboardingData = {
        ...VALID_DATA,
        fullName: '<script>alert("xss")</script>Dra. Hacker',
        bio: '<p>Bio legítima</p><script>evil()</script>',
        crp: '<img onerror="hack()">06/999999',
      }

      await savePsychologistProfile(xssData)

      const profileUpdateCall = (prisma.profile.update as jest.Mock).mock.calls[0][0]
      expect(profileUpdateCall.data.fullName).not.toContain('<script>')
    })

    it('should merge specialties and approaches', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null })

      await savePsychologistProfile(VALID_DATA)

      const upsertCall = (prisma.psychologistProfile.upsert as jest.Mock).mock.calls[0][0]
      const allItems = upsertCall.create.specialties
      expect(allItems).toEqual(
        expect.arrayContaining(['Ansiedade', 'Depressão', 'TCC', 'Humanista'])
      )
    })
  })
})
