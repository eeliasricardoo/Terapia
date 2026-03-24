'use server'

import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'

// ─── Types ────────────────────────────────────────────────────────

export type ServicesConfigData = {
  sessionPrice: string
  sessionDuration: string
  averagePlatformPrice: string | null
  monthlyPlanEnabled: boolean
  monthlyPlanSessions: number
  monthlyPlanDiscount: number
}

// ─── Get Services Config ──────────────────────────────────────────

export async function getServicesConfig(): Promise<
  { success: true; data: ServicesConfigData } | { success: false; error: string }
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Não autenticado' }
    }

    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId: user.id },
      select: {
        pricePerSession: true,
        sessionDuration: true,
        monthlyPlanEnabled: true,
        monthlyPlanSessions: true,
        monthlyPlanDiscount: true,
      },
    })

    if (!profile) {
      return { success: false, error: 'Perfil de psicólogo não encontrado' }
    }

    // Calculate platform average price from all psychologists who have set a price
    const avgResult = await prisma.psychologistProfile.aggregate({
      _avg: {
        pricePerSession: true,
      },
      where: {
        pricePerSession: { not: null },
      },
    })

    const averagePrice = avgResult._avg.pricePerSession
      ? Number(avgResult._avg.pricePerSession).toFixed(2)
      : null

    return {
      success: true,
      data: {
        sessionPrice: profile.pricePerSession ? Number(profile.pricePerSession).toFixed(2) : '',
        sessionDuration: profile.sessionDuration.toString(),
        averagePlatformPrice: averagePrice,
        monthlyPlanEnabled: profile.monthlyPlanEnabled,
        monthlyPlanSessions: profile.monthlyPlanSessions,
        monthlyPlanDiscount: profile.monthlyPlanDiscount,
      },
    }
  } catch (error) {
    logger.error('Error fetching services config', { error })
    return { success: false, error: 'Erro ao carregar configurações' }
  }
}

// ─── Patient Services View ────────────────────────────────────────

export type PatientServicesData = {
  psychologistUserId: string
  psychologistName: string
  /** Base price per single session */
  sessionPrice: number | null
  sessionDuration: number
  /** Monthly plan pricing — null if psychologist disabled the monthly plan */
  monthly: {
    pricePerSession: number
    total: number
    discountPercent: number
    sessions: number
  } | null
  /** Custom plans created by the psychologist */
  plans: {
    id: string
    name: string
    sessions: number
    price: number
    discount: number
  }[]
}

export async function getPatientServicesView(): Promise<
  { success: true; data: PatientServicesData } | { success: false; error: string }
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Não autenticado' }
    }

    // Get most recent appointment to find the patient's psychologist
    const appointment = await prisma.appointment.findFirst({
      where: { patientId: user.id },
      orderBy: { scheduledAt: 'desc' },
      select: { psychologistId: true },
    })

    if (!appointment) {
      return { success: false, error: 'Nenhum psicólogo encontrado' }
    }

    const psych = await prisma.psychologistProfile.findUnique({
      where: { id: appointment.psychologistId },
      select: {
        userId: true,
        pricePerSession: true,
        sessionDuration: true,
        monthlyPlanEnabled: true,
        monthlyPlanSessions: true,
        monthlyPlanDiscount: true,
      },
    })

    if (!psych) {
      return { success: false, error: 'Psicólogo não encontrado' }
    }

    const psychUser = await prisma.user.findUnique({
      where: { id: psych.userId },
      select: { name: true },
    })

    const plans = await prisma.plan.findMany({
      where: { psychologistId: appointment.psychologistId, active: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, sessions: true, price: true, discount: true },
    })

    const basePrice = psych.pricePerSession ? Number(psych.pricePerSession) : null
    const discountFraction = (psych.monthlyPlanDiscount ?? 20) / 100
    const sessions = psych.monthlyPlanSessions ?? 4
    const monthly =
      psych.monthlyPlanEnabled && basePrice
        ? {
            pricePerSession: basePrice * (1 - discountFraction),
            total: basePrice * (1 - discountFraction) * sessions,
            discountPercent: psych.monthlyPlanDiscount ?? 20,
            sessions,
          }
        : null

    return {
      success: true,
      data: {
        psychologistUserId: psych.userId,
        psychologistName: psychUser?.name || 'Psicólogo',
        sessionPrice: basePrice,
        sessionDuration: psych.sessionDuration,
        monthly,
        plans: plans.map((p) => ({
          id: p.id,
          name: p.name,
          sessions: p.sessions,
          price: Number(p.price),
          discount: p.discount,
        })),
      },
    }
  } catch (error) {
    logger.error('Error fetching patient services view', { error })
    return { success: false, error: 'Erro ao carregar serviços' }
  }
}

// ─── Patient Booking Data (full widget data) ──────────────────────

import type { PsychologistWithProfile } from '@/lib/supabase/types'
import type { PsychologistAvailability, TimeSlot } from '@/lib/actions/availability'

export type PatientBookingData = {
  psychologist: PsychologistWithProfile
  availability: PsychologistAvailability
}

export async function getPatientBookingData(): Promise<
  { success: true; data: PatientBookingData } | { success: false; error: string }
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Não autenticado' }

    // Find most recent appointment to get psychologist
    const appointment = await prisma.appointment.findFirst({
      where: { patientId: user.id },
      orderBy: { scheduledAt: 'desc' },
      select: { psychologistId: true },
    })

    if (!appointment) return { success: false, error: 'Nenhum psicólogo encontrado' }

    // Fetch psychologist profile from Supabase (needed for PsychologistWithProfile shape)
    const { data: psych, error: psychError } = await supabase
      .from('psychologist_profiles')
      .select('*')
      .eq('id', appointment.psychologistId)
      .single()

    if (psychError || !psych) return { success: false, error: 'Psicólogo não encontrado' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', psych.userId)
      .single()

    // Fetch overrides & appointments for availability
    const recentPastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const { data: overridesRes } = await supabase
      .from('schedule_overrides')
      .select('date, type, slots')
      .eq('psychologist_id', psych.id)
      .gte('date', recentPastDate)

    const appointmentList = await prisma.appointment.findMany({
      where: {
        psychologistId: psych.id,
        status: { notIn: ['CANCELED'] },
        scheduledAt: { gte: new Date(recentPastDate) },
      },
      select: { id: true, scheduledAt: true, durationMinutes: true },
    })

    const overridesMap: Record<string, { type: 'blocked' | 'custom'; slots: TimeSlot[] }> = {}
    if (overridesRes) {
      overridesRes.forEach((o) => {
        overridesMap[o.date] = {
          type: o.type as 'blocked' | 'custom',
          slots: o.slots as unknown as TimeSlot[],
        }
      })
    }

    const availability: PsychologistAvailability = {
      timezone: psych.timezone || 'America/Sao_Paulo',
      weeklySchedule: psych.weekly_schedule || null,
      overrides: overridesMap,
      appointments: appointmentList.map((a) => ({
        id: a.id,
        scheduled_at: a.scheduledAt.toISOString(),
        duration_minutes: a.durationMinutes,
      })),
    }

    return {
      success: true,
      data: {
        psychologist: { ...psych, profile: profile || null } as PsychologistWithProfile,
        availability,
      },
    }
  } catch (error) {
    logger.error('Error fetching patient booking data', { error })
    return { success: false, error: 'Erro ao carregar dados de agendamento' }
  }
}

// ─── Save General Config ──────────────────────────────────────────

export async function saveGeneralConfig(
  sessionPrice: string,
  sessionDuration: string,
  monthlyPlan: { enabled: boolean; sessions: number; discount: number }
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Não autenticado' }
    }

    const price = parseFloat(sessionPrice)
    const duration = parseInt(sessionDuration, 10)

    if (isNaN(price) || price <= 0) {
      return { success: false, error: 'Valor da sessão inválido' }
    }

    if (isNaN(duration) || duration <= 0) {
      return { success: false, error: 'Duração da sessão inválida' }
    }

    await prisma.psychologistProfile.update({
      where: { userId: user.id },
      data: {
        pricePerSession: price,
        sessionDuration: duration,
        monthlyPlanEnabled: monthlyPlan.enabled,
        monthlyPlanSessions: monthlyPlan.sessions,
        monthlyPlanDiscount: monthlyPlan.discount,
      },
    })

    return { success: true }
  } catch (error) {
    logger.error('Error saving general config', { error })
    return { success: false, error: 'Erro ao salvar configurações' }
  }
}
