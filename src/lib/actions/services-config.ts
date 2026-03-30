'use server'

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'
import type {
  TimeSlot,
  PsychologistAvailability,
  WeeklyScheduleData,
} from '@/lib/validations/availability'
import type { PsychologistWithProfile } from '@/lib/supabase/types'

// ─── Types & Schemas ──────────────────────────────────────────────

export type PatientBookingData = {
  psychologist: PsychologistWithProfile
  availability: PsychologistAvailability | null
}

export type PatientServicesData = {
  psychologistUserId: string
  psychologistName: string
  sessionPrice: number | null
  sessionDuration: number
  monthly: {
    pricePerSession: number
    total: number
    discountPercent: number
    sessions: number
  } | null
  plans: { id: string; name: string; sessions: number; price: number; discount: number }[]
}

export type ServicesConfigData = {
  sessionPrice: string
  sessionDuration: string
  averagePlatformPrice: string | null
  monthlyPlanEnabled: boolean
  monthlyPlanSessions: number
  monthlyPlanDiscount: number
}

const saveGeneralConfigSchema = z.object({
  sessionPrice: z.string().min(1),
  sessionDuration: z.string().min(1),
  monthlyPlan: z.object({
    enabled: z.boolean(),
    sessions: z.number().int().positive(),
    discount: z.number().min(0).max(100),
  }),
})

// ─── Actions ──────────────────────────────────────────────────────

export const getServicesConfig = createSafeAction(
  z.void().optional(),
  async (_, user): Promise<ServicesConfigData> => {
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

    if (!profile) throw new Error('Perfil de psicólogo não encontrado')

    const avgResult = await prisma.psychologistProfile.aggregate({
      _avg: { pricePerSession: true },
      where: { pricePerSession: { not: null } },
    })

    const averagePrice = avgResult._avg.pricePerSession
      ? Number(avgResult._avg.pricePerSession).toFixed(2)
      : null

    return {
      sessionPrice: profile.pricePerSession ? Number(profile.pricePerSession).toFixed(2) : '',
      sessionDuration: profile.sessionDuration.toString(),
      averagePlatformPrice: averagePrice,
      monthlyPlanEnabled: profile.monthlyPlanEnabled,
      monthlyPlanSessions: profile.monthlyPlanSessions,
      monthlyPlanDiscount: profile.monthlyPlanDiscount,
    }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)

export const getPatientBookingData = createSafeAction(
  z.void().optional(),
  async (_, user): Promise<PatientBookingData> => {
    const appointment = await prisma.appointment.findFirst({
      where: { patientId: user.id },
      orderBy: { scheduledAt: 'desc' },
      select: { psychologistId: true },
    })

    if (!appointment) throw new Error('Nenhum psicólogo encontrado')

    const psych = await prisma.psychologistProfile.findUnique({
      where: { id: appointment.psychologistId },
      include: {
        user: { include: { profiles: true } },
      },
    })

    if (!psych) throw new Error('Psicólogo não encontrado')

    const userProfile = psych.user?.profiles || null
    const profile = userProfile
      ? {
          id: userProfile.id,
          user_id: userProfile.user_id,
          full_name: userProfile.fullName,
          avatar_url: userProfile.avatarUrl,
          role: userProfile.role,
          birth_date: userProfile.birth_date ? userProfile.birth_date.toISOString() : null,
          document: userProfile.document,
          phone: userProfile.phone,
          created_at: userProfile.createdAt.toISOString(),
          updated_at: userProfile.updatedAt.toISOString(),
        }
      : null

    const psychologist = {
      id: psych.id,
      userId: psych.userId,
      crp: psych.crp,
      bio: psych.bio,
      specialties: psych.specialties,
      price_per_session: psych.pricePerSession ? Number(psych.pricePerSession) : null,
      video_presentation_url: psych.videoPresentationUrl,
      is_verified: psych.isVerified,
      weekly_schedule: psych.weeklySchedule as WeeklyScheduleData | null,
      timezone: psych.timezone,
      academic_level: psych.academicLevel,
      session_duration: psych.sessionDuration,
      years_of_experience: psych.yearsOfExperience,
      university: psych.university,
      external_scheduling_url: psych.externalSchedulingUrl,
      monthly_plan_discount: psych.monthlyPlanDiscount,
      monthly_plan_enabled: psych.monthlyPlanEnabled,
      monthly_plan_sessions: psych.monthlyPlanSessions,
      created_at: psych.createdAt.toISOString(),
      updated_at: psych.updatedAt.toISOString(),
      profile,
    } as unknown as PsychologistWithProfile

    const recentPastDateStr = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const [overridesList, appointmentList] = await Promise.all([
      prisma.scheduleOverride.findMany({
        where: { psychologistId: psych.id, date: { gte: recentPastDateStr } },
        select: { date: true, type: true, slots: true },
      }),
      prisma.appointment.findMany({
        where: {
          psychologistId: psych.id,
          status: { notIn: ['CANCELED'] },
          scheduledAt: { gte: new Date(recentPastDateStr) },
        },
        select: { id: true, scheduledAt: true, durationMinutes: true },
      }),
    ])

    const overrides: Record<string, { type: 'blocked' | 'custom'; slots: TimeSlot[] }> = {}
    overridesList.forEach((o) => {
      overrides[o.date] = {
        type: o.type as 'blocked' | 'custom',
        slots: (o.slots as unknown as TimeSlot[]) || [],
      }
    })

    const availability: PsychologistAvailability = {
      timezone: psych.timezone || 'America/Sao_Paulo',
      weeklySchedule: psych.weeklySchedule as WeeklyScheduleData | null,
      overrides,
      appointments: appointmentList.map((a) => ({
        id: a.id,
        scheduled_at: a.scheduledAt.toISOString(),
        duration_minutes: a.durationMinutes,
      })),
    }

    return { psychologist, availability }
  }
)

export const getPatientServicesView = createSafeAction(z.void().optional(), async (_, user) => {
  const appointment = await prisma.appointment.findFirst({
    where: { patientId: user.id },
    orderBy: { scheduledAt: 'desc' },
    select: { psychologistId: true },
  })

  if (!appointment) throw new Error('Nenhum psicólogo encontrado')

  const psych = await prisma.psychologistProfile.findUnique({
    where: { id: appointment.psychologistId },
    include: {
      user: { select: { name: true } },
      plans: { where: { active: true }, orderBy: { createdAt: 'asc' } },
    },
  })

  if (!psych) throw new Error('Psicólogo não encontrado')

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
    psychologistUserId: psych.userId,
    psychologistName: psych.user.name || 'Psicólogo',
    sessionPrice: basePrice,
    sessionDuration: psych.sessionDuration,
    monthly,
    plans: psych.plans.map((p) => ({
      id: p.id,
      name: p.name,
      sessions: p.sessions,
      price: Number(p.price),
      discount: p.discount,
    })),
  }
})

export const saveGeneralConfig = createSafeAction(
  saveGeneralConfigSchema,
  async (data, user) => {
    const price = parseFloat(data.sessionPrice)
    const duration = parseInt(data.sessionDuration, 10)

    if (isNaN(price) || price <= 0) throw new Error('Valor da sessão inválido')
    if (isNaN(duration) || duration <= 0) throw new Error('Duração da sessão inválida')

    await prisma.psychologistProfile.update({
      where: { userId: user.id },
      data: {
        pricePerSession: price,
        sessionDuration: duration,
        monthlyPlanEnabled: data.monthlyPlan.enabled,
        monthlyPlanSessions: data.monthlyPlan.sessions,
        monthlyPlanDiscount: data.monthlyPlan.discount,
      },
    })

    return { success: true }
  },
  { requiredRole: 'PSYCHOLOGIST' }
)
