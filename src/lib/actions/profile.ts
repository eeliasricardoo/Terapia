'use server'

import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/types'
import type { UserRole } from '@prisma/client'
import { cache } from 'react'
import { logger } from '@/lib/utils/logger'

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
      if (!data && !userInDb) logger.debug('DEBUG: Both profile data and userInDb are null')
      else if (!data) logger.debug('DEBUG: Profile data is null')
      else if (!userInDb) logger.debug('DEBUG: userInDb is null for ID:', user.id)
    }
  } catch (err) {
    logger.error('Error syncing user role:', err)
  }

  return data as Profile
})

/**
 * Update current user's profile
 */
export async function updateUserProfile(updates: {
  full_name?: string
  avatar_url?: string
  phone?: string
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) {
    logger.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
