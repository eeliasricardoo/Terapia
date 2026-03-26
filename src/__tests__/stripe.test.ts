/**
 * Tests for Stripe Server Actions
 */

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: jest.fn() },
  })),
}))
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

jest.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    psychologistProfile: { findUnique: jest.fn() },
    appointment: { findMany: jest.fn(), create: jest.fn() },
    coupon: { findFirst: jest.fn(), update: jest.fn() },
    patientProfile: { findUnique: jest.fn() },
  },
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

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createStripeCheckoutSession } from '@/lib/actions/stripe'

const MOCK_USER = { id: 'patient-1', email: 'patient@test.com' }

function mockAuth(user: any) {
  ;(createClient as jest.Mock).mockResolvedValue({
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
  })
}

describe('stripe actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    // Default: no conflict
    ;(prisma.appointment.findMany as jest.Mock).mockResolvedValue([])
  })

  describe('createStripeCheckoutSession', () => {
    const validData = {
      psychologistId: 'psych-1',
      scheduledAt: '2026-04-01T14:00:00Z',
      durationMinutes: 50,
    }

    it('should return error if user is not authenticated', async () => {
      mockAuth(null)
      const result = await createStripeCheckoutSession(validData)
      expect(result).toEqual({ error: 'Não autenticado' })
    })

    it('should return error if psychologist is not found', async () => {
      mockAuth(MOCK_USER)
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue(null)

      const result = await createStripeCheckoutSession(validData)
      expect(result).toEqual({ error: 'Psicólogo não encontrado' })
    })

    it('should create appointment directly if price is zero (100% discount)', async () => {
      mockAuth(MOCK_USER)
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'psych-1',
        pricePerSession: 0,
        user: { name: 'Dr. Zero', profiles: { fullName: 'Dr. Zero' } },
      })
      ;(prisma.appointment.create as jest.Mock).mockResolvedValue({})

      const result = await createStripeCheckoutSession(validData)
      expect(result).toEqual({ url: expect.stringContaining('/dashboard?payment=success') })
    })

    it('should create Stripe checkout session with correct amount', async () => {
      mockAuth(MOCK_USER)
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'psych-1',
        pricePerSession: 150,
        user: { name: 'Dra. Ana Silva', profiles: { fullName: 'Dra. Ana Silva' } },
      })
      ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
        url: 'https://checkout.stripe.com/session-id',
      })

      const result = await createStripeCheckoutSession(validData)

      expect(result).toEqual({ url: 'https://checkout.stripe.com/session-id' })

      // Verify price in cents: R$ 150 = 15000 cents
      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['card', 'pix'],
          mode: 'payment',
          line_items: [
            expect.objectContaining({
              price_data: expect.objectContaining({
                currency: 'brl',
                unit_amount: 15000,
                product_data: expect.objectContaining({
                  name: expect.stringContaining('Dra. Ana Silva'),
                }),
              }),
              quantity: 1,
            }),
          ],
          metadata: expect.objectContaining({
            patientId: MOCK_USER.id,
            psychologistId: validData.psychologistId,
          }),
        })
      )
    })

    it('should include correct success and cancel URLs', async () => {
      mockAuth(MOCK_USER)
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'psych-1',
        pricePerSession: 100,
        user: { name: 'Dr. Test', profiles: { fullName: 'Dr. Test' } },
      })
      ;(stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
        url: 'https://checkout.stripe.com/test',
      })

      await createStripeCheckoutSession(validData)

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          success_url: expect.stringContaining('/dashboard?payment=success'),
          cancel_url: expect.stringContaining('/pagamento?payment=cancelled'),
        })
      )
    })

    it('should handle Stripe API errors gracefully', async () => {
      mockAuth(MOCK_USER)
      ;(prisma.psychologistProfile.findUnique as jest.Mock).mockResolvedValue({
        id: 'psych-1',
        pricePerSession: 100,
        user: { name: 'Dr. Test', profiles: { fullName: 'Dr. Test' } },
      })
      ;(stripe.checkout.sessions.create as jest.Mock).mockRejectedValue(
        new Error('Stripe API down')
      )

      const result = await createStripeCheckoutSession(validData)
      expect(result).toEqual({ error: 'Stripe API down' })
    })
  })
})
