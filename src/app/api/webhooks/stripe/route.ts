import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { revalidateTag } from 'next/cache'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(req: Request) {
  const body = await req.text()
  const sig = headers().get('stripe-signature') as string

  let event: Stripe.Event

  try {
    if (!sig || !endpointSecret) {
      throw new Error('Missing stripe-signature or webhook secret')
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    logger.error(`Webhook Error: ${errorMessage}`)
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 })
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata

    if (!metadata) {
      logger.error(`Missing metadata in session ${session.id}`)
      return NextResponse.json({ error: 'Missing session metadata' }, { status: 400 })
    }

    try {
      // Idempotency check: verify if appointment already exists for this session
      const existingAppointment = await prisma.appointment.findUnique({
        where: { stripeSessionId: session.id },
      })

      if (existingAppointment) {
        logger.info(
          `Appointment already exists for session ${session.id}, skipping duplicate creation`
        )
        return NextResponse.json({ received: true, duplicate: true })
      }

      // Fulfill the purchase
      await prisma.appointment.create({
        data: {
          patientId: metadata.patientId,
          psychologistId: metadata.psychologistId,
          scheduledAt: new Date(metadata.scheduledAt),
          durationMinutes: parseInt(metadata.durationMinutes),
          price: metadata.price,
          paymentMethod: 'Stripe',
          status: 'SCHEDULED',
          stripeSessionId: session.id,
        },
      })

      logger.info(
        `Appointment created for patient ${metadata.patientId} via Stripe session ${session.id}`
      )
      revalidateTag('appointments')
      revalidateTag('psychologist-profile-view')
    } catch (error) {
      logger.error(`Error completing booking for session ${session.id}:`, error)
      return NextResponse.json({ error: 'Internal server error during booking' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
