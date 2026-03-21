import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { Appointment } from '@prisma/client'

/**
 * Checks if there is any appointment conflict for a psychologist or a patient
 * at a given time slot.
 */
export async function checkAppointmentConflict({
  psychologistProfileId,
  patientId,
  scheduledAt,
  durationMinutes,
  excludeAppointmentId,
}: {
  psychologistProfileId: string
  patientId?: string
  scheduledAt: Date
  durationMinutes: number
  excludeAppointmentId?: string
}) {
  const newSessionStart = new Date(scheduledAt)
  const newSessionEnd = new Date(newSessionStart.getTime() + durationMinutes * 60 * 1000)

  // We search for appointments in a +/- 6 hour window to be safe and efficient
  // (Most sessions are 50-60 mins, so 6h is plenty)
  const windowStart = new Date(newSessionStart.getTime() - 6 * 60 * 60 * 1000)
  const windowEnd = new Date(newSessionStart.getTime() + 6 * 60 * 60 * 1000)

  try {
    const existingConflicts = await prisma.appointment.findMany({
      where: {
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        status: { not: 'CANCELED' },
        scheduledAt: {
          gte: windowStart,
          lte: windowEnd,
        },
        OR: [
          { psychologistId: psychologistProfileId },
          patientId ? { patientId: patientId } : {},
        ].filter((cond) => Object.keys(cond).length > 0),
      },
    })

    const conflict = existingConflicts.find((appt: Appointment) => {
      const apptStart = new Date(appt.scheduledAt)
      const apptEnd = new Date(apptStart.getTime() + appt.durationMinutes * 60000)

      // Overlap formula: (StartA < EndB) and (EndB > StartA)
      return newSessionStart < apptEnd && newSessionEnd > apptStart
    })

    if (conflict) {
      const isPsychConflict = conflict.psychologistId === psychologistProfileId
      return {
        hasConflict: true,
        type: isPsychConflict ? 'psychologist' : 'patient',
        conflictingWith: conflict.id,
      }
    }

    return { hasConflict: false }
  } catch (error) {
    logger.error('Error checking appointment conflicts:', error)
    // In case of DB error, we can't be sure, so we might want to fail safe or proceed?
    // Usually failing safe is better for business rules.
    throw error
  }
}
