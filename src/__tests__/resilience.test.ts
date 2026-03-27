/**
 * Tests for Deep Resilience (Race Conditions, Stripe Edge Cases, Security)
 */

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn() },
  })),
}))

jest.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: { sessions: { create: jest.fn() } },
    refunds: { create: jest.fn() },
    accounts: { create: jest.fn(), retrieve: jest.fn(), createLoginLink: jest.fn() },
    accountLinks: { create: jest.fn() },
  },
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    psychologistProfile: { findUnique: jest.fn(), update: jest.fn() },
    appointment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    coupon: { findFirst: jest.fn(), update: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn() },
    notification: { create: jest.fn() },
  },
}))

jest.mock('@/lib/utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

jest.mock('@/lib/security', () => ({
  encryptData: jest.fn((data) => `encrypted-val-${data}`),
  decryptData: jest.fn((data) => data.replace('encrypted-val-', '')),
  isValidUUID: jest.fn(() => true),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

jest.mock('@/lib/actions/appointments-utils', () => ({
  checkAppointmentConflict: jest.fn().mockResolvedValue({ hasConflict: false }),
}))

import { createStripeCheckoutSession } from '@/lib/actions/stripe'
import { cancelSession } from '@/lib/actions/sessions'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

describe('Deep Resilience Tests', () => {
  const MOCK_USER = { id: '550e8400-e29b-41d4-a716-446655440000', email: 'test@user.com' }
  const PSYCH_ID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: MOCK_USER } }) },
    })
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  })

  // 1. PILLAR: STRIPE RESILIENCE
  describe('Stripe Resilience', () => {
    it('should NOT mark session as CANCELED if Stripe refund fails', async () => {
      const sessionId = '550e8400-e29b-41d4-a716-446655440111'
      ;(prisma.appointment.findUnique as jest.Mock).mockResolvedValue({
        id: sessionId,
        patientId: MOCK_USER.id,
        price: 150,
        paymentMethod: 'Stripe',
        stripePaymentIntentId: 'pi_test',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'SCHEDULED',
        psychologist: { userId: '6ba7b810-9dad-11d1-80b4-00c04fd43222' },
      })

      // Simulate Stripe failure
      ;(stripe.refunds.create as jest.Mock).mockRejectedValue(new Error('Stripe Down'))

      const result = await cancelSession(sessionId)
      expect(result).toMatchObject({
        success: false,
        error: expect.stringContaining('Stripe Down'),
      })

      // Verify that appointment was NOT updated to CANCELED
      expect(prisma.appointment.update).not.toHaveBeenCalled()
    })

    it('should throw error if Stripe Connect onboarding is incomplete', async () => {
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue({
        id: PSYCH_ID,
        pricePerSession: 100,
        stripeAccountId: 'acct_123',
        stripeOnboardingComplete: false,
        user: { name: 'Dr. Test', profiles: { fullName: 'Dr. Test' } },
      })

      const schemaResult = await createStripeCheckoutSession({
        psychologistId: PSYCH_ID,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        durationMinutes: 50,
      })

      expect(schemaResult).toMatchObject({
        success: false,
        error: expect.stringContaining('configuração de pagamentos'),
      })
    })
  })

  // 2. PILLAR: SECURITY & LGPD INTEGRITY
  describe('Security & Privacy (LGPD)', () => {
    it('logger should mask sensitive health data in JSON format', () => {
      const sensitiveObj = {
        publicSummary: 'Sensitive health info',
        patient: { document: '123.456.789-00' },
      }

      const { logger: realLogger } = jest.requireActual('@/lib/utils/logger')
      const spy = jest.spyOn(console, 'log').mockImplementation()

      const originalEnv = process.env.NODE_ENV
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' })

      realLogger.info('Testing LGPD mask', sensitiveObj)

      const lastCallArgs = JSON.parse(spy.mock.calls[0][0])
      expect(lastCallArgs.data.publicSummary).toBe('[MASCARADO PELO LOGGER (LGPD)]')
      expect(lastCallArgs.data.patient.document).toBe('[MASCARADO PELO LOGGER (LGPD)]')

      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv })
      spy.mockRestore()
    })
  })
})
