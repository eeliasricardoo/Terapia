'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  PsychologistWithProfile,
  PsychologistSearchFilters,
  PsychologistProfile,
  Profile,
} from '@/lib/supabase/types'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

/**
 * Get all verified psychologists
 */
export async function getPsychologists(): Promise<PsychologistWithProfile[]> {
  const supabase = await createClient()

  const { data: psychologists, error } = await supabase
    .from('psychologist_profiles')
    .select('*')
    .eq('is_verified', true)
    .eq('stripe_onboarding_complete', true)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching psychologists:', error)
    return []
  }

  if (!psychologists || psychologists.length === 0) return []

  // Fetch related profiles
  const userIds = psychologists.map((p: PsychologistProfile) => p.userId)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('user_id', userIds)

  if (profilesError) {
    logger.error('Error fetching psychologist profiles:', profilesError)
    return []
  }

  // Merge manual join
  return psychologists.map((psych: PsychologistProfile) => {
    const profileInfo = (profiles as Profile[])?.find((profile) => profile.user_id === psych.userId)
    return {
      ...psych,
      profile: profileInfo || null,
    }
  }) as PsychologistWithProfile[]
}

/**
 * Get a single psychologist by user ID
 */
export async function getPsychologistById(userId: string): Promise<PsychologistWithProfile | null> {
  const supabase = await createClient()

  const { data: psych, error } = await supabase
    .from('psychologist_profiles')
    .select('*')
    .or(`id.eq.${userId},userId.eq.${userId}`)
    .single()

  if (error || !psych) {
    if (error) logger.error('Error fetching psychologist:', error)
    return null
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', psych.userId)
    .single()

  if (profileError) {
    logger.error('Error fetching psychologist profile:', profileError)
    return null
  }

  const { data: insurancesRes } = await supabase
    .from('psychologist_insurances')
    .select('health_insurance:health_insurances(id, name)')
    .eq('psychologist_id', psych.id)

  const acceptedInsurances = insurancesRes
    ? insurancesRes
        .map((item) => {
          const hi = (item as any).health_insurance
          return Array.isArray(hi) ? hi[0] : hi
        })
        .filter(Boolean)
    : []

  return {
    ...psych,
    profile: profileData || null,
    acceptedInsurances,
  } as PsychologistWithProfile & { acceptedInsurances: { id: string; name: string }[] }
}

/**
 * Search psychologists with filters
 */
export async function searchPsychologists(
  filters: PsychologistSearchFilters = {}
): Promise<PsychologistWithProfile[]> {
  const supabase = await createClient()

  const { page = 1, pageSize = 12 } = filters
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('psychologist_profiles')
    .select('*')
    .eq('is_verified', true)
    .eq('stripe_onboarding_complete', true)

  // Filter by specialties
  if (filters.specialties && filters.specialties.length > 0) {
    query = query.overlaps('specialties', filters.specialties)
  }

  // Filter by health insurances
  if (filters.healthInsurances && filters.healthInsurances.length > 0) {
    const { data: linkedPsychs, error: insuranceError } = await supabase
      .from('psychologist_insurances')
      .select('psychologist_id')
      .in('health_insurance_id', filters.healthInsurances)

    if (insuranceError) {
      logger.error('Error fetching linked psychologists by insurance:', insuranceError)
    }

    if (linkedPsychs && linkedPsychs.length > 0) {
      const psychIds = Array.from(
        new Set(linkedPsychs.map((hp: { psychologist_id: string }) => hp.psychologist_id))
      )
      query = query.in('id', psychIds)
    } else {
      // If no psychologists match the insurance filter, return empty
      return []
    }
  }

  // Filter by price range
  if (filters.minPrice !== undefined) {
    query = query.gte('price_per_session', filters.minPrice)
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price_per_session', filters.maxPrice)
  }

  // Apply pagination only if searchQuery is NOT provided
  if (!filters.searchQuery) {
    query = query.range(from, to)
  }

  const { data: psychologists, error } = await query.order('created_at', { ascending: false })

  if (error) {
    logger.error('Error searching psychologists:', error)
    return []
  }

  if (!psychologists || psychologists.length === 0) return []

  const userIds = psychologists.map((p: PsychologistProfile) => p.userId)

  // Fetch profiles
  let profilesQuery = supabase.from('profiles').select('*').in('user_id', userIds)

  // Filter by search query (name) here since it's in the profiles table
  if (filters.searchQuery) {
    profilesQuery = profilesQuery.ilike('full_name', `%${filters.searchQuery}%`)
  }

  const { data: profiles, error: profilesError } = await profilesQuery

  if (profilesError) {
    logger.error('Error fetching psychologist profiles in search:', profilesError)
    return []
  }

  // Merge manual join and optionally filter if searchQuery was used
  let merged = psychologists.map((psych: PsychologistProfile) => {
    const profileInfo = (profiles as Profile[]).find((profile) => profile.user_id === psych.userId)
    return {
      ...psych,
      profile: profileInfo || null,
    }
  })

  if (filters.searchQuery) {
    merged = merged.filter((item) => item.profile !== null)
    // Manually paginate the filtered results if searchQuery was used
    merged = merged.slice(from, to + 1)
  }

  return merged as PsychologistWithProfile[]
}

/**
 * Get psychologist statistics
 */
export async function getPsychologistStats(userId: string) {
  try {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!profile) {
      return { totalSessions: 0 }
    }

    const totalSessions = await prisma.appointment.count({
      where: {
        psychologistId: profile.id,
        status: 'COMPLETED',
      },
    })

    return { totalSessions }
  } catch (error) {
    logger.error('Error fetching psychologist stats:', error)
    return { totalSessions: 0 }
  }
}
