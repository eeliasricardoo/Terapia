/**
 * Tests for sessions Server Actions
 */

const mockGetUser = jest.fn()
const mockFrom = jest.fn()
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

jest.mock('@/lib/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

jest.mock('@upstash/ratelimit', () => ({ Ratelimit: jest.fn() }))
jest.mock('@upstash/redis', () => ({ Redis: jest.fn() }))

jest.mock('@/lib/security', () => ({
  encryptData: jest.fn((data) => `encrypted-${data}`),
  decryptData: jest.fn((data) => data.replace('encrypted-', '')),
  isValidUUID: jest.fn(() => true),
}))

import {
  getUserSessions,
  getNextSession,
  getSessionHistory,
  createSession,
  cancelSession,
} from '@/lib/actions/sessions'

const MOCK_USER = { id: 'user-1', email: 'test@test.com' }

// Helper to build chainable Supabase mock
function mockSupabaseQuery(data: any = null, error: any = null) {
  const chain: any = {
    select: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error }),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    // When chain ends without single(), resolve data
  }
  // Make final resolution work for non-single queries
  chain.order.mockImplementation(() => {
    chain.then = (resolve: any) => resolve({ data: data ? [data] : [], error })
    return chain
  })

  // Override for methods that should resolve
  const originalLimit = chain.limit
  chain.limit = jest.fn().mockImplementation(() => {
    return chain
  })

  mockFrom.mockReturnValue(chain)
  return chain
}

describe('sessions actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserSessions', () => {
    it('should return empty array on supabase error', async () => {
      const chain = mockSupabaseQuery(null, { message: 'Error' })
      // Override the order to resolve with error
      chain.order.mockResolvedValue({ data: null, error: { message: 'Error' } })

      const result = await getUserSessions('user-1')
      expect(result).toEqual([])
    })

    it('should call supabase with correct user filter', async () => {
      const chain = mockSupabaseQuery()
      chain.order.mockResolvedValue({ data: [], error: null })

      await getUserSessions('user-1')

      expect(mockFrom).toHaveBeenCalledWith('appointments')
      expect(chain.or).toHaveBeenCalledWith('patient_id.eq.user-1,psychologist_id.eq.user-1')
    })
  })

  describe('createSession', () => {
    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const result = await createSession({
        patientId: 'patient-1',
        psychologistId: 'psych-1',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 50,
      })

      expect(result).toEqual({ success: false, error: 'Usuário não autenticado' })
    })

    it('should reject session creation by unauthorized user (spoofing prevention)', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'attacker-id' } },
      })

      const result = await createSession({
        patientId: 'patient-1',
        psychologistId: 'psych-1',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 50,
      })

      expect(result).toEqual({
        success: false,
        error: 'Acesso negado. Você não pode agendar para terceiros.',
      })
    })

    it('should return error when psychologist not found', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
      const chain = mockSupabaseQuery(null, { message: 'Not found' })

      const result = await createSession({
        patientId: MOCK_USER.id,
        psychologistId: 'psych-1',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 50,
      })

      expect(result.success).toBe(false)
    })
  })

  describe('cancelSession', () => {
    it('should return error if user is not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await cancelSession('session-1')
      expect(result).toEqual({ success: false, error: 'Usuário não autenticado' })
    })

    it('should return error if session is not found', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
      const chain = mockSupabaseQuery(null, { message: 'Not found' })

      const result = await cancelSession('session-nonexistent')

      expect(result).toEqual({ success: false, error: 'Sessão não encontrada' })
    })

    it('should reject cancellation by unauthorized user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: MOCK_USER } })
      const chain = mockSupabaseQuery()
      chain.single.mockResolvedValue({
        data: { patient_id: 'other-user', psychologist_id: 'other-psych' },
        error: null,
      })

      const result = await cancelSession('session-1')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Acesso negado')
    })
  })
})
