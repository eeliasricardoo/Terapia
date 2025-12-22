import { createClient } from './server'

// Server-side auth functions (use only in Server Components and Server Actions)
export const serverAuth = {
    // Get current session on server
    async getSession() {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.getSession()
        return { data, error }
    },

    // Get current user on server
    async getUser() {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.getUser()
        return { data, error }
    },
}
