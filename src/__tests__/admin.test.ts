/**
 * Tests for admin actions
 * Critical flow: psychologist approval and rejection
 */

import { verifyPsychologist, rejectPsychologist } from '@/lib/actions/admin'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/utils/email'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    profile: {
      findUnique: jest.fn(),
    },
    psychologistProfile: {
      update: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
  },
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
  })),
}))

jest.mock('@/lib/utils/email', () => ({
  sendEmail: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

describe('Admin Actions - Psychologist Approval/Rejection', () => {
  const mockAdminUser = {
    id: 'admin-user-123',
    email: 'admin@example.com',
  }

  const mockAdminProfile = {
    id: 'admin-profile-123',
    user_id: mockAdminUser.id,
    role: 'ADMIN',
  }

  const mockPsychologist = {
    id: 'psych-123',
    userId: 'psych-user-456',
    crp: '06/123456',
    isVerified: false,
    suspensionReason: null,
    user: {
      id: 'psych-user-456',
      email: 'psych@example.com',
      profiles: {
        fullName: 'Dr. João Silva',
      },
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mocks
    const { createClient } = require('@/lib/supabase/server')
    createClient.mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockAdminUser },
          error: null,
        }),
      },
    })
  })

  describe('verifyPsychologist', () => {
    it('should approve psychologist and send email', async () => {
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue(mockAdminProfile)
      ;(prisma.psychologistProfile.update as jest.Mock).mockResolvedValue(mockPsychologist)
      ;(sendEmail as jest.Mock).mockResolvedValue({ success: true })

      const result = await verifyPsychologist('psych-123')

      expect(result.success).toBe(true)
      expect(prisma.psychologistProfile.update).toHaveBeenCalledWith({
        where: { id: 'psych-123' },
        data: { isVerified: true, suspensionReason: null },
        include: {
          user: { include: { profiles: true } },
        },
      })
      expect(sendEmail).toHaveBeenCalledWith({
        to: 'psych@example.com',
        subject: 'Bem-vindo à Terapia! Seu perfil foi aprovado',
        html: expect.any(String),
      })
    })

    it('should reject if user is not authenticated', async () => {
      const { createClient } = require('@/lib/supabase/server')
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      })

      const result = await verifyPsychologist('psych-123')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Falha')
      expect(prisma.psychologistProfile.update).not.toHaveBeenCalled()
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('should reject if user is not an admin', async () => {
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue({
        ...mockAdminProfile,
        role: 'PATIENT', // Not an admin
      })

      const result = await verifyPsychologist('psych-123')

      expect(result.success).toBe(false)
      expect(prisma.psychologistProfile.update).not.toHaveBeenCalled()
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue(mockAdminProfile)
      ;(prisma.psychologistProfile.update as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const result = await verifyPsychologist('psych-123')

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('should continue even if email fails', async () => {
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue(mockAdminProfile)
      ;(prisma.psychologistProfile.update as jest.Mock).mockResolvedValue(mockPsychologist)
      ;(sendEmail as jest.Mock).mockResolvedValue({ success: false, error: 'Email failed' })

      const result = await verifyPsychologist('psych-123')

      // Approval should still succeed even if email fails
      expect(result.success).toBe(true)
      expect(prisma.psychologistProfile.update).toHaveBeenCalled()
    })
  })

  describe('rejectPsychologist', () => {
    it('should reject psychologist and send notification email', async () => {
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue(mockAdminProfile)
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(mockPsychologist)
      ;(prisma.psychologistProfile.delete as jest.Mock).mockResolvedValue(mockPsychologist)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({})
      ;(sendEmail as jest.Mock).mockResolvedValue({ success: true })

      const result = await rejectPsychologist('psych-123', 'Documentação inválida')

      expect(result.success).toBe(true)
      expect(prisma.psychologistProfile.delete).toHaveBeenCalledWith({
        where: { id: 'psych-123' },
      })
      expect(prisma.user.update).toHaveBeenCalled()
      expect(sendEmail).toHaveBeenCalledWith({
        to: 'psych@example.com',
        subject: 'Atualização do seu cadastro na Terapia',
        html: expect.any(String),
      })
    })

    it('should reject if user is not authenticated', async () => {
      const { createClient } = require('@/lib/supabase/server')
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      })

      const result = await rejectPsychologist('psych-123', 'Invalid docs')

      expect(result.success).toBe(false)
      expect(prisma.psychologistProfile.delete).not.toHaveBeenCalled()
    })

    it('should reject if user is not an admin', async () => {
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue({
        ...mockAdminProfile,
        role: 'PSYCHOLOGIST', // Not an admin
      })

      const result = await rejectPsychologist('psych-123', 'Invalid docs')

      expect(result.success).toBe(false)
      expect(prisma.psychologistProfile.delete).not.toHaveBeenCalled()
    })

    it('should handle missing psychologist', async () => {
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue(mockAdminProfile)
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await rejectPsychologist('psych-123', 'Invalid docs')

      expect(result.success).toBe(false)
      expect(prisma.psychologistProfile.delete).not.toHaveBeenCalled()
    })

    it('should handle database errors during rejection', async () => {
      ;(prisma.profile.findUnique as jest.Mock).mockResolvedValue(mockAdminProfile)
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(mockPsychologist)
      ;(prisma.psychologistProfile.delete as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      )

      const result = await rejectPsychologist('psych-123', 'Invalid docs')

      expect(result.success).toBe(false)
      expect(sendEmail).not.toHaveBeenCalled()
    })
  })
})
