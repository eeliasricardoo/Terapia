'use server'

import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/types'
import { cache } from 'react'

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
    console.error('Error getting user:', authError)
    return null
  }

  // Get user profile
  let { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()

  // If profile is missing (e.g. after a DB reset), try to recreate it from Auth metadata
  if (error && error.code === 'PGRST116') {
    console.log('Profile missing for user', user.id, 'recreating...')
    const meta = user.user_metadata
    const role = meta?.role || 'PATIENT'
    const fullName = meta?.full_name || user.email?.split('@')[0] || 'Usuário'

    // Create in Prisma first (required for FK constraints)
    try {
      const { prisma } = await import('@/lib/prisma')
      await prisma.user.upsert({
        where: { id: user.id },
        update: { email: user.email!, name: fullName },
        create: { id: user.id, email: user.email!, name: fullName, role: role as any },
      })

      // Create in Supabase profiles table
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: fullName,
          role: role,
          avatar_url: null,
        })
        .select()
        .single()

      if (!insertError) {
        data = newProfile
      }
    } catch (err) {
      console.error('Error auto-syncing profile:', err)
    }
  } else if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  // Ensure User role and Profile role are in sync
  try {
    const { prisma } = await import('@/lib/prisma')
    const userInDb = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (userInDb && userInDb.role !== (data as Profile).role) {
      console.log('Syncing user role with profile role...')
      await prisma.user.update({
        where: { id: user.id },
        data: { role: (data as Profile).role as any },
      })
    }
  } catch (err) {
    console.error('Error syncing user role:', err)
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
    console.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
