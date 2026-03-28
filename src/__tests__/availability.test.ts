import { getPsychologistAvailability } from '../lib/actions/availability'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase (needed for createSafeAction auth check)
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    psychologistProfile: {
      findFirst: jest.fn(),
    },
    scheduleOverride: {
      findMany: jest.fn(),
    },
    appointment: {
      findMany: jest.fn(),
    },
  },
}))

import { prisma } from '@/lib/prisma'

describe('availability actions', () => {
  const mockUser = { id: 'user-1' }

  const mockSupabase = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(prisma.scheduleOverride.findMany as jest.Mock).mockResolvedValue([])
    ;(prisma.appointment.findMany as jest.Mock).mockResolvedValue([])
  })

  describe('getPsychologistAvailability', () => {
    it('should return null data if profile fetch fails', async () => {
      ;(prisma.psychologistProfile.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await getPsychologistAvailability({
        userId: '550e8400-e29b-41d4-a716-446655440001',
      })
      expect(result.success).toBe(true)
      expect(result.success && result.data).toBeNull()
    })

    it('should return full availability data', async () => {
      ;(prisma.psychologistProfile.findFirst as jest.Mock).mockResolvedValue({
        id: 'psych-profile-1',
        weeklySchedule: { sessionDuration: '50' },
        timezone: 'America/Sao_Paulo',
        userId: 'user-1',
      })
      ;(prisma.scheduleOverride.findMany as jest.Mock).mockResolvedValue([
        { date: '2024-01-01', type: 'blocked', slots: [] },
      ])
      ;(prisma.appointment.findMany as jest.Mock).mockResolvedValue([])

      const result = await getPsychologistAvailability({
        userId: '550e8400-e29b-41d4-a716-446655440001',
      })
      expect(result.success).toBe(true)
      if (result.success && result.data) {
        expect(result.data.timezone).toBe('America/Sao_Paulo')
        expect(result.data.overrides).toHaveProperty('2024-01-01')
      }
    })
  })
})
