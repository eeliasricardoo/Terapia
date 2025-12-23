// Database Types - Generated from Supabase Schema
// Based on supabase/migrations/001_auth_setup.sql

export type UserRole = 'PATIENT' | 'PSYCHOLOGIST' | 'COMPANY' | 'ADMIN'

export interface Profile {
    id: string
    user_id: string
    full_name: string | null
    avatar_url: string | null
    role: UserRole
    phone: string | null
    birth_date: string | null
    document: string | null
    created_at: string
    updated_at: string
}

export interface PsychologistProfile {
    id: string
    userId: string
    crp: string | null
    bio: string | null
    specialties: string[]
    price_per_session: number | null
    video_presentation_url: string | null
    is_verified: boolean
    created_at: string
    updated_at: string
}

// Combined type for psychologist with profile data
export interface PsychologistWithProfile extends PsychologistProfile {
    profile: Profile
}

// Search filters for psychologists
export interface PsychologistSearchFilters {
    specialties?: string[]
    minPrice?: number
    maxPrice?: number
    languages?: string[]
    gender?: string
    searchQuery?: string
}

// Session types (to be created in future migration)
export interface Session {
    id: string
    patient_id: string
    psychologist_id: string
    scheduled_at: string
    duration_minutes: number
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
    meeting_url: string | null
    notes: string | null
    created_at: string
    updated_at: string
}

export interface SessionWithDetails extends Session {
    psychologist: PsychologistWithProfile
}
