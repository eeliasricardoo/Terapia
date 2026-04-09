'use server'

import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { decryptData } from '@/lib/security'
import { sendCancellationNotifications, sendRescheduleNotifications } from './notifications'
import { checkAppointmentConflict } from './appointments-utils'
import { stripe } from '@/lib/stripe'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'
import { isWithinSessionWindow } from '@/lib/utils/session-utils'

function mapProfile(
  profiles: { fullName: string | null; avatarUrl: string | null; role: string } | null | undefined
) {
  if (!profiles) return null
  return {
    full_name: profiles.fullName,
    avatar_url: profiles.avatarUrl,
    role: profiles.role,
  }
}

export const getUserSessions = createSafeAction(
  z.object({
    limit: z.number().int().min(1).max(50).optional().default(20),
    cursor: z.string().uuid().optional(),
  }),
  async (input, user) => {
    const pageSize = input.limit || 20

    const [appointments, total] = await prisma.$transaction([
      prisma.appointment.findMany({
        where: {
          OR: [{ patientId: user.id }, { psychologist: { userId: user.id } }],
        },
        include: {
          patient: { include: { profiles: true } },
          psychologist: {
            include: {
              user: { include: { profiles: true } },
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
        take: pageSize + 1,
        ...(input.cursor
          ? {
              cursor: { id: input.cursor },
              skip: 1,
            }
          : {}),
      }),
      prisma.appointment.count({
        where: {
          OR: [{ patientId: user.id }, { psychologist: { userId: user.id } }],
        },
      }),
    ])

    const hasNextPage = appointments.length > pageSize
    const items = hasNextPage ? appointments.slice(0, pageSize) : appointments
    const nextCursor = hasNextPage ? items[items.length - 1].id : null

    const sessions = items.map((appt) => ({
      ...appt,
      id: appt.id,
      patient_id: appt.patientId,
      psychologist_id: appt.psychologistId,
      scheduled_at: appt.scheduledAt.toISOString(),
      duration_minutes: appt.durationMinutes,
      status: appt.status,
      price: Number(appt.price),
      patient: mapProfile(appt.patient?.profiles),
      psychologist: mapProfile(appt.psychologist?.user?.profiles),
    }))

    return { sessions, nextCursor, total }
  }
)

export const getNextSession = createSafeAction(z.any().optional(), async (_, user) => {
  const now = new Date()
  const appt = await prisma.appointment.findFirst({
    where: {
      OR: [{ patientId: user.id }, { psychologist: { userId: user.id } }],
      scheduledAt: { gte: now },
      status: 'SCHEDULED',
    },
    include: {
      patient: { include: { profiles: true } },
      psychologist: {
        include: {
          user: { include: { profiles: true } },
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  })

  if (!appt) return null

  return {
    ...appt,
    scheduled_at: appt.scheduledAt.toISOString(),
    price: Number(appt.price),
    patient: mapProfile(appt.patient?.profiles),
    psychologist: mapProfile(appt.psychologist?.user?.profiles),
  }
})

export const getSessionHistory = createSafeAction(
  z.object({
    limit: z.number().int().min(1).max(50).optional().default(10),
  }),
  async (input, user) => {
    const now = new Date()
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [{ patientId: user.id }, { psychologist: { userId: user.id } }],
        scheduledAt: { lte: now },
      },
      include: {
        patient: { include: { profiles: true } },
        psychologist: {
          include: {
            user: { include: { profiles: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
      take: input.limit,
    })

    return appointments.map((appt) => ({
      ...appt,
      scheduled_at: appt.scheduledAt.toISOString(),
      status: appt.status,
      price: Number(appt.price),
      patient: mapProfile(appt.patient?.profiles),
      psychologist: mapProfile(appt.psychologist?.user?.profiles),
    }))
  }
)

export const cancelSession = createSafeAction(z.string().uuid(), async (sessionId, user) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: sessionId },
    include: { psychologist: true },
  })

  if (!appointment) throw new Error('Sessão não encontrada')

  if (user.id !== appointment.patientId && user.id !== appointment.psychologist?.userId) {
    logger.warn(`UNAUTHORIZED CANCEL ATTEMPT: User ${user.id} tried to cancel session ${sessionId}`)
    throw new Error('Sem permissão para cancelar esta sessão.')
  }

  if (appointment.status === 'CANCELED') throw new Error('Sessão já cancelada.')

  const now = new Date()
  const hoursUntilSession = (appointment.scheduledAt.getTime() - now.getTime()) / (1000 * 60 * 60)

  const isPsychologist = user.id === appointment.psychologist.userId
  const isPatient = user.id === appointment.patientId

  // Refund eligibility:
  // 1. Paid via Stripe
  // 2. Either psych cancelled (always refund) OR patient cancelled more than 24h before
  const isRefundEligible =
    appointment.paymentMethod === 'Stripe' &&
    appointment.stripePaymentIntentId !== null &&
    (isPsychologist || hoursUntilSession > 24)

  if (isPatient && hoursUntilSession <= 24) {
    logger.warn(
      `Patient ${user.id} cancelling session ${sessionId} within 24h window. No automatic refund.`,
      { hours: hoursUntilSession }
    )
  }

  // Update DB first; if Stripe refund fails we roll back the status change.
  // This ensures we never end up with a refunded-but-still-SCHEDULED appointment.
  await prisma.appointment.update({
    where: { id: sessionId },
    data: { status: 'CANCELED' },
  })

  let refunded = false
  if (isRefundEligible) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: appointment.stripePaymentIntentId!,
      })
      refunded = refund.status === 'succeeded' || refund.status === 'pending'

      if (!refunded) {
        // Roll back the status change since the refund didn't go through
        await prisma.appointment.update({
          where: { id: sessionId },
          data: { status: 'SCHEDULED' },
        })
        throw new Error('Falha ao processar estorno no Stripe. A sessão permanece ativa.')
      }
      logger.info(
        `Refund issued for session ${sessionId} (${isPsychologist ? 'by psychologist' : 'by patient > 24h'})`
      )
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes('Falha ao processar estorno')) {
        throw e
      }
      // Roll back the status change on unexpected Stripe errors
      await prisma.appointment
        .update({
          where: { id: sessionId },
          data: { status: 'SCHEDULED' },
        })
        .catch((rollbackErr) =>
          logger.error(
            `Failed to roll back appointment ${sessionId} after refund error:`,
            rollbackErr
          )
        )
      logger.error(`Refund failed for ${sessionId}:`, e)
      const eMsg = e instanceof Error ? e.message : String(e)
      throw new Error(`Erro no estorno: ${eMsg}. Tente novamente ou contate o suporte.`)
    }
  }

  sendCancellationNotifications(sessionId, user.id).catch((e) => logger.error(e))
  revalidateTag('appointments')

  return { success: true, refunded, refundAmount: refunded ? Number(appointment.price) : 0 }
})

export const rescheduleSession = createSafeAction(
  z.object({
    sessionId: z.string().uuid(),
    newScheduledAt: z.string().datetime(),
  }),
  async (data, user) => {
    const appointment = await prisma.appointment.findUnique({
      where: { id: data.sessionId },
      include: { psychologist: true },
    })

    if (!appointment) throw new Error('Sessão não encontrada')

    if (user.id !== appointment.patientId && user.id !== appointment.psychologist?.userId) {
      throw new Error('Acesso negado.')
    }

    const { updatedSession, previousDate } = await prisma.$transaction(async (tx) => {
      const { hasConflict, type } = await checkAppointmentConflict(
        {
          psychologistProfileId: appointment.psychologistId,
          patientId: appointment.patientId,
          scheduledAt: new Date(data.newScheduledAt),
          durationMinutes: appointment.durationMinutes,
          excludeAppointmentId: data.sessionId,
        },
        tx
      )

      if (hasConflict) {
        throw new Error(
          type === 'psychologist'
            ? 'O psicólogo já possui um compromisso neste horário.'
            : 'Você já possui uma sessão neste horário.'
        )
      }

      const prev = appointment.scheduledAt

      const updated = await tx.appointment.update({
        where: { id: data.sessionId },
        data: {
          scheduledAt: new Date(data.newScheduledAt),
          status: 'SCHEDULED',
        },
      })

      return { updatedSession: updated, previousDate: prev }
    })

    sendRescheduleNotifications(data.sessionId, user.id, previousDate).catch((e) => logger.error(e))
    revalidateTag('appointments')

    return {
      ...updatedSession,
      scheduled_at: updatedSession.scheduledAt.toISOString(),
      price: Number(updatedSession.price),
    }
  }
)

export const getSessionSummary = createSafeAction(z.string().uuid(), async (sessionId, user) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: sessionId },
    include: {
      psychologist: { include: { user: { include: { profiles: true } } } },
      patient: { include: { profiles: true } },
    },
  })

  if (!appointment) return null

  if (user.id !== appointment.patientId && user.id !== appointment.psychologist.userId) {
    return null
  }

  const patientProfileId = appointment.patient?.profiles?.id
  const evolution = patientProfileId
    ? await prisma.evolution.findFirst({
        where: {
          patientId: patientProfileId,
          psychologistId: appointment.psychologistId,
        },
        orderBy: { date: 'desc' },
      })
    : null

  const psychName =
    appointment.psychologist.user.profiles?.fullName ||
    appointment.psychologist.user.name ||
    'Especialista'

  return {
    id: appointment.id,
    durationMinutes: appointment.durationMinutes,
    scheduledAt: appointment.scheduledAt.toISOString(),
    status: appointment.status,
    psychologistName: psychName,
    specialty: appointment.psychologist.specialties?.[0] || 'Psicologia',
    publicSummary: decryptData(evolution?.publicSummary || ''),
    mood: evolution?.mood || null,
  }
})
