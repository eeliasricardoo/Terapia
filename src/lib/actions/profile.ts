'use server'

import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/supabase/types'

/**
 * Get the current logged-in user's profile
 */
export async function getCurrentUserProfile(): Promise<{ profile: Profile; email: string } | null> {
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
    let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    // If profile doesn't exist, create it
    if (error && error.code === 'PGRST116') {
        console.log('Profile not found, creating one...')
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                user_id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
                role: user.user_metadata?.role || 'PATIENT',
                phone: user.user_metadata?.phone || null,
                birth_date: user.user_metadata?.birth_date || null,
                document: user.user_metadata?.document || null,
                avatar_url: null,
            })
            .select()
            .single()

        if (insertError) {
            console.error('Error creating profile:', insertError)
            return null
        }

        data = newProfile
    } else if (error) {
        console.error('Error fetching user profile:', error)
        return null
    }

    return {
        profile: data as Profile,
        email: user.email || ''
    }
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
