import { saveAvailability, getPsychologistAvailability } from '../lib/actions/availability'
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

  describe('saveAvailability', () => {
    it('should correctly format and save weekly schedule', async () => {
      const recurringSchedules = [
        { id: '1', day: 'seg', startTime: '09:00 AM', endTime: '10:00 AM' },
        { id: '2', day: 'sex', startTime: '02:00 PM', endTime: '03:00 PM' },
      ]

      const result = await saveAvailability('50', recurringSchedules, [], [], [])

      expect(result.success).toBe(true)
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          weekly_schedule: expect.objectContaining({
            sessionDuration: '50',
            monday: { enabled: true, slots: [{ start: '09:00', end: '10:00' }] },
            friday: { enabled: true, slots: [{ start: '14:00', end: '15:00' }] },
          }),
        })
      )
    })

    it('should return error if not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

      const result = await saveAvailability('50', [], [], [], [])
      expect(result.success).toBe(false)
      expect(result.error).toBe('Usuário não autenticado')
    })
  })

  describe('getPsychologistAvailability', () => {
    it('should return null if profile fetch fails', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })

      const result = await getPsychologistAvailability('psych-1')
      expect(result).toBeNull()
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

      const result = await getPsychologistAvailability('psych-1')
      expect(result?.timezone).toBe('America/Sao_Paulo')
      expect(result?.overrides).toHaveProperty('2024-01-01')
    })
  })
})
