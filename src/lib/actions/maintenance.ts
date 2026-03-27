'use server'

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

/**
 * Maintenance action to clean up stale PENDING_PAYMENT appointments.
 * Appointments stay in PENDING_PAYMENT when a user starts checkout but never completes it.
 * This script should be called by a CRON job (e.g. Vercel Cron, github actions) every 15-30 mins.
 */
export const cleanupPendingAppointments = createSafeAction(
  z.object({
    maxAgeMinutes: z.number().int().min(15).max(1440).optional().default(60),
  }),
  async (input) => {
    const ageLimit = new Date(Date.now() - input.maxAgeMinutes * 60 * 1000)

    try {
      const deleted = await prisma.appointment.deleteMany({
        where: {
          status: 'PENDING_PAYMENT',
          createdAt: { lt: ageLimit },
        },
      })

      if (deleted.count > 0) {
        logger.info(`Maintenance: Cleaned up ${deleted.count} stale pending appointments.`)
      }

      return { count: deleted.count }
    } catch (error) {
      logger.error('Maintenance error during pending appointment cleanup:', error)
      throw error
    }
  },
  { requiredRole: 'ADMIN' } // Only admins or system-triggered calls should run this.
)
