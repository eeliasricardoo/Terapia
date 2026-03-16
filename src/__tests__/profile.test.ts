import { getCurrentUserProfile, updateUserProfile } from '@/lib/actions/profile'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    profile: {
      create: jest.fn(),
    },
  },
}))

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: any) => fn, // bypass React cache for testing
}))

describe('profile actions', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@test.com',
    user_metadata: { full_name: 'Test User', role: 'PATIENT' },
  }

  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  describe('getCurrentUserProfile', () => {
    it('should return null if user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Auth error'),
      })
      const result = await getCurrentUserProfile()
      expect(result).toBeNull()
    })

    it('should return existing profile', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })
      const existingProfile = { id: 'prof-1', role: 'PATIENT', full_name: 'Test User' }
      mockSupabase.single.mockResolvedValueOnce({ data: existingProfile, error: null })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user-1',
        role: 'PATIENT',
      })

      const result = await getCurrentUserProfile()
      expect(result).toEqual(existingProfile)
    })

    it('should recreate missing profile automatically', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })
      // Simulate profile missing in Supabase check
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } })

      const newProfile = { id: 'new-prof', role: 'PATIENT', fullName: 'Test User' }
      ;(prisma.user.upsert as jest.Mock).mockResolvedValue({ id: 'user-1' })
      ;(prisma.profile.create as jest.Mock).mockResolvedValue(newProfile)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', role: 'PATIENT' })

      const result = await getCurrentUserProfile()

      // Prisma upsert should have been called for the user
      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          create: expect.objectContaining({ email: 'test@test.com', name: 'Test User' }),
        })
      )

      // Prisma create should have been called for the profile
      expect(prisma.profile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            user_id: mockUser.id,
            fullName: 'Test User',
            role: 'PATIENT',
          }),
        })
      )

      expect(result).toEqual(newProfile)
    })

    it('should auto-sync role if user table diffs from profile', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })
      const existingProfile = { id: 'prof-1', role: 'PSYCHOLOGIST', full_name: 'Test User' }
      mockSupabase.single.mockResolvedValueOnce({ data: existingProfile, error: null })
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user-1',
        role: 'PATIENT',
      })

      const result = await getCurrentUserProfile()

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'PSYCHOLOGIST' },
      })
      expect(result).toEqual(existingProfile)
    })
  })

  describe('updateUserProfile', () => {
    it('should return error if not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })
      const result = await updateUserProfile({ full_name: 'New Name' })
      expect(result.success).toBe(false)
      expect(result.error).toBe('Not authenticated')
    })

    it('should update profile and return success', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })
      mockSupabase.eq.mockResolvedValueOnce({ error: null }) // final update step

      const result = await updateUserProfile({ full_name: 'New Name' })
      expect(result.success).toBe(true)
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({ full_name: 'New Name' })
      )
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUser.id)
    })

    it('should return error on DB failure', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: mockUser }, error: null })
      mockSupabase.eq.mockResolvedValueOnce({ error: { message: 'DB Issue' } })

      const result = await updateUserProfile({ full_name: 'New Name' })
      expect(result.success).toBe(false)
      expect(result.error).toBe('DB Issue')
    })
  })
})
