'use server'

import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/types'

/**
 * Get the current logged-in user's profile
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
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
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error) {
        console.error('Error fetching user profile:', error)
        return null
    }

    return data as Profile
}

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
