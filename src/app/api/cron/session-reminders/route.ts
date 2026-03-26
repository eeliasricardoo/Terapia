import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { env } from '@/lib/env'
import { dispatchEmailAsync } from '@/lib/utils/email-dispatch'
import {
  getReminderEmailForPatient,
  getReminderEmailForPsychologist,
} from '@/lib/utils/email-templates'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Cron job: send 24h reminder emails for upcoming sessions.
 *
 * Scheduled via vercel.json — runs every hour.
 * Finds appointments starting between 23h and 25h from now where the
 * reminder has not yet been sent, dispatches emails to both parties,
 * and marks reminderSentAt to prevent duplicate sends.
 *
 * Security: requires Authorization: Bearer <CRON_SECRET> header
 * (Vercel sets this automatically for cron routes).
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000)

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        status: 'SCHEDULED',
        reminderSentAt: null,
        scheduledAt: {
          gte: windowStart,
          lte: windowEnd,
        },
      },
      include: {
        patient: true,
        psychologist: {
          include: { user: { include: { profiles: true } } },
        },
      },
    })

    if (appointments.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    let sent = 0

    for (const appt of appointments) {
      const patientEmail = appt.patient.email
      const psychEmail = appt.psychologist.user.email
      const patientName = appt.patient.name || 'Paciente'
      const psychName =
        appt.psychologist.user.profiles?.fullName || appt.psychologist.user.name || 'Psicólogo'

      const dateFormatted = format(appt.scheduledAt, "EEEE, dd 'de' MMMM", { locale: ptBR })
      const time = format(appt.scheduledAt, 'HH:mm')

      dispatchEmailAsync({
        to: patientEmail,
        subject: 'Lembrete: sua sessão é amanhã 🗓️',
        html: getReminderEmailForPatient({
          patientName,
          psychologistName: psychName,
          dateFormatted,
          time,
          meetingUrl: appt.meetingUrl ?? undefined,
        }),
      })

      dispatchEmailAsync({
        to: psychEmail,
        subject: 'Lembrete: você tem uma sessão amanhã 🗓️',
        html: getReminderEmailForPsychologist({
          psychologistName: psychName,
          patientName,
          dateFormatted,
          time,
        }),
      })

      await prisma.appointment.update({
        where: { id: appt.id },
        data: { reminderSentAt: now },
      })

      sent++
    }

    logger.info(`[CRON] Session reminders sent: ${sent}`)
    return NextResponse.json({ sent })
  } catch (error: any) {
    logger.error('[CRON] session-reminders error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
