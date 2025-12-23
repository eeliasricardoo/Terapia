'use server'

import { createClient } from '@/lib/supabase/server'
import type {
    PsychologistWithProfile,
    PsychologistSearchFilters,
} from '@/lib/supabase/types'

/**
 * Get all verified psychologists
 */
export async function getPsychologists(): Promise<PsychologistWithProfile[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('psychologist_profiles')
        .select(`
      *,
      profile:profiles(*)
    `)
        .eq('is_verified', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching psychologists:', error)
        return []
    }

    return data as PsychologistWithProfile[]
}

/**
 * Get a single psychologist by user ID
 */
export async function getPsychologistById(
    userId: string
): Promise<PsychologistWithProfile | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('psychologist_profiles')
        .select(`
      *,
      profile:profiles(*)
    `)
        .eq('userId', userId)
        .eq('is_verified', true)
        .single()

    if (error) {
        console.error('Error fetching psychologist:', error)
        return null
    }

    return data as PsychologistWithProfile
}

/**
 * Search psychologists with filters
 */
export async function searchPsychologists(
    filters: PsychologistSearchFilters = {}
): Promise<PsychologistWithProfile[]> {
    const supabase = await createClient()

    let query = supabase
        .from('psychologist_profiles')
        .select(`
      *,
      profile:profiles(*)
    `)
        .eq('is_verified', true)

    // Filter by specialties
    if (filters.specialties && filters.specialties.length > 0) {
        query = query.overlaps('specialties', filters.specialties)
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
        query = query.gte('price_per_session', filters.minPrice)
    }
    if (filters.maxPrice !== undefined) {
        query = query.lte('price_per_session', filters.maxPrice)
    }

    // Search by name (if searchQuery provided)
    if (filters.searchQuery) {
        query = query.ilike('profile.full_name', `%${filters.searchQuery}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('Error searching psychologists:', error)
        return []
    }

    return data as PsychologistWithProfile[]
}

/**
 * Get psychologist statistics
 */
export async function getPsychologistStats(userId: string) {
    const supabase = await createClient()

    // This would require a sessions table - for now return mock data
    // TODO: Implement when sessions table is created
    return {
        totalSessions: 0,
        averageRating: 0,
        reviewCount: 0,
    }
}
