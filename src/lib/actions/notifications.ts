import { sendEmail } from '../utils/email'
import {
  getAppointmentConfirmedTemplate,
  getPsychologistNewAppointmentTemplate,
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

    // 1. Send to Patient
    await sendEmail({
      to: patientEmail,
      subject: 'Sessão Confirmada! ✅',
      html: getAppointmentConfirmedTemplate({
        patientName,
        psychologistName,
        dateFormatted,
        time: timeFormatted,
      }),
    })

    // 2. Send to Psychologist
    if (psychologistEmail) {
      await sendEmail({
        to: psychologistEmail,
        subject: 'Novo Agendamento! 📅',
        html: getPsychologistNewAppointmentTemplate({
          psychologistName,
          patientName,
          dateFormatted,
          time: timeFormatted,
        }),
      })

      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: appointment.psychologist.userId,
          title: 'Novo agendamento recebido!',
          message: `${patientName} agendou uma sessão para ${dateFormatted} às ${timeFormatted}.`,
          type: 'appointment',
          link: '/dashboard/agenda',
        },
      })
    }

    logger.info(`[NOTIFICATION] Emails sent for appointment ${appointmentId}`)
  } catch (error) {
    logger.error(`[NOTIFICATION] Error sending notifications for ${appointmentId}:`, error)
  }
}
