/**
 * Tests for Stripe Dispute Webhook Handlers
 */

process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'

import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: { create: jest.fn() },
  },
}))

jest.mock('@/lib/env', () => ({
  env: {
    STRIPE_WEBHOOK_SECRET: 'whsec_test',
  },
}))

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: async () => data,
    })),
  },
}))

jest.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}))

jest.mock('@/lib/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}))

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}))

jest.mock('@/lib/actions/notifications', () => ({
  sendDisputeNotificationToAdmins: jest.fn().mockResolvedValue(undefined),
  sendAppointmentNotifications: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('next/headers', () => ({
  headers: jest.fn(async () => ({
    get: jest.fn((name) => (name === 'stripe-signature' ? 'sig' : null)),
  })),
}))

import { POST } from '@/app/api/webhooks/stripe/route'

describe('stripe dispute webhook', () => {
  const mockAppointment = {
    id: 'appt-123',
    stripePaymentIntentId: 'pi_dispute',
    status: 'SCHEDULED',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(prisma.appointment.findUnique as jest.Mock).mockResolvedValue(mockAppointment)
    ;(prisma.appointment.update as jest.Mock).mockResolvedValue(mockAppointment)
  })

  const createRequest = (eventType: string, disputeData: any) => {
    const payload = JSON.stringify({ type: eventType, data: { object: disputeData } })
    return new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: payload,
      headers: { 'stripe-signature': 'sig' },
    })
  }

  it('should handle charge.dispute.created', async () => {
    const dispute = {
      id: 'dp_1',
      payment_intent: 'pi_dispute',
      amount: 15000,
      reason: 'fraudulent',
      status: 'needs_response',
    }

    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'charge.dispute.created',
      data: { object: dispute },
    })

    const req = createRequest('charge.dispute.created', dispute)
    await POST(req)

    expect(prisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'appt-123' },
        data: { status: 'DISPUTED', disputeOutcome: 'OPEN' },
      })
    )

    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'DISPUTE_CREATED' }),
      })
    )
  })

  it('should handle charge.dispute.closed as won', async () => {
    const dispute = {
      id: 'dp_1',
      payment_intent: 'pi_dispute',
      status: 'won',
    }

    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'charge.dispute.closed',
      data: { object: dispute },
    })

    const req = createRequest('charge.dispute.closed', dispute)
    await POST(req)

    expect(prisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { disputeOutcome: 'WON' },
      })
    )
    // Ensure we DON'T overwrite appointment status anymore
    expect(prisma.appointment.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: expect.any(String) }),
      })
    )
  })

  it('should handle charge.dispute.funds_withdrawn', async () => {
    const dispute = { id: 'dp_1', payment_intent: 'pi_dispute', status: 'lost' }
    ;(stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
      type: 'charge.dispute.funds_withdrawn',
      data: { object: dispute },
    })

    const req = createRequest('charge.dispute.funds_withdrawn', dispute)
    await POST(req)

    expect(prisma.appointment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { disputeOutcome: 'FUNDS_WITHDRAWN' },
      })
    )
  })
})
