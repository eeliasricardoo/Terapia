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

  // Get current user from auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    logger.error('Error getting user:', authError)
    return null
  }

  // Get user profile
  let { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()

  // If profile is missing (e.g. after a DB reset), try to recreate it from Auth metadata
  if (error && error.code === 'PGRST116') {
    const meta = user.user_metadata
    const role = meta?.role || 'PATIENT'
    const fullName = meta?.full_name || user.email?.split('@')[0] || 'Usuário'

    // Create in Prisma first (required for FK constraints)
    try {
      const { prisma } = await import('@/lib/prisma')
      await prisma.user.upsert({
        where: { id: user.id },
        update: { email: user.email!, name: fullName },
        create: { id: user.id, email: user.email!, name: fullName, role: role as UserRole },
      })

      // Create in Supabase profiles table using Prisma to ensure defaults (like ID) are handled
      const newProfile = await prisma.profile.create({
        data: {
          user_id: user.id,
          fullName: fullName,
          role: role as UserRole,
          avatarUrl: null,
        },
      })

      if (newProfile) {
        data = newProfile as unknown as typeof data // Cast to match the Supabase return type
      }
    } catch (err) {
      logger.error('Error auto-syncing profile (Prisma/General):', err)
    }
  } else if (error) {
    logger.error('Error fetching user profile:', error)
    return null
  }

  // Ensure User role and Profile role are in sync
  try {
    const { prisma } = await import('@/lib/prisma')
    const userInDb = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (data && userInDb) {
      if (userInDb.role !== (data as Profile).role) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: (data as Profile).role as UserRole },
        })
      }
    } else {
      // Log exactly what is missing for debugging
      if (!data && !userInDb) logger.debug('Both profile data and userInDb are null')
      else if (!data) logger.debug('Profile data is null')
      else if (!userInDb) logger.debug('userInDb is null', { userId: user.id })
    }
  } catch (err) {
    logger.error('Error syncing user role:', err)
  }

  return data as Profile
})

const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório').optional(),
  avatarUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  phone: z.string().optional(),
})

/**
 * Update current user's profile
 */
export const updateUserProfileAction = createSafeAction(
  updateProfileSchema,
  async (updates, user) => {
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
  }
)
