/**
 * Tests for Cancellation Policy and Refund Logic
 */

import { cancelAppointment } from '@/lib/actions/appointments'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { checkRateLimit } from '@/lib/security'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const PSYCH_ID = '123e4567-e89b-12d3-a456-426614174000'

jest.mock('@prisma/client', () => ({
  Prisma: {
    Decimal: jest.fn((v) => v),
  },
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    appointment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: { create: jest.fn() },
  },
}))

jest.mock('@/lib/stripe', () => ({
  stripe: {
    refunds: { create: jest.fn().mockResolvedValue({ id: 'ref_123' }) },
  },
}))

jest.mock('@/lib/security', () => ({
  checkRateLimit: jest.fn().mockResolvedValue({ success: true }),
}))

const mockGetUser = jest
  .fn()
  .mockResolvedValue({ data: { user: { id: VALID_UUID, email: 'p@p.com' } } })

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

jest.mock('@/lib/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}))

jest.mock('@/lib/utils/email-dispatch', () => ({
  dispatchEmailAsync: jest.fn().mockResolvedValue(undefined),
}))

describe('cancellation policy', () => {
  const APPT_ID = '550e8400-e29b-41d4-a716-446655440999'
  const mockAppointment = {
    id: APPT_ID,
    patientId: VALID_UUID,
    price: 150,
    scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h in future
    status: 'SCHEDULED',
    stripePaymentIntentId: 'pi_123',
    patient: { email: 'p@p.com', name: 'Patient', profiles: { fullName: 'Patient Full' } },
    psychologist: {
      userId: 'psych-1',
      user: { email: 'doc@doc.com', name: 'Doc', profiles: { fullName: 'Doc Full' } },
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(prisma.appointment.findUnique as jest.Mock).mockResolvedValue(mockAppointment)
    ;(prisma.appointment.update as jest.Mock).mockResolvedValue(mockAppointment)
  })

  it('should refund 100% if patient cancels > 24h before', async () => {
    const result = await cancelAppointment({ appointmentId: APPT_ID, reason: 'Change of plans' })

    if (!result.success) {
      console.error('Action failed:', result.error)
    }
    expect(result.success).toBe(true)
    expect(stripe.refunds.create).toHaveBeenCalled()
  })

  it('should refund 0% if patient cancels < 24h before', async () => {
    ;(prisma.appointment.findUnique as jest.Mock).mockResolvedValue({
      ...mockAppointment,
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2h in future
    })

    const result = await cancelAppointment({ appointmentId: APPT_ID, reason: 'Too late' })

    expect(result.success).toBe(true)
    expect(stripe.refunds.create).not.toHaveBeenCalled()
  })

  it('should refund 100% if psychologist cancels regardless of time', async () => {
    // Re-mock getUser for this specific test
    const { createClient } = require('@/lib/supabase/server')
    mockGetUser.mockResolvedValue({ data: { user: { id: 'psych-1', email: 'doc@doc.com' } } })
    ;(prisma.appointment.findUnique as jest.Mock).mockResolvedValue({
      ...mockAppointment,
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2h in future
    })

    const result = await cancelAppointment({ appointmentId: APPT_ID, reason: 'Emergency' })

    if (!result.success) {
      throw new Error(`Action failed with error: ${result.error}`)
    }
    expect(result.success).toBe(true)
    expect(stripe.refunds.create).toHaveBeenCalled()
  })

  it('should fail if session already occurred', async () => {
    ;(prisma.appointment.findUnique as jest.Mock).mockResolvedValue({
      ...mockAppointment,
      scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h in past
    })

    const result = await cancelAppointment({ appointmentId: APPT_ID, reason: 'Past session' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('já ocorreu')
    }
  })
})
