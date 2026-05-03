'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { logger } from '@/lib/utils/logger'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'
import { sendAppointmentNotifications } from './notifications'
import { checkAppointmentConflict } from './appointments-utils'
import { stripe } from '@/lib/stripe'
import { checkRateLimit } from '@/lib/security'
import { dispatchEmailAsync } from '@/lib/utils/email-dispatch'
import {
  getCancellationEmailForPatient,
  getCancellationEmailForPsychologist,
} from '@/lib/utils/email-templates'

class AppointmentConflictError extends Error {
  constructor(public readonly conflictType: 'psychologist' | 'patient') {
    super('CONFLICT')
    this.name = 'AppointmentConflictError'
  }
}

const createInsuranceSchema = z.object({
  psychologistId: z.string().uuid('ID do psicólogo inválido'),
  scheduledAt: z.string(),
  durationMinutes: z.number().min(1),
  healthInsuranceId: z.string().uuid('ID do convênio inválido'),
  healthInsurancePolicy: z.string().min(1, 'Número da carteirinha é obrigatório'),
})

/**
 * Creates a new appointment covered by health insurance.
 * ENFORCES: Authentication, Zod validation, and Serializable Concurrency control.
 */
export const createInsuranceAppointment = createSafeAction(
  createInsuranceSchema,
  async (data, user) => {
    // 1. Fetch psychologist profile
    const psychProfile = await prisma.psychologistProfile.findUnique({
      where: { userId: data.psychologistId },
      select: { id: true },
    })

    if (!psychProfile) {
      throw new Error('Psicólogo não encontrado.')
    }

    const psychologistProfileId = psychProfile.id
    const scheduledAtDate = new Date(data.scheduledAt)

    // 2. Fast pre-check for early feedback
    const { hasConflict, type } = await checkAppointmentConflict({
      psychologistProfileId,
      patientId: user.id,
      scheduledAt: scheduledAtDate,
      durationMinutes: data.durationMinutes,
    })

    if (hasConflict) {
      throw new AppointmentConflictError(type === 'psychologist' ? 'psychologist' : 'patient')
    }

    // 3. Atomic conflict re-check + creation in a serializable transaction
    try {
      const sessionEnd = new Date(scheduledAtDate.getTime() + data.durationMinutes * 60 * 1000)
      const windowStart = new Date(scheduledAtDate.getTime() - 6 * 60 * 60 * 1000)
      const windowEnd = new Date(scheduledAtDate.getTime() + 6 * 60 * 60 * 1000)

      const newSession = await prisma.$transaction(
        async (tx) => {
          const existingConflicts = await tx.appointment.findMany({
            where: {
              status: { not: 'CANCELED' },
              scheduledAt: { gte: windowStart, lte: windowEnd },
              OR: [{ psychologistId: psychologistProfileId }, { patientId: user.id }],
            },
          })

          const conflict = existingConflicts.find((appt) => {
            const apptStart = new Date(appt.scheduledAt)
            const apptEnd = new Date(apptStart.getTime() + appt.durationMinutes * 60000)
            return scheduledAtDate < apptEnd && sessionEnd > apptStart
          })

          if (conflict) {
            throw new AppointmentConflictError(
              conflict.psychologistId === psychologistProfileId ? 'psychologist' : 'patient'
            )
          }

          return tx.appointment.create({
            data: {
              patientId: user.id,
              psychologistId: psychologistProfileId,
              scheduledAt: scheduledAtDate,
              durationMinutes: data.durationMinutes,
              price: 0,
              status: 'SCHEDULED',
              healthInsurancePlanId: data.healthInsuranceId,
              healthInsurancePolicy: data.healthInsurancePolicy,
            },
          })
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
      )

      // Background notifications
      sendAppointmentNotifications(newSession.id).catch((err) =>
        logger.error('Error sending insurance appt notifications:', err)
      )

      revalidateTag('appointments')
      revalidatePath('/', 'layout')

      return { id: newSession.id }
    } catch (error: unknown) {
      if (error instanceof AppointmentConflictError) {
        throw new Error(
          error.conflictType === 'psychologist'
            ? 'Este horário já foi reservado ou entra em conflito com outra sessão do psicólogo.'
            : 'Sua agenda já possui um compromisso neste horário.'
        )
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
        throw new Error('Este horário foi reservado simultaneamente. Por favor, escolha outro.')
      }
      throw error
    }
  }
)

const cancelAppointmentSchema = z.object({
  appointmentId: z.string().uuid('ID de agendamento inválido'),
  reason: z.string().min(5, 'O motivo deve ter pelo menos 5 caracteres').max(500),
})

/**
 * Cancels an appointment and processes refund if applicable.
 * POLICY:
 * - Psychologist cancelling: Always 100% refund.
 * - Patient cancelling: 100% refund if > 24h before session, else 0%.
 */
export const cancelAppointment = createSafeAction(cancelAppointmentSchema, async (data, user) => {
  // 1. Rate limit
  const rateLimit = await checkRateLimit(user.id)
  if (!rateLimit.success) {
    throw new Error('Muitas tentativas. Tente novamente em breve.')
  }

  // 2. Fetch appointment with relations
  const appointment = await prisma.appointment.findUnique({
    where: { id: data.appointmentId },
    include: {
      patient: { include: { profiles: true } },
      psychologist: { include: { user: { include: { profiles: true } } } },
    },
  })

  if (!appointment) throw new Error('Agendamento não encontrado.')
  if (appointment.status === 'CANCELED') throw new Error('Este agendamento já está cancelado.')

  // 3. Authorization Check
  const isPatient = appointment.patientId === user.id
  const isPsychologist = appointment.psychologist.userId === user.id

  if (!isPatient && !isPsychologist) {
    throw new Error('Você não tem permissão para cancelar este agendamento.')
  }

  // 4. Past Session Check
  const now = new Date()
  const scheduledAt = new Date(appointment.scheduledAt)
  if (scheduledAt < now) {
    throw new Error('Não é possível cancelar uma sessão que já ocorreu.')
  }

  // 5. Refund Calculation
  let refundAmount = 0
  let shouldRefund = false

  if (isPsychologist) {
    refundAmount = Number(appointment.price)
    shouldRefund = refundAmount > 0
  } else {
    const hoursDiff = (scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (hoursDiff >= 24) {
      refundAmount = Number(appointment.price)
      shouldRefund = refundAmount > 0
    } else {
      refundAmount = 0
      shouldRefund = false
    }
  }

  let refundId = null

  // 6. Execute Refund in Stripe (if applicable)
  if (shouldRefund && appointment.stripePaymentIntentId) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: appointment.stripePaymentIntentId,
        amount: Math.round(refundAmount * 100),
        reverse_transfer: true,
        metadata: {
          appointmentId: appointment.id,
          cancelledBy: isPatient ? 'PATIENT' : 'PSYCHOLOGIST',
        },
      })
      refundId = refund.id
    } catch (err: any) {
      logger.error('Stripe Refund Failed:', err)
      throw new Error(`Falha ao processar reembolso: ${err.message}`)
    }
  }

  // 7. Update DB
  await prisma.appointment.update({
    where: { id: appointment.id },
    data: {
      status: 'CANCELED',
      cancelledAt: now,
      cancelledBy: isPatient ? 'PATIENT' : 'PSYCHOLOGIST',
      cancellationReason: data.reason,
      refundId,
      refundAmount: new Prisma.Decimal(refundAmount),
    },
  })

  // 8. Notifications
  const patientEmail = appointment.patient.email
  const psychEmail = appointment.psychologist.user.email
  const patientName =
    appointment.patient.profiles?.fullName || appointment.patient.name || 'Paciente'
  const psychName =
    appointment.psychologist.user.profiles?.fullName ||
    appointment.psychologist.user.name ||
    'Psicólogo'

  const dateStr = scheduledAt.toLocaleDateString('pt-BR', { dateStyle: 'long' })
  const timeStr = scheduledAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  dispatchEmailAsync({
    to: patientEmail,
    subject: 'Sessão Cancelada - Sentirz',
    html: getCancellationEmailForPatient({
      patientName,
      psychologistName: psychName,
      dateFormatted: dateStr,
      time: timeStr,
    }),
  }).catch((err) => logger.error('Error sending patient cancellation email:', err))

  dispatchEmailAsync({
    to: psychEmail,
    subject: 'Sessão Cancelada - Sentirz',
    html: getCancellationEmailForPsychologist({
      psychologistName: psychName,
      patientName,
      dateFormatted: dateStr,
      time: timeStr,
    }),
  }).catch((err) => logger.error('Error sending psych cancellation email:', err))

  revalidatePath('/dashboard', 'layout')
  revalidateTag('appointments')

  logger.info(
    `Appointment ${appointment.id} cancelled by ${isPatient ? 'PATIENT' : 'PSYCHOLOGIST'}. Refund: R$ ${refundAmount}`
  )

  return { success: true, refundAmount }
})
