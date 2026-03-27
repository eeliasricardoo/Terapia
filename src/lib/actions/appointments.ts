import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { logger } from '@/lib/utils/logger'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'
import { sendAppointmentNotifications } from './notifications'
import { checkAppointmentConflict } from './appointments-utils'

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
    } catch (error: any) {
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
