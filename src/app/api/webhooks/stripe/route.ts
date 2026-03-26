import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { revalidateTag } from 'next/cache'
import { sendAppointmentNotifications } from '@/lib/actions/notifications'
import { checkAppointmentConflict } from '@/lib/actions/appointments-utils'

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

      // Final Conflict Check (Safety Guard)
      const { hasConflict } = await checkAppointmentConflict({
        psychologistProfileId: metadata.psychologistId,
        patientId: metadata.patientId,
        scheduledAt: new Date(metadata.scheduledAt),
        durationMinutes: parseInt(metadata.durationMinutes),
      })

      if (hasConflict) {
        logger.error(
          `CRITICAL: Overlapping appointment detected during webhook for session ${session.id}. Payment received but slot taken.`
        )
        return NextResponse.json({ error: 'Time slot occupied during payment' }, { status: 409 })
      }

      // Fulfill the purchase
      const newAppt = await prisma.appointment.create({
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

      // Send notifications asynchronously
      sendAppointmentNotifications(newAppt.id).catch((err) =>
        logger.error('Error sending appt notifications:', err)
      )

      logger.info(
        `Appointment created for patient ${metadata.patientId} via Stripe session ${session.id}`
      )
      revalidateTag('appointments')
      revalidateTag('psychologist-profile-view')
    } catch (error) {
      logger.error(`Error completing booking for session ${session.id}:`, error)
      return NextResponse.json({ error: 'Internal server error during booking' }, { status: 500 })
    }
  } else if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account

    try {
      if (account.details_submitted) {
        await (prisma.psychologistProfile as any).updateMany({
          where: { stripeAccountId: account.id },
          data: { stripeOnboardingComplete: true },
        })
        logger.info(`Stripe Onboarding completed for account ${account.id}`)
        revalidateTag('psychologist-profile-view')
      } else {
        await (prisma.psychologistProfile as any).updateMany({
          where: { stripeAccountId: account.id },
          data: { stripeOnboardingComplete: false },
        })
      }
    } catch (error) {
      logger.error(`Error updating stripe onboarding status for ${account.id}:`, error)
    }
  }

  return NextResponse.json({ received: true })
}
