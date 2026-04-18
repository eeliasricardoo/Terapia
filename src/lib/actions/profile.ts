'use server'

import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/types'
import type { UserRole } from '@prisma/client'
import { cache } from 'react'
import { logger } from '@/lib/utils/logger'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

/**
 * Get the current logged-in user's profile
 */
export const getCurrentUserProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    logger.error('Error getting user:', authError)
    return null
  }

  const { prisma } = await import('@/lib/prisma')

  // Fast path: single Prisma query fetches the profile directly.
  const profile = await prisma.profile.findUnique({
    where: { user_id: user.id },
  })

  if (profile) {
    return {
      ...profile,
      full_name: profile.fullName,
      avatar_url: profile.avatarUrl,
      user_id: profile.user_id,
      created_at: profile.createdAt.toISOString(),
      updated_at: profile.updatedAt.toISOString(),
    } as unknown as Profile
  }

  // Slow path: profile missing — self-heal from Auth metadata.
  const meta = user.user_metadata
  const role = (meta?.role || 'PATIENT') as UserRole
  const fullName = meta?.full_name || user.email?.split('@')[0] || 'Usuário'

  try {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email!, name: fullName },
      create: { id: user.id, email: user.email!, name: fullName, role },
    })

    const newProfile = await prisma.profile.upsert({
      where: { user_id: user.id },
      update: { fullName },
      create: {
        user_id: user.id,
        fullName,
        role,
        avatarUrl: null,
      },
    })

    return {
      ...newProfile,
      full_name: newProfile.fullName,
      avatar_url: newProfile.avatarUrl,
      user_id: newProfile.user_id,
      created_at: newProfile.createdAt.toISOString(),
      updated_at: newProfile.updatedAt.toISOString(),
    } as unknown as Profile
  } catch (err) {
    logger.error('Error auto-syncing profile:', err)
    return null
  }
})

const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório').optional(),
  avatarUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  phone: z.string().optional(),
})

/**
 * Update current user's profile
 */
export const updateUserProfile = createSafeAction(updateProfileSchema, async (updates, user) => {
  const { prisma } = await import('@/lib/prisma')

  // Update in transaction to maintain sync between profiles and users
  await prisma.$transaction([
    prisma.profile.update({
      where: { user_id: user.id },
      data: {
        fullName: updates.fullName,
        avatarUrl: updates.avatarUrl,
        phone: updates.phone,
      },
    }),
    ...(updates.fullName
      ? [
          prisma.user.update({
            where: { id: user.id },
            data: { name: updates.fullName },
          }),
        ]
      : []),
  ])

  revalidatePath('/dashboard/configuracoes')
  revalidatePath('/dashboard', 'layout')
  return { success: true }
})
