'use server'

import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { revalidateTag } from 'next/cache'
import { sendAppointmentNotifications } from './notifications'
import { checkAppointmentConflict } from './appointments-utils'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

const createCheckoutSchema = z.object({
  psychologistId: z.string().uuid('ID de psicólogo inválido'),
  scheduledAt: z.string().datetime('Data de agendamento inválida'),
  durationMinutes: z.number().int().min(15).max(180),
  couponCode: z.string().optional(),
  returnUrl: z.string().optional(),
})

export const createStripeCheckoutSession = createSafeAction(
  createCheckoutSchema,
  async (data, user) => {
    // 1. Fetch psychologist info for price and name
    let psych = await prisma.psychologistProfile.findUnique({
      where: { id: data.psychologistId },
      include: { user: { include: { profiles: true } } },
    })

    // If not found by ID, try by userId (compatibility)
    if (!psych) {
      psych = await prisma.psychologistProfile.findUnique({
        where: { userId: data.psychologistId },
        include: { user: { include: { profiles: true } } },
      })
    }

    if (!psych) throw new Error('Psicólogo não encontrado')

    // Parse via string to avoid float imprecision from Decimal→Number conversion
    const price = parseFloat(psych.pricePerSession?.toString() ?? '0') || 0
    let finalPrice = price

    // 1b. Apply Coupon if exists
    if (data.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: data.couponCode.toUpperCase(),
          active: true,
          psychologistId: psych.id, // Security: coupon must belong to THIS psych
        },
      })

      if (coupon) {
        // Validate max uses
        if (coupon.maxUses !== null && coupon.used >= coupon.maxUses) {
          throw new Error('Este cupom já atingiu o limite de usos.')
        }

        if (coupon.type === 'percentage') {
          finalPrice = price * (1 - Number(coupon.value) / 100)
        } else {
          finalPrice = price - Number(coupon.value)
        }
        finalPrice = Math.max(0, finalPrice)

        // Increment usage (only for free ones here, for paid ones it should happen on webhook)
        if (finalPrice <= 0) {
          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { used: { increment: 1 } },
          })
        }
      }
    }

    const psychologistName = psych.user.profiles?.fullName || psych.user.name || 'Psicólogo'

    // 1c. Conflict check BEFORE starting checkout
    // We use a transaction for the free flow to prevent race conditions
    if (finalPrice <= 0) {
      const result = await prisma.$transaction(async (tx) => {
        const { hasConflict, type } = await checkAppointmentConflict(
          {
            psychologistProfileId: psych.id,
            patientId: user.id,
            scheduledAt: new Date(data.scheduledAt),
            durationMinutes: data.durationMinutes,
          },
          tx as any
        )

        if (hasConflict) {
          throw new Error(
            type === 'psychologist'
              ? 'Este horário acabou de ser reservado por outro paciente.'
              : 'Você já possui uma sessão agendada para este mesmo horário.'
          )
        }

        const newAppt = await tx.appointment.create({
          data: {
            patientId: user.id,
            psychologistId: psych.id,
            scheduledAt: new Date(data.scheduledAt),
            durationMinutes: data.durationMinutes,
            price: 0,
            paymentMethod: 'Coupon',
            status: 'SCHEDULED',
          },
        })

        return newAppt
      })

      sendAppointmentNotifications(result.id).catch((err) =>
        logger.error('Error sending appt notifications:', err)
      )

      revalidateTag('appointments')

      return {
        url: data.returnUrl
          ? `${process.env.NEXT_PUBLIC_APP_URL}${data.returnUrl}${data.returnUrl.includes('?') ? '&' : '?'}payment=success`
          : `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      }
    }

    // 2. Validate Stripe Account for non-free sessions
    if (!psych.stripeAccountId || !psych.stripeOnboardingComplete) {
      throw new Error(
        'Este profissional ainda não concluiu a configuração de pagamentos. Por favor, tente novamente mais tarde.'
      )
    }

    // 3. Create a PENDING_PAYMENT appointment as a "Soft Lock"
    // This blocks the time slot for other patients during the checkout process (up to 24h by default in Stripe)
    const pendingAppt = await prisma.$transaction(async (tx) => {
      const { hasConflict, type } = await checkAppointmentConflict(
        {
          psychologistProfileId: psych.id,
          patientId: user.id,
          scheduledAt: new Date(data.scheduledAt),
          durationMinutes: data.durationMinutes,
        },
        tx as any
      )

      if (hasConflict) {
        throw new Error(
          type === 'psychologist'
            ? 'Este horário acabou de ser reservado por outro paciente.'
            : 'Você já possui uma sessão agendada para este mesmo horário.'
        )
      }

      return await tx.appointment.create({
        data: {
          patientId: user.id,
          psychologistId: psych.id,
          scheduledAt: new Date(data.scheduledAt),
          durationMinutes: data.durationMinutes,
          price: finalPrice,
          paymentMethod: 'Stripe',
          status: 'PENDING_PAYMENT',
        },
      })
    })

    // 4. Create the Checkout Session
    // toFixed(0) normalises float precision before parseInt to avoid Math.round(x.xx5 * 100) edge cases
    const stripeAmount = parseInt((finalPrice * 100).toFixed(0), 10)

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card', 'pix'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Sessão de Terapia com ${psychologistName}`,
              description: `Agendada para ${new Date(data.scheduledAt).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}`,
            },
            unit_amount: stripeAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        appointmentId: pendingAppt.id, // Reference the soft lock
        patientId: user.id,
        psychologistId: psych.id,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes.toString(),
        price: finalPrice.toString(),
      },
      payment_intent_data: {
        transfer_data: {
          destination: psych.stripeAccountId,
        },
        // Calculate dynamic platform fee from env or default to 15%
        application_fee_amount: Math.round(
          stripeAmount * (Number(process.env.PLATFORM_FEE_PERCENT) / 100)
        ),
      },
      success_url: data.returnUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL}${data.returnUrl}${data.returnUrl.includes('?') ? '&' : '?'}payment=success&session_id={CHECKOUT_SESSION_ID}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: data.returnUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL}${data.returnUrl}${data.returnUrl.includes('?') ? '&' : '?'}payment=cancelled`
        : `${process.env.NEXT_PUBLIC_APP_URL}/pagamento?payment=cancelled`,
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    // Update the pending appointment with the session ID for the webhook to find it
    await prisma.appointment.update({
      where: { id: pendingAppt.id },
      data: { stripeSessionId: session.id },
    })

    return { url: session.url }
  },
  { requiredRole: 'PATIENT' }
)

export const createStripeConnectAccountLink = createSafeAction(
  z.any().optional(),
  async (_, user) => {
    const psych = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })

    if (!psych) throw new Error('Perfil de psicólogo não encontrado')

    let accountId = psych.stripeAccountId

    // 1. Create a Stripe Express account if it doesn't exist
    if (!accountId) {
      try {
        const account = await stripe.accounts.create({
          type: 'express',
          country: 'BR',
          email: user.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: 'individual',
          metadata: {
            userId: user.id,
            profileId: psych.id,
          },
        })

        accountId = account.id
      } catch (error: any) {
        logger.error('Connect Account Creation Failed:', error)
        if (error.message?.includes('Connect')) {
          throw new Error(
            'A plataforma ainda não está habilitada para o Stripe Connect. Por favor, entre em contato com o suporte técnico para ativar os pagamentos diretos.'
          )
        }
        throw error
      }

      // Update DB with the new account ID
      await prisma.psychologistProfile.update({
        where: { id: psych.id },
        data: { stripeAccountId: accountId },
      })
    }

    // 2. Create the Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/financeiro?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/financeiro?stripe=success`,
      type: 'account_onboarding',
    })

    return { url: accountLink.url }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

/**
 * Sincroniza o status real da conta Connect com o banco de dados.
 */
export const syncStripeAccountStatus = createSafeAction(
  z.any().optional(),
  async (_, user) => {
    const psych = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })

    if (!psych?.stripeAccountId) return { connected: false }

    const account = await stripe.accounts.retrieve(psych.stripeAccountId)

    // Sync status back to DB (charges_enabled is the real signal)
    const isComplete = account.details_submitted && account.charges_enabled

    if (psych.stripeOnboardingComplete !== isComplete) {
      await prisma.psychologistProfile.update({
        where: { id: psych.id },
        data: { stripeOnboardingComplete: isComplete },
      })
    }

    return {
      connected: true,
      detailsSubmitted: account.details_submitted,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      email: account.email,
    }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const getStripeDashboardLink = createSafeAction(
  z.any().optional(),
  async (_, user) => {
    const psych = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })

    if (!psych || !psych.stripeAccountId) {
      throw new Error('Conta Stripe não configurada')
    }

    const loginLink = await stripe.accounts.createLoginLink(psych.stripeAccountId)
    return { url: loginLink.url }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)
