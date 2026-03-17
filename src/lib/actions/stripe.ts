'use server'

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { isValidUUID } from '@/lib/security'
import { revalidateTag } from 'next/cache'

export async function createStripeCheckoutSession(data: {
  psychologistId: string
  scheduledAt: string
  durationMinutes: number
  couponCode?: string
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
      await prisma.appointment.create({
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
      revalidateTag('appointments')
      revalidateTag('psychologist-profile-view')
      return { url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success` }
    }

    // 3. Create the Checkout Session
    const stripeAmount = Math.round(finalPrice * 100)
    const session = await stripe.checkout.sessions.create({
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pagamento?payment=cancelled`,
    })

    return { url: session.url }
  } catch (error: any) {
    logger.error('Error creating Stripe session:', error)
    return { error: error.message || 'Erro ao processar pagamento' }
  }
}
