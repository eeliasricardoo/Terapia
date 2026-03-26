'use server'

import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { isValidUUID } from '@/lib/security'
import { revalidateTag } from 'next/cache'
import { sendAppointmentNotifications } from './notifications'
import { checkAppointmentConflict } from './appointments-utils'

export async function createStripeCheckoutSession(data: {
  psychologistId: string
  scheduledAt: string
  durationMinutes: number
  couponCode?: string
  returnUrl?: string
}) {
  try {
    if (!isValidUUID(data.psychologistId)) {
      return { error: 'ID de psicólogo inválido' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autenticado')

    // 1. Fetch psychologist info for price and name
    let psych = await prisma.psychologistProfile.findUnique({
      where: { id: data.psychologistId },
      include: { user: { include: { profiles: true } } },
    })

    // If not found by ID, try by userId (some parts of the app might be passing userId)
    if (!psych) {
      psych = await prisma.psychologistProfile.findUnique({
        where: { userId: data.psychologistId },
        include: { user: { include: { profiles: true } } },
      })
    }

    if (!psych) throw new Error('Psicólogo não encontrado')

    // 1c. Conflict check BEFORE starting checkout or creating free appt
    const { hasConflict, type } = await checkAppointmentConflict({
      psychologistProfileId: psych.id,
      patientId: user.id,
      scheduledAt: new Date(data.scheduledAt),
      durationMinutes: data.durationMinutes,
    })

    if (hasConflict) {
      return {
        error:
          type === 'psychologist'
            ? 'Este horário acabou de ser reservado por outro paciente. Por favor, escolha outro horário.'
            : 'Você já possui uma sessão agendada para este mesmo horário.',
      }
    }

    const price = Number(psych.pricePerSession) || 0
    let finalPrice = price

    // 1b. Apply Coupon if exists
    if (data.couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: data.couponCode.toUpperCase(),
          active: true,
        },
      })

      if (coupon) {
        if (coupon.type === 'percentage') {
          finalPrice = price * (1 - Number(coupon.value) / 100)
        } else {
          finalPrice = price - Number(coupon.value)
        }
        finalPrice = Math.max(0, finalPrice)

        // Increment usage
        // @ts-ignore
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { used: { increment: 1 } },
        })
      }
    }

    const psychologistName = psych.user.profiles?.fullName || psych.user.name || 'Psicólogo'

    // 2. IF FREE (100% DISCOUNT): Create appointment directly and return success
    if (finalPrice <= 0) {
      const newAppt = await prisma.appointment.create({
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

      // Send notifications asynchronously
      sendAppointmentNotifications(newAppt.id).catch((err) =>
        logger.error('Error sending appt notifications:', err)
      )
      revalidateTag('appointments')
      revalidateTag('psychologist-profile-view')
      return {
        url: data.returnUrl
          ? `${process.env.NEXT_PUBLIC_APP_URL}${data.returnUrl}${data.returnUrl.includes('?') ? '&' : '?'}payment=success`
          : `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
      }
    }

    // 3. Create the Checkout Session
    const stripeAmount = Math.round(finalPrice * 100)

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      // Using explicit payment_method_types because automatic_payment_methods
      // returned "unknown parameter" for this account/legacy configuration.
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Sessão de Terapia com ${psychologistName}`,
              description: `Agendada para ${new Date(data.scheduledAt).toLocaleString('pt-BR')}`,
            },
            unit_amount: stripeAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        patientId: user.id,
        psychologistId: psych.id,
        scheduledAt: data.scheduledAt,
        durationMinutes: data.durationMinutes,
        price: finalPrice.toString(),
        originalPrice: price.toString(),
        couponCode: data.couponCode || '',
      },
      success_url: data.returnUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL}${data.returnUrl}${data.returnUrl.includes('?') ? '&' : '?'}payment=success&session_id={CHECKOUT_SESSION_ID}`
        : `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: data.returnUrl
        ? `${process.env.NEXT_PUBLIC_APP_URL}${data.returnUrl}${data.returnUrl.includes('?') ? '&' : '?'}payment=cancelled`
        : `${process.env.NEXT_PUBLIC_APP_URL}/pagamento?payment=cancelled`,
    }

    if (psych.stripeAccountId) {
      sessionConfig.payment_intent_data = {
        transfer_data: {
          destination: psych.stripeAccountId,
        },
        application_fee_amount: Math.round(stripeAmount * 0.2),
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return { url: session.url }
  } catch (error: any) {
    logger.error('Error creating Stripe session:', {
      message: error.message,
      stack: error.stack,
    })
    return { error: error.message || 'Erro ao processar pagamento' }
  }
}

export async function createStripeConnectAccountLink() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autenticado')

    const psych = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })

    if (!psych) throw new Error('Perfil de psicólogo não encontrado')

    let accountId = psych.stripeAccountId

    // 1. Create a Stripe Express account if it doesn't exist
    if (!accountId) {
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
  } catch (error: any) {
    logger.error('Error creating Stripe Connect link:', error)
    return { error: error.message || 'Erro ao conectar-se ao Stripe' }
  }
}

/**
 * Sincroniza o status real da conta Connect com o banco de dados.
 */
export async function syncStripeAccountStatus() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'Não autenticado' }

    const psych = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })

    if (!psych?.stripeAccountId) return { connected: false }

    const account = await stripe.accounts.retrieve(psych.stripeAccountId)

    return {
      connected: !!psych.stripeAccountId,
      detailsSubmitted: account.details_submitted,
      payoutsEnabled: account.payouts_enabled,
      email: account.email,
    }
  } catch (err: any) {
    logger.error('Error syncing Stripe status:', err)
    return { error: err.message }
  }
}

export async function getStripeDashboardLink() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Não autenticado')

    const psych = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
    })

    // @ts-ignore
    if (!psych || !psych.stripeAccountId) {
      throw new Error('Conta Stripe não configurada')
    }

    // @ts-ignore
    const loginLink = await stripe.accounts.createLoginLink(psych.stripeAccountId)
    return { url: loginLink.url }
  } catch (error: any) {
    logger.error('Error getting Stripe Dashboard link:', error)
    return { error: error.message || 'Erro ao acessar painel do Stripe' }
  }
}
