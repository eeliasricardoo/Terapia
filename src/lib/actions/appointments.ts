'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { logger } from '@/lib/utils/logger'
import { sendAppointmentNotifications } from './notifications'
import { checkAppointmentConflict } from './appointments-utils'

class AppointmentConflictError extends Error {
  constructor(public readonly conflictType: 'psychologist' | 'patient') {
    super('CONFLICT')
    this.name = 'AppointmentConflictError'
  }
}

/**
 * Create a new appointment covered by health insurance
 */
export async function createInsuranceAppointment(data: {
  psychologistId: string
  scheduledAt: string
  durationMinutes: number
  healthInsuranceId: string
  healthInsurancePolicy: string
}) {
  const supabase = await createClient()

  // 1. Verify Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  // 2. Fetch psychologist profile ID
  const { data: psychData, error: psychError } = await supabase
    .from('psychologist_profiles')
    .select('id')
    .eq('userId', data.psychologistId)
    .single()

  if (psychError || !psychData) {
    logger.error('Error fetching psychologist data:', psychError)
    return { success: false, error: 'Psicólogo não encontrado.' }
  }

  const psychologistProfileId = psychData.id
  const scheduledAtDate = new Date(data.scheduledAt)

  // 3. Fast pre-check for early user feedback (non-atomic, before transaction)
  try {
    const { hasConflict, type } = await checkAppointmentConflict({
      psychologistProfileId,
      patientId: user.id,
      scheduledAt: scheduledAtDate,
      durationMinutes: data.durationMinutes,
    })

    if (hasConflict) {
      return {
        success: false,
        error:
          type === 'psychologist'
            ? 'Este horário já foi reservado ou entra em conflito com outra sessão do psicólogo.'
            : 'Sua agenda já possui um compromisso neste horário.',
      }
    }
  } catch (error) {
    logger.error('Conflict check error in createInsuranceAppointment:', error)
    return { success: false, error: 'Erro ao verificar disponibilidade.' }
  }

  // 4. Atomic conflict re-check + creation in a serializable transaction
  // This prevents double booking when two requests pass the pre-check concurrently.
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

    // Send notifications asynchronously
    sendAppointmentNotifications(newSession.id).catch((err) =>
      logger.error('Error sending insurance appt notifications:', err)
    )

    revalidateTag('appointments')
    revalidatePath('/', 'layout')

    return { success: true, data: newSession }
  } catch (error) {
    if (error instanceof AppointmentConflictError) {
      return {
        success: false,
        error:
          error.conflictType === 'psychologist'
            ? 'Este horário já foi reservado ou entra em conflito com outra sessão do psicólogo.'
            : 'Sua agenda já possui um compromisso neste horário.',
      }
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return {
        success: false,
        error: 'Este horário foi reservado simultaneamente. Por favor, escolha outro horário.',
      }
    }
    logger.error('Error creating insurance appointment:', error)
    return { success: false, error: 'Erro interno ao criar consulta.' }
  }
}
