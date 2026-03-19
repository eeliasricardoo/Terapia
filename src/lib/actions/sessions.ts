'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { Database } from '@/lib/supabase/types'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { isValidUUID } from '@/lib/security'

type Appointment = Database['public']['Tables']['appointments']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export type SessionWithDetails = Appointment & {
  psychologist: Profile | null
  patient: Profile | null
}

/**
 * Get all sessions (appointments) for a user
 */
export async function getUserSessions(userId: string): Promise<SessionWithDetails[]> {
  const supabase = await createClient()

  // Query for appointments where user is either patient or psychologist
  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
            *,
            psychologist:profiles!appointments_psychologist_id_fkey(*),
            patient:profiles!appointments_patient_id_fkey(*)
        `
    )
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
export async function getNextSession(userId: string): Promise<SessionWithDetails | null> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
            *,
            psychologist:profiles!appointments_psychologist_id_fkey(*),
            patient:profiles!appointments_patient_id_fkey(*)
        `
    )
    .or(`patient_id.eq.${userId},psychologist_id.eq.${userId}`)
    .gte('scheduled_at', now)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      // PGRST116 is "The result contains 0 rows"
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
    .select(
      `
            *,
            psychologist:profiles!appointments_psychologist_id_fkey(*),
            patient:profiles!appointments_patient_id_fkey(*)
        `
    )
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
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  // 2. Prevent User Spoofing
  if (user.id !== data.patientId && user.id !== data.psychologistId) {
    return { success: false, error: 'Acesso negado. Você não pode agendar para terceiros.' }
  }

  // 3. Security: Fetch profile and price securely from the backend
  const { data: psychData, error: psychError } = await supabase
    .from('psychologist_profiles')
    .select('id, price_per_session')
    .eq('userId', data.psychologistId)
    .single()

  if (psychError || !psychData) {
    logger.error('Error fetching psychologist data:', psychError)
    return { success: false, error: 'Psicólogo não encontrado ou erro ao obter dados.' }
  }

  const psychologistProfileId = psychData.id
  const securePrice = psychData.price_per_session || 0

  // 4. Backend validation: Prevent double booking (Race condition protection)
  const newSessionStart = new Date(data.scheduledAt)
  const newSessionEnd = new Date(newSessionStart.getTime() + data.durationMinutes * 60 * 1000)

  // Consider appointments within a +/- 2h window for performance, but Prisma handles it well
  const existingAppts = await prisma.appointment.findMany({
    where: {
      psychologistId: psychologistProfileId,
      status: { notIn: ['CANCELED'] },
      scheduledAt: {
        gte: new Date(newSessionStart.getTime() - 120 * 60000),
        lte: new Date(newSessionStart.getTime() + 120 * 60000),
      },
    },
  })

  if (existingAppts) {
    const hasConflict = existingAppts.some((appt) => {
      const apptStart = new Date(appt.scheduledAt)
      const apptEnd = new Date(apptStart.getTime() + appt.durationMinutes * 60 * 1000)

      // Check for overlap: (StartA < EndB) and (EndA > StartB)
      return newSessionStart < apptEnd && newSessionEnd > apptStart
    })

    if (hasConflict) {
      return {
        success: false,
        error: 'Este horário já foi reservado ou entra em conflito com outra sessão.',
      }
    }
  }

  // 5. Create the appointment
  const { data: newSession, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: data.patientId,
      psychologist_id: psychologistProfileId,
      scheduled_at: data.scheduledAt,
      duration_minutes: data.durationMinutes,
      price: securePrice,
      status: 'SCHEDULED', // Use uppercase for enum consistency
    })
    .select()
    .single()

  if (error) {
    logger.error('Error creating session:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('appointments')
  revalidatePath('/', 'layout')

  return { success: true, data: newSession }
}

/**
 * Cancel a session
 */
export async function cancelSession(sessionId: string) {
  if (!isValidUUID(sessionId)) {
    return { success: false, error: 'ID de sessão inválido' }
  }

  const supabase = await createClient()

  // 1. Verify Authentication (Defense in Depth)
  const {
    data: { user },
  } = await supabase.auth.getUser()
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
    return {
      success: false,
      error: 'Acesso negado. Você não tem permissão para cancelar esta sessão.',
    }
  }

  // 3. Execute cancellation
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'CANCELED' })
    .eq('id', sessionId)

  if (error) {
    logger.error('Error cancelling session:', error)
    return { success: false, error: error.message }
  }

  revalidateTag('appointments')
  revalidatePath('/', 'layout')

  return { success: true }
}

/**
 * Reschedule a session
 */
export async function rescheduleSession(data: { sessionId: string; newScheduledAt: string }) {
  if (!isValidUUID(data.sessionId)) {
    return { success: false, error: 'ID de sessão inválido' }
  }

  const supabase = await createClient()

  // 1. Verify Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  // 2. Security: Verify Ownership & Session Info
  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', data.sessionId)
    .single()

  if (fetchError || !appointment) {
    return { success: false, error: 'Sessão não encontrada' }
  }

  if (user.id !== appointment.patient_id && user.id !== appointment.psychologist_id) {
    return {
      success: false,
      error: 'Acesso negado. Você não tem permissão para reagendar esta sessão.',
    }
  }

  // 3. Prevent rescheduling past sessions
  if (new Date(appointment.scheduled_at) < new Date()) {
    // Optional: Allow psychologists to reschedule past sessions if needed?
    // Usually patients can't reschedule after the time has passed.
    if (user.id === appointment.patient_id) {
      return {
        success: false,
        error: 'Não é possível reagendar uma sessão que já ocorreu ou está em andamento.',
      }
    }
  }

  // 4. Backend validation: Prevent double booking
  const newSessionStart = new Date(data.newScheduledAt)
  const newSessionEnd = new Date(
    newSessionStart.getTime() + appointment.duration_minutes * 60 * 1000
  )

  try {
    // USE PRISMA to bypass RLS and see all conflicts for this psychologist
    // We check for any appointment that starts before our end AND ends after our start
    const existingConflicts = await prisma.appointment.findMany({
      where: {
        psychologistId: appointment.psychologist_id,
        id: { not: data.sessionId },
        status: { notIn: ['CANCELED'] },
        // (StartA < EndB) AND (EndA > StartB)
        // Since we don't know the exact end time of all existing sessions easily in a single query
        // we'll fetch sessions within our +/- 2h window and check in memory
        scheduledAt: {
          gte: new Date(newSessionStart.getTime() - 120 * 60000),
          lte: new Date(newSessionStart.getTime() + 120 * 60000),
        },
      },
    })

    const hasConflict = existingConflicts.some((appt) => {
      const apptStart = new Date(appt.scheduledAt)
      const apptEnd = new Date(apptStart.getTime() + appt.durationMinutes * 60000)
      return newSessionStart < apptEnd && newSessionEnd > apptStart
    })

    if (hasConflict) {
      return {
        success: false,
        error: 'Este horário já foi reservado ou entra em conflito com outra sessão.',
      }
    }
  } catch (error: any) {
    logger.error('Reschedule conflict check error:', {
      psychId: appointment.psychologist_id,
      sessionId: data.sessionId,
      error: error.message || error,
      stack: error.stack,
    })
    return {
      success: false,
      error: `Erro ao verificar disponibilidade: ${error.message || 'Erro desconhecido'}`,
    }
  }

  // 5. Update the appointment
  const { data: updatedSession, error: updateError } = await supabase
    .from('appointments')
    .update({
      scheduled_at: data.newScheduledAt,
      status: 'SCHEDULED',
    })
    .eq('id', data.sessionId)
    .select()
    .single()

  if (updateError) {
    logger.error('Error rescheduling session:', updateError)
    return { success: false, error: updateError.message }
  }

  revalidateTag('appointments')
  revalidatePath('/', 'layout')

  return { success: true, data: updatedSession }
}

/**
 * Get session summary with evolution notes
 */
export async function getSessionSummary(sessionId: string) {
  if (!isValidUUID(sessionId)) {
    return null
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch appointment with profile data
  const { data: appointment, error: apptError } = await supabase
    .from('appointments')
    .select(
      `
      *,
      psychologist:profiles!appointments_psychologist_id_fkey(*)
    `
    )
    .eq('id', sessionId)
    .single()

  if (apptError || !appointment) return null

  // Verify ownership
  if (user.id !== appointment.patient_id && user.id !== appointment.psychologist_id) {
    return null
  }

  // Fetch psychologist profile for specialties
  const { data: psychProfile } = await supabase
    .from('psychologist_profiles')
    .select('specialties')
    .eq('userId', appointment.psychologist_id)
    .single()

  // Fetch the closest evolution note for this session
  const { data: evolution } = await supabase
    .from('evolutions')
    .select('public_summary, mood, date')
    .eq('patient_id', appointment.patient_id)
    .eq('psychologist_id', appointment.psychologist_id)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()

  return {
    id: appointment.id,
    durationMinutes: appointment.duration_minutes,
    scheduledAt: appointment.scheduled_at,
    status: appointment.status,
    psychologistName:
      (appointment.psychologist as { full_name?: string | null })?.full_name || 'Especialista',
    specialty: psychProfile?.specialties?.[0] || 'Psicologia',
    publicSummary: evolution?.public_summary || null,
    mood: evolution?.mood || null,
  }
}
