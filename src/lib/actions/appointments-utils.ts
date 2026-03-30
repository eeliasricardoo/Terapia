import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { Appointment, Prisma } from '@prisma/client'

/**
 * Checks if there is any appointment conflict for a psychologist or a patient
 * at a given time slot.
 */
export async function checkAppointmentConflict(
  {
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
  },
  tx?: Prisma.TransactionClient
) {
  const db = tx || prisma
  const newSessionStart = new Date(scheduledAt)
  const newSessionEnd = new Date(newSessionStart.getTime() + durationMinutes * 60 * 1000)

  // We search for appointments in a +/- 6 hour window to be safe and efficient
  // (Most sessions are 50-60 mins, so 6h is plenty)
  const windowStart = new Date(newSessionStart.getTime() - 6 * 60 * 60 * 1000)
  const windowEnd = new Date(newSessionStart.getTime() + 6 * 60 * 60 * 1000)
  try {
    // We use a more precise query to find conflicts directly in the database
    // to avoid fetching multiple records into memory.
    const conflict = await db.appointment.findFirst({
      where: {
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        status: { not: 'CANCELED' },
        OR: [
          { psychologistId: psychologistProfileId },
          patientId ? { patientId: patientId } : {},
        ].filter((cond) => Object.keys(cond).length > 0),
        // Overlap Logic:
        // A session conflicts if it starts before our new session ends
        // AND ends after our new session starts.
        // Since we don't have the end time stored, we check:
        // 1. Session starts during our interval [newSessionStart, newSessionEnd)
        // 2. Session starts before our interval and potentially covers it
        //    (we assume max session duration is 3 hours for this check)
        AND: [
          {
            scheduledAt: { lt: newSessionEnd },
          },
          {
            // If it started more than 3h ago, it's definitely ended (buffer).
            // We'll filter the edge cases in JS if needed or trust the findFirst.
            scheduledAt: { gt: new Date(newSessionStart.getTime() - 3 * 60 * 60 * 1000) },
          },
        ],
      },
    })

    if (conflict) {
      // Final confirmation in JS to handle varying durations (like 50 vs 90 min)
      const apptStart = new Date(conflict.scheduledAt)
      const apptEnd = new Date(apptStart.getTime() + conflict.durationMinutes * 60000)

      if (newSessionStart < apptEnd && newSessionEnd > apptStart) {
        const isPsychConflict = conflict.psychologistId === psychologistProfileId
        return {
          hasConflict: true,
          type: isPsychConflict ? 'psychologist' : 'patient',
          conflictingWith: conflict.id,
        }
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
