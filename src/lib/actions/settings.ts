import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'
import { createSafeAction } from '@/lib/safe-action'

export const NotificationSettingsSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  whatsapp: z.boolean(),
})

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>

/**
 * Fetches notification settings for the current authenticated user.
 */
export const getNotificationSettingsAction = createSafeAction(
  z.void().optional(),
  async (_, user) => {
    const userDb = await prisma.user.findUnique({
      where: { id: user.id },
      select: { notificationSettings: true },
    })

    return (userDb?.notificationSettings as NotificationSettings) || null
  }
)

/**
 * Updates notification settings for the current authenticated user.
 * ENFORCES: Authentication, Zod validation, and consistent response types.
 */
export const updateNotificationSettings = createSafeAction(
  NotificationSettingsSchema,
  async (settings, user) => {
    await prisma.user.update({
      where: { id: user.id },
      data: { notificationSettings: settings },
    })

    revalidatePath('/dashboard/ajustes')
    return { success: true }
  }
)
