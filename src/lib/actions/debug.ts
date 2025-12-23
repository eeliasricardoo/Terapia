import { createClient } from '@/lib/supabase/server'

/**
 * Debug function to check user authentication and profile status
 */
export async function debugUserProfile() {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('=== DEBUG USER PROFILE ===')
    console.log('Auth Error:', authError)
    console.log('User:', user ? {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
    } : 'No user')

    if (!user) {
        return { authenticated: false }
    }

    // Check for profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    console.log('Profile Error:', profileError)
    console.log('Profile:', profile)

    return {
        authenticated: true,
        hasProfile: !!profile,
        user,
        profile,
        profileError
    }
}
