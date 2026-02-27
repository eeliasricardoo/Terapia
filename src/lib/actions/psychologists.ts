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

    const { data: psychologists, error } = await supabase
        .from('psychologist_profiles')
        .select('*')
        .eq('is_verified', true)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching psychologists:', error)
        return []
    }

    if (!psychologists || psychologists.length === 0) return []

    // Fetch related profiles
    const userIds = psychologists.map((p: any) => p.userId)
    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds)

    if (profilesError) {
        console.error('Error fetching psychologist profiles:', profilesError)
        return []
    }

    // Merge manual join
    return psychologists.map((psych: any) => {
        const profileInfo = profiles?.find((profile: any) => profile.user_id === psych.userId)
        return {
            ...psych,
            profile: profileInfo || null
        }
    }) as PsychologistWithProfile[]
}

/**
 * Get a single psychologist by user ID
 */
export async function getPsychologistById(
    userId: string
): Promise<PsychologistWithProfile | null> {
    const supabase = await createClient()

    const { data: psych, error } = await supabase
        .from('psychologist_profiles')
        .select('*')
        .eq('userId', userId)
        .eq('is_verified', true)
        .single()

    if (error || !psych) {
        if (error) console.error('Error fetching psychologist:', error)
        return null
    }

    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', psych.userId)
        .single()

    if (profileError) {
        console.error('Error fetching psychologist profile:', profileError)
        return null
    }

    return {
        ...psych,
        profile: profileData || null
    } as PsychologistWithProfile
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
        .select('*')
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

    const { data: psychologists, error } = await query.order('created_at', { ascending: false })

    if (error) {
        console.error('Error searching psychologists:', error)
        return []
    }

    if (!psychologists || psychologists.length === 0) return []

    const userIds = psychologists.map((p: any) => p.userId)

    // We fetch profiles
    let profilesQuery = supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds)

    // Filter by search query (name) here since it's in the profiles table
    if (filters.searchQuery) {
        profilesQuery = profilesQuery.ilike('full_name', `%${filters.searchQuery}%`)
    }

    const { data: profiles, error: profilesError } = await profilesQuery

    if (profilesError) {
        console.error('Error fetching psychologist profiles in search:', profilesError)
        return []
    }

    // Merge manual join and optionally filter if searchQuery was used
    // (if searchQuery was passing, then profiles array will be smaller, we should only return merged that have a matched profile)
    let merged = psychologists.map((psych: any) => {
        const profileInfo = profiles?.find((profile: any) => profile.user_id === psych.userId)
        return {
            ...psych,
            profile: profileInfo || null
        }
    })

    if (filters.searchQuery) {
        merged = merged.filter((item: any) => item.profile !== null)
    }

    return merged as PsychologistWithProfile[]
}

/**
 * Get psychologist statistics
 */
export async function getPsychologistStats(userId: string) {
    // This would require a sessions table - for now return mock data
    // TODO: Implement when sessions table is created
    return {
        totalSessions: 0,
        averageRating: 0,
        reviewCount: 0,
    }
}
