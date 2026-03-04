import { getPsychologistDashboardData, getPatientDashboardData } from '@/lib/actions/dashboard'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

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
      count: jest.fn(),
    },
  },
}))

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}))

describe('dashboard actions', () => {
  const mockUser = { id: 'user-1', email: 'test@test.com' }
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('getPsychologistDashboardData', () => {
    it('should throw error if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })
      await expect(getPsychologistDashboardData()).rejects.toThrow('Não autenticado')
    })

    it('should return empty baseline if profile not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser } })
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValueOnce(null)

      const result = await getPsychologistDashboardData()
      expect(result.stats.sessionsToday).toBe(0)
      expect(result.upcomingSessions).toEqual([])
    })

    it('should calculate and return correct dashboard data for psychologist', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser } })
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'psych-1',
        isVerified: true,
      })

      // mock today sessions
      ;(prisma.appointment.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: 'app-1',
          scheduledAt: new Date(new Date().setHours(14, 0, 0, 0)),
          status: 'SCHEDULED',
          durationMinutes: 50,
          patientId: 'patient-1',
          patient: { profiles: { fullName: 'John Doe' } },
        },
      ])

      // mock links
      ;(prisma.patientPsychologistLink.findMany as jest.Mock).mockResolvedValueOnce([
        { id: 'link-1' },
      ]) // active
      ;(prisma.patientPsychologistLink.count as jest.Mock).mockResolvedValueOnce(2) // total

      // mock monthly sessions
      ;(prisma.appointment.findMany as jest.Mock).mockResolvedValueOnce([
        { price: 100 },
        { price: 150 },
      ])

      // mock recent patients via last apps
      ;(prisma.appointment.findMany as jest.Mock).mockResolvedValueOnce([
        {
          patientId: 'patient-1',
          scheduledAt: new Date(),
          patient: { profiles: { fullName: 'John Doe' } },
        },
      ])

      const result = await getPsychologistDashboardData()

      expect(result.isVerified).toBe(true)
      expect(result.stats.sessionsToday).toBe(1)
      expect(result.stats.activePatients).toBe(1)
      expect(result.stats.totalPatients).toBe(2)
      expect(result.stats.monthlyRevenue).toBe(250) // 100 + 150
      expect(result.upcomingSessions[0].patientName).toBe('John Doe')
      expect(result.upcomingSessions[0].details).toBe('Aguardando início')
    })
  })

  describe('getPatientDashboardData', () => {
    it('should return error baseline on exception (e.g. not authenticated)', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } })
      const result = await getPatientDashboardData()
      expect(result).toEqual({ nextSession: null, recentSessions: [] })
    })

    it('should fetch next session and recent sessions', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser } })

      const now = new Date().toISOString()

      const chainObj: any = {}
      chainObj.single = jest.fn().mockResolvedValueOnce({
        data: {
          id: 'sess-1',
          scheduled_at: now,
          duration_minutes: 50,
          psychologist: { full_name: 'Dr. John' },
        },
      })
      chainObj.then = (resolve: any) =>
        resolve({
          data: [
            {
              id: 'sess-2',
              scheduled_at: now,
              status: 'COMPLETED',
              psychologist: { full_name: 'Dr. John' },
            },
          ],
        })

      mockSupabase.limit.mockReturnValue(chainObj)

      const result = await getPatientDashboardData()

      expect(result.nextSession?.psychologist.name).toBe('Dr. John')
      expect(result.recentSessions[0].psychologistName).toBe('Dr. John')
      expect(result.recentSessions[0].status).toBe('completed')
    })
  })
})
