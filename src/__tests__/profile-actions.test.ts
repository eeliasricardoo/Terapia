import { uploadProfileImage, updateUserProfile } from '../app/[locale]/dashboard/perfil/actions'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { checkRateLimit } from '@/lib/security'
import { headers } from 'next/headers'

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/security', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ success: true }),
}))

jest.mock('next/headers', () => ({
  headers: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue('127.0.0.1'),
  }),
}))

describe('profile actions', () => {
  const mockUser = { id: 'user-1', user_metadata: { full_name: 'Original Name' } }

  const mockSupabase = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    },
  }

  const mockAdminSupabase = {
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'http://cdn/avatar.png' } }),
    },
    from: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue({ data: [mockUser], error: null }),
    auth: {
      admin: {
        updateUserById: jest.fn().mockResolvedValue({ error: null }),
      },
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key'
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(createAdminClient as jest.Mock).mockReturnValue(mockAdminSupabase)
  })

  describe('uploadProfileImage', () => {
    it('should return error if file type is invalid', async () => {
      const formData = new FormData()
      const badFile = new File(['dummy'], 'test.txt', { type: 'text/plain' })
      formData.append('file', badFile)

      const result = await uploadProfileImage(formData)
      expect(result.error).toContain('Tipo de arquivo inválido')
    })

    it('should return error if file size is too large', async () => {
      const formData = new FormData()
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.png', {
        type: 'image/png',
      })
      formData.append('file', largeFile)

      const result = await uploadProfileImage(formData)
      expect(result.error).toContain('máximo 5MB')
    })

    it('should succeed with valid image', async () => {
      const formData = new FormData()
      const validFile = new File(['dummy content'], 'avatar.png', { type: 'image/png' })
      // Polyfill arrayBuffer for jsdom if missing
      Object.defineProperty(validFile, 'arrayBuffer', {
        value: jest.fn().mockResolvedValue(new ArrayBuffer(13)),
        writable: true,
      })
      formData.append('file', validFile)

      const result = await uploadProfileImage(formData)

      expect(result.success).toBe(true)
      expect(mockAdminSupabase.storage.upload).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/perfil')
    })

    it('should handle rate limiting', async () => {
      ;(checkRateLimit as jest.Mock).mockResolvedValueOnce({ success: false })

      const formData = new FormData()
      formData.append('file', new File([''], 'test.png', { type: 'image/png' }))

      const result = await uploadProfileImage(formData)
      expect(result.error).toContain('Muitos uploads')
    })
  })

  describe('updateUserProfile', () => {
    it('should update profile and metadata', async () => {
      const updateData = {
        name: 'New Name',
        phone: '123456789',
        city: 'São Paulo',
      }

      const result = await updateUserProfile(updateData)

      expect(result.success).toBe(true)
      expect(mockAdminSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          full_name: 'New Name',
          city: 'São Paulo',
        })
      )
      expect(mockAdminSupabase.auth.admin.updateUserById).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          user_metadata: expect.objectContaining({ full_name: 'New Name' }),
        })
      )
    })

    it('should return error if admin update fails', async () => {
      // Setup the chain to fail
      const mockEq = jest.fn().mockResolvedValue({ error: { message: 'Update failed' } })
      mockAdminSupabase.update.mockReturnValue({ eq: mockEq })

      const result = await updateUserProfile({ name: 'Test', phone: '123' })
      expect(result.error).toContain('Erro ao atualizar perfil')
      expect(result.error).toContain('Update failed')
    })
  })
})
