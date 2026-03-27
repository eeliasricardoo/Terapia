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
      // Find the pending appointment created during checkout initiation
      const pendingAppointment = await prisma.appointment.findFirst({
        where: {
          OR: [{ stripeSessionId: session.id }, { id: metadata.appointmentId }],
        },
      })

      if (!pendingAppointment) {
        logger.error(
          `CRITICAL: No pending appointment found for session ${session.id}. Data loss risk!`
        )
        return NextResponse.json({ error: 'Fulfillment target not found' }, { status: 404 })
      }

      if (pendingAppointment.status === 'SCHEDULED') {
        logger.info(`Appointment ${pendingAppointment.id} already fulfilled, skipping.`)
        return NextResponse.json({ received: true })
      }

      // Fulfill the purchase by updating the pending appointment
      const updatedAppt = await prisma.appointment.update({
        where: { id: pendingAppointment.id },
        data: {
          patientId: metadata.patientId,
          psychologistId: metadata.psychologistId,
          scheduledAt: new Date(metadata.scheduledAt),
          durationMinutes: parseInt(metadata.durationMinutes),
          price: Number(metadata.price),
          status: 'SCHEDULED',
          paymentMethod: 'Stripe',
          stripeSessionId: session.id,
          stripePaymentIntentId:
            typeof session.payment_intent === 'string' ? session.payment_intent : null,
        },
      })

      // Send notifications asynchronously
      sendAppointmentNotifications(updatedAppt.id).catch((err) =>
        logger.error('Error sending appt notifications:', err)
      )

      logger.info(`Appointment ${updatedAppt.id} fulfilled for patient ${metadata.patientId}`)
      revalidateTag('appointments')
      revalidateTag('psychologist-profile-view')
    } catch (error) {
      logger.error(`Error completing booking for session ${session.id}:`, error)
      return NextResponse.json({ error: 'Internal server error during booking' }, { status: 500 })
    }
  } else if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account

    try {
      // Robust check: details submitted AND charges enabled
      const isComplete = account.details_submitted && account.charges_enabled

      await prisma.psychologistProfile.update({
        where: { stripeAccountId: account.id },
        data: { stripeOnboardingComplete: isComplete },
      })

      if (isComplete) {
        logger.info(`Stripe Onboarding fully active for account ${account.id} (charges enabled)`)
      } else {
        logger.warn(
          `Stripe account ${account.id} updated but charges NOT enabled. Status set to incomplete.`
        )
      }

      revalidateTag('psychologist-profile-view')
    } catch (error) {
      logger.error(`Error updating stripe onboarding status for ${account.id}:`, error)
    }
  }

  return NextResponse.json({ received: true })
}
