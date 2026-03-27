'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'
import { createSafeAction } from '@/lib/safe-action'

import { NotificationSettingsSchema, NotificationSettings } from '@/lib/validations/settings'

/**
 * Fetches notification settings for the current authenticated user.
 */
export const getNotificationSettings = createSafeAction(z.void().optional(), async (_, user) => {
  // Handling potential stale Prisma types by using bracket notation for newest fields
  const userDb = await (prisma.user as any).findUnique({
    where: { id: user.id },
    select: { notificationSettings: true },
  })

  return (userDb?.notificationSettings as NotificationSettings) || null
})

/**
 * Updates notification settings for the current authenticated user.
 * ENFORCES: Authentication, Zod validation, and consistent response types.
 */
export const updateNotificationSettings = createSafeAction(
  NotificationSettingsSchema,
  async (settings, user) => {
    await (prisma.user as any).update({
      where: { id: user.id },
      data: { notificationSettings: settings },
    })

    revalidatePath('/dashboard/ajustes')
    return { success: true }
  }
)
