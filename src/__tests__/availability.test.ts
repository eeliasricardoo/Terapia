import { getPsychologistAvailability } from '../lib/actions/availability'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('availability actions', () => {
  const mockUser = { id: 'user-1' }
  const mockProfile = { id: 'psych-1', userId: 'user-1' }

  const mockSupabase = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('getPsychologistAvailability', () => {
    it('should return null data if profile fetch fails', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })

      const result = await getPsychologistAvailability({ userId: 'psych-1' })
      expect(result.success).toBe(true)
      expect(result.success && result.data).toBeNull()
    })

    it('should return full availability data', async () => {
      // Mock profile
      mockSupabase.single.mockResolvedValueOnce({
        data: { weekly_schedule: { sessionDuration: '50' }, timezone: 'America/Sao_Paulo' },
        error: null,
      })
      // Mock overrides
      mockSupabase.select.mockImplementation((query) => {
        if (query === 'date, type, slots') {
          return {
            eq: () => ({
              gte: () =>
                Promise.resolve({
                  data: [{ date: '2024-01-01', type: 'blocked', slots: [] }],
                  error: null,
                }),
            }),
          } as any
        }
        if (query === 'scheduled_at, duration_minutes') {
          return {
            eq: () => ({ gte: () => ({ neq: () => Promise.resolve({ data: [], error: null }) }) }),
          } as any
        }
        return mockSupabase
      })

      const result = await getPsychologistAvailability({ userId: 'psych-1' })
      expect(result.success).toBe(true)
      if (result.success && result.data) {
        expect(result.data.timezone).toBe('America/Sao_Paulo')
        expect(result.data.overrides).toHaveProperty('2024-01-01')
      }
    })
  })
})
