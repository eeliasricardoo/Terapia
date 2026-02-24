'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'
import { logger } from '@/lib/utils/logger'

type Appointment = Database['public']['Tables']['appointments']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export type SessionWithDetails = Appointment & {
    psychologist: Profile | null
    patient: Profile | null
}

/**
 * Get all sessions (appointments) for a user
 */
export async function getUserSessions(
    userId: string
): Promise<SessionWithDetails[]> {
    const supabase = await createClient()

    // Query for appointments where user is either patient or psychologist
    const { data, error } = await supabase
        .from('appointments')
        .select(`
            *,
            psychologist:profiles!appointments_psychologist_id_fkey(*),
            patient:profiles!appointments_patient_id_fkey(*)
        `)
        .or(`patient_id.eq.${userId},psychologist_id.eq.${userId}`)
        .order('scheduled_at', { ascending: true })

    if (error) {
        logger.error('Error fetching user sessions:', error)
        return []
    }

    return data as SessionWithDetails[]
}

/**
 * Get the next upcoming session for a user
 */
export async function getNextSession(
    userId: string
): Promise<SessionWithDetails | null> {
    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
        .from('appointments')
        .select(`
            *,
            psychologist:profiles!appointments_psychologist_id_fkey(*),
            patient:profiles!appointments_patient_id_fkey(*)
        `)
        .or(`patient_id.eq.${userId},psychologist_id.eq.${userId}`)
        .gte('scheduled_at', now)
        .eq('status', 'scheduled')
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single()

    if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
            logger.error('Error fetching next session:', error)
        }
        return null
    }

    return data as SessionWithDetails
}

/**
 * Get session history for a user
 */
export async function getSessionHistory(
    userId: string,
    limit: number = 10
): Promise<SessionWithDetails[]> {
    const supabase = await createClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
        .from('appointments')
        .select(`
            *,
            psychologist:profiles!appointments_psychologist_id_fkey(*),
            patient:profiles!appointments_patient_id_fkey(*)
        `)
        .or(`patient_id.eq.${userId},psychologist_id.eq.${userId}`)
        .lte('scheduled_at', now) // History is past or current
        .order('scheduled_at', { ascending: false })
        .limit(limit)

    if (error) {
        logger.error('Error fetching session history:', error)
        return []
    }

    return data as SessionWithDetails[]
}

/**
 * Create a new session (appointment)
 */
export async function createSession(data: {
    patientId: string
    psychologistId: string
    scheduledAt: string
    durationMinutes: number
    // We remove the price parameter from client-side control to prevent price manipulation attacks
}) {
    const supabase = await createClient()

    // 1. Verify Authentication (Defense in Depth)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Usuário não autenticado' }
    }

    // 2. Prevent User Spoofing
    if (user.id !== data.patientId && user.id !== data.psychologistId) {
        return { success: false, error: 'Acesso negado. Você não pode agendar para terceiros.' }
    }

    // 3. Security: Fetch price securely from the backend to prevent tampering
    const { data: psychData, error: psychError } = await supabase
        .from('psychologist_profiles')
        .select('price_per_session')
        .eq('userId', data.psychologistId)
        .single()

    if (psychError || !psychData) {
        logger.error('Error fetching psychologist price:', psychError)
        return { success: false, error: 'Psicólogo não encontrado ou erro ao obter o preço.' }
    }

    const securePrice = psychData.price_per_session || 0

    // 4. Create the appointment
    const { data: newSession, error } = await supabase
        .from('appointments')
        .insert({
            patient_id: data.patientId,
            psychologist_id: data.psychologistId,
            scheduled_at: data.scheduledAt,
            duration_minutes: data.durationMinutes,
            price: securePrice, // PREVINE QUE O PACIENTE MUDE O PREÇO PARA 0 NO NAVEGADOR!
            status: 'scheduled'
        })
        .select()
        .single()

    if (error) {
        logger.error('Error creating session:', error)
        return { success: false, error: error.message }
    }

    return { success: true, data: newSession }
}

/**
 * Cancel a session
 */
export async function cancelSession(sessionId: string) {
    const supabase = await createClient()

    // 1. Verify Authentication (Defense in Depth)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Usuário não autenticado' }
    }

    // 2. Security: Verify Ownership Before Canceling
    // We check if the current user is either the patient or the psychologist for this specific appointment
    const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('patient_id, psychologist_id')
        .eq('id', sessionId)
        .single()

    if (fetchError || !appointment) {
        return { success: false, error: 'Sessão não encontrada' }
    }

    if (user.id !== appointment.patient_id && user.id !== appointment.psychologist_id) {
        // Log this attempt as it could be an attack
        logger.warn(`UNAUTHORIZED CANCEL ATTEMPT: User ${user.id} tried to cancel session ${sessionId}`)
        return { success: false, error: 'Acesso negado. Você não tem permissão para cancelar esta sessão.' }
    }

    // 3. Execute cancellation
    const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', sessionId)

    if (error) {
        logger.error('Error cancelling session:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
