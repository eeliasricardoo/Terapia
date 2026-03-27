'use server'

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'
import type { TimeSlot } from '@/lib/validations/availability'

// ─── Types & Schemas ──────────────────────────────────────────────

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
