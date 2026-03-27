'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/utils/logger'

export interface NotificationSettings {
  email: boolean
  push: boolean
  whatsapp: boolean
}

export async function getNotificationSettings() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const userDb = await (prisma.user as any).findUnique({
      where: { id: user.id },
      select: { notificationSettings: true },
    })

    return userDb?.notificationSettings as NotificationSettings | null
  } catch (error) {
    logger.error('Error fetching settings:', error)
    return null
  }
}

export async function updateNotificationSettings(settings: NotificationSettings) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Não autenticado' }
    }

    await (prisma.user as any).update({
      where: { id: user.id },
      data: { notificationSettings: settings },
    })

    revalidatePath('/dashboard/ajustes')
    return { success: true }
  } catch (error: any) {
    logger.error('Error updating settings:', error)
    return { success: false, error: error.message || 'Erro ao salvar preferências' }
  }
}
