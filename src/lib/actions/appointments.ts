'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { sendAppointmentNotifications } from './notifications'
import { checkAppointmentConflict } from './appointments-utils'

/**
 * Create a new appointment covered by health insurance
 */
export async function createInsuranceAppointment(data: {
  psychologistId: string
  scheduledAt: string
  durationMinutes: number
  healthInsuranceId: string
  healthInsurancePolicy: string
}) {
  const supabase = await createClient()

  // 1. Verify Authentication
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Usuário não autenticado' }
  }

  // 2. Fetch psychologist profile ID
  const { data: psychData, error: psychError } = await supabase
    .from('psychologist_profiles')
    .select('id')
    .eq('userId', data.psychologistId)
    .single()

  if (psychError || !psychData) {
    logger.error('Error fetching psychologist data:', psychError)
    return { success: false, error: 'Psicólogo não encontrado.' }
  }

  const psychologistProfileId = psychData.id

  // 3. Prevent double booking
  try {
    const { hasConflict, type } = await checkAppointmentConflict({
      psychologistProfileId,
      patientId: user.id,
      scheduledAt: new Date(data.scheduledAt),
      durationMinutes: data.durationMinutes,
    })

    if (hasConflict) {
      return {
        success: false,
        error:
          type === 'psychologist'
            ? 'Este horário já foi reservado ou entra em conflito com outra sessão do psicólogo.'
            : 'Sua agenda já possui um compromisso neste horário.',
      }
    }
  } catch (error) {
    logger.error('Conflict check error in createInsuranceAppointment:', error)
    return { success: false, error: 'Erro ao verificar disponibilidade.' }
  }

  const { data: newSession, error } = await supabase
    .from('appointments')
    .insert({
      patient_id: user.id,
      psychologist_id: psychologistProfileId,
      scheduled_at: data.scheduledAt,
      duration_minutes: data.durationMinutes,
      price: 0, // Insurance covered
      status: 'SCHEDULED',
      health_insurance_plan_id: data.healthInsuranceId,
      health_insurance_policy: data.healthInsurancePolicy,
    })
    .select()
    .single()

  if (error) {
    logger.error('Error creating insurance session:', error)
    return { success: false, error: error.message }
  }

  // Send notifications asynchronously
  sendAppointmentNotifications(newSession.id).catch((err) =>
    logger.error('Error sending insurance appt notifications:', err)
  )

  revalidateTag('appointments')
  revalidatePath('/', 'layout')

  return { success: true, data: newSession }
}
