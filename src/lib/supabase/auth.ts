import { createClient } from './client'

export type UserRole = 'PATIENT' | 'PSYCHOLOGIST' | 'COMPANY' | 'ADMIN'

export interface UserMetadata {
    role: UserRole
    full_name?: string
    avatar_url?: string
    phone?: string
    birth_date?: string
    document?: string
}

// Client-side auth functions
export const auth = {
    // Sign up with email and password
    async signUp(email: string, password: string, metadata?: UserMetadata) {
        const supabase = createClient()

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        })

        return { data, error }
    },

    // Sign in with email and password
    async signIn(email: string, password: string) {
        const supabase = createClient()

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        return { data, error }
    },

    // Sign in with OAuth (Google, etc)
    async signInWithOAuth(provider: 'google' | 'github') {
        const supabase = createClient()

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        return { data, error }
    },

    // Sign out
    async signOut() {
        const supabase = createClient()
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    // Get current session
    async getSession() {
        const supabase = createClient()
        const { data, error } = await supabase.auth.getSession()
        return { data, error }
    },

    // Get current user
    async getUser() {
        const supabase = createClient()
        const { data, error } = await supabase.auth.getUser()
        return { data, error }
    },

    // Reset password
    async resetPassword(email: string) {
        const supabase = createClient()

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        })

        return { data, error }
    },

    // Update password
    async updatePassword(newPassword: string) {
        const supabase = createClient()

        const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
        })

        return { data, error }
    },

    // Update user metadata
    async updateMetadata(metadata: Partial<UserMetadata>) {
        const supabase = createClient()

        const { data, error } = await supabase.auth.updateUser({
            data: metadata,
        })

        return { data, error }
    },
}
