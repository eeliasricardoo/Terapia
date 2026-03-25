import { dispatchEmailAsync } from '../utils/email-dispatch'
import {
  getAppointmentConfirmedTemplate,
  getPsychologistNewAppointmentTemplate,
  getCancellationEmailForPatient,
  getCancellationEmailForPsychologist,
  getRescheduleEmailForPatient,
  getRescheduleEmailForPsychologist,
} from '../utils/email-templates'
import { prisma } from '../prisma'
import { logger } from '../utils/logger'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export async function sendAppointmentNotifications(appointmentId: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { profiles: true } },
        psychologist: { include: { user: { include: { profiles: true } } } },
      },
    })

    if (!appointment) {
      logger.error(`[NOTIFICATION] Appointment ${appointmentId} not found`)
      return
    }

    const patientName =
      appointment.patient.profiles?.fullName || appointment.patient.name || 'Paciente'
    const patientEmail = appointment.patient.email
    const psychologistName =
      appointment.psychologist.user.profiles?.fullName ||
      appointment.psychologist.user.name ||
      'Psicólogo'
    const psychologistEmail = appointment.psychologist.user.email

    const dateFormatted = format(appointment.scheduledAt, "dd 'de' MMMM, yyyy", { locale: ptBR })
    const timeFormatted = format(appointment.scheduledAt, 'HH:mm')

    // 1. Notify Patient (fire-and-forget — does not block the booking flow)
    dispatchEmailAsync({
      to: patientEmail,
      subject: 'Sessão Confirmada! ✅',
      html: getAppointmentConfirmedTemplate({
        patientName,
        psychologistName,
        dateFormatted,
        time: timeFormatted,
      }),
    })

    // 2. Notify Psychologist (fire-and-forget)
    if (psychologistEmail) {
      dispatchEmailAsync({
        to: psychologistEmail,
        subject: 'Novo Agendamento! 📅',
        html: getPsychologistNewAppointmentTemplate({
          psychologistName,
          patientName,
          dateFormatted,
          time: timeFormatted,
        }),
      })

      // Create in-app notification via Prisma ORM (type-safe)
      await createInAppNotification(
        appointment.psychologist.userId,
        'Novo agendamento recebido!',
        `${patientName} agendou uma sessão para ${dateFormatted} às ${timeFormatted}.`,
        'appointment',
        '/dashboard/agenda'
      )
    }

    logger.info(`[NOTIFICATION] Emails sent for appointment ${appointmentId}`)
  } catch (error) {
    logger.error(`[NOTIFICATION] Error sending notifications for ${appointmentId}:`, error)
  }
}

async function createInAppNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  link: string
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    })
  } catch (err) {
    logger.error('[NOTIFICATION] Error creating DB entry:', err)
  }
}

export async function sendCancellationNotifications(
  appointmentId: string,
  cancelledByUserId: string
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { profiles: true } },
        psychologist: { include: { user: { include: { profiles: true } } } },
      },
    })

    if (!appointment) {
      logger.error(`[NOTIFICATION] Appointment ${appointmentId} not found for cancellation`)
      return
    }

    const patientName =
      appointment.patient.profiles?.fullName || appointment.patient.name || 'Paciente'
    const patientEmail = appointment.patient.email
    const patientUserId = appointment.patientId

    const psychologistName =
      appointment.psychologist.user.profiles?.fullName ||
      appointment.psychologist.user.name ||
      'Psicólogo'
    const psychologistEmail = appointment.psychologist.user.email
    const psychologistUserId = appointment.psychologist.userId

    const dateFormatted = format(appointment.scheduledAt, "dd 'de' MMMM, yyyy", { locale: ptBR })
    const timeFormatted = format(appointment.scheduledAt, 'HH:mm')

    const cancelledByPatient = cancelledByUserId === patientUserId

    if (cancelledByPatient) {
      // Patient cancelled → notify psychologist
      if (psychologistEmail) {
        dispatchEmailAsync({
          to: psychologistEmail,
          subject: 'Sessão Cancelada pelo Paciente ❌',
          html: getCancellationEmailForPsychologist({
            psychologistName,
            patientName,
            dateFormatted,
            time: timeFormatted,
          }),
        })
      }
      await createInAppNotification(
        psychologistUserId,
        'Sessão cancelada',
        `${patientName} cancelou a sessão de ${dateFormatted} às ${timeFormatted}.`,
        'cancellation',
        '/dashboard/agenda'
      )
    } else {
      // Psychologist cancelled → notify patient
      dispatchEmailAsync({
        to: patientEmail,
        subject: 'Sua Sessão foi Cancelada ❌',
        html: getCancellationEmailForPatient({
          patientName,
          psychologistName,
          dateFormatted,
          time: timeFormatted,
        }),
      })
      await createInAppNotification(
        patientUserId,
        'Sessão cancelada',
        `Sua sessão com ${psychologistName} em ${dateFormatted} às ${timeFormatted} foi cancelada.`,
        'cancellation',
        '/dashboard'
      )
    }

    logger.info(`[NOTIFICATION] Cancellation notifications sent for appointment ${appointmentId}`)
  } catch (error) {
    logger.error(
      `[NOTIFICATION] Error sending cancellation notifications for ${appointmentId}:`,
      error
    )
  }
}

export async function sendRescheduleNotifications(
  appointmentId: string,
  rescheduledByUserId: string,
  previousDate: Date
) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { profiles: true } },
        psychologist: { include: { user: { include: { profiles: true } } } },
      },
    })

    if (!appointment) {
      logger.error(`[NOTIFICATION] Appointment ${appointmentId} not found for reschedule`)
      return
    }

    const patientName =
      appointment.patient.profiles?.fullName || appointment.patient.name || 'Paciente'
    const patientEmail = appointment.patient.email
    const patientUserId = appointment.patientId

    const psychologistName =
      appointment.psychologist.user.profiles?.fullName ||
      appointment.psychologist.user.name ||
      'Psicólogo'
    const psychologistEmail = appointment.psychologist.user.email
    const psychologistUserId = appointment.psychologist.userId

    const oldDateFormatted = format(previousDate, "dd 'de' MMMM, yyyy", { locale: ptBR })
    const oldTime = format(previousDate, 'HH:mm')
    const newDateFormatted = format(appointment.scheduledAt, "dd 'de' MMMM, yyyy", { locale: ptBR })
    const newTime = format(appointment.scheduledAt, 'HH:mm')

    const rescheduledByPatient = rescheduledByUserId === patientUserId

    if (rescheduledByPatient) {
      // Patient rescheduled → notify psychologist
      if (psychologistEmail) {
        dispatchEmailAsync({
          to: psychologistEmail,
          subject: 'Sessão Reagendada pelo Paciente 📅',
          html: getRescheduleEmailForPsychologist({
            psychologistName,
            patientName,
            oldDateFormatted,
            oldTime,
            newDateFormatted,
            newTime,
          }),
        })
      }
      await createInAppNotification(
        psychologistUserId,
        'Sessão reagendada',
        `${patientName} reagendou de ${oldDateFormatted} às ${oldTime} para ${newDateFormatted} às ${newTime}.`,
        'reschedule',
        '/dashboard/agenda'
      )
    } else {
      // Psychologist rescheduled → notify patient
      dispatchEmailAsync({
        to: patientEmail,
        subject: 'Sua Sessão foi Reagendada 📅',
        html: getRescheduleEmailForPatient({
          patientName,
          psychologistName,
          oldDateFormatted,
          oldTime,
          newDateFormatted,
          newTime,
        }),
      })
      await createInAppNotification(
        patientUserId,
        'Sessão reagendada',
        `Sua sessão com ${psychologistName} foi reagendada para ${newDateFormatted} às ${newTime}.`,
        'reschedule',
        '/dashboard'
      )
    }

    logger.info(`[NOTIFICATION] Reschedule notifications sent for appointment ${appointmentId}`)
  } catch (error) {
    logger.error(
      `[NOTIFICATION] Error sending reschedule notifications for ${appointmentId}:`,
      error
    )
  }
}
