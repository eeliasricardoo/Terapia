'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

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
  const newSessionStart = new Date(data.scheduledAt)
  const newSessionEnd = new Date(newSessionStart.getTime() + data.durationMinutes * 60 * 1000)

  try {
    const existingConflicts = await prisma.appointment.findMany({
      where: {
        psychologistId: psychologistProfileId,
        status: { notIn: ['CANCELED'] },
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
  } catch (error) {
    logger.error('Error checking conflicts:', error)
  }

  // 4. Create the appointment with insurance info
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

  revalidateTag('appointments')
  revalidatePath('/', 'layout')

  return { success: true, data: newSession }
}
