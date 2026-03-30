'use server'

import { prisma } from '@/lib/prisma'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'
import { PsychologistWithProfile } from '@/lib/supabase/types'
import { WeeklyScheduleData } from '@/lib/validations/availability'

function mapPsychologist(psych: any): PsychologistWithProfile {
  const userProfile = psych.user?.profiles || null

  const profile = userProfile
    ? {
        id: userProfile.id,
        user_id: userProfile.user_id,
        full_name: userProfile.fullName,
        avatar_url: userProfile.avatarUrl,
        role: userProfile.role,
        birth_date: userProfile.birth_date ? (userProfile.birth_date as Date).toISOString() : null,
        document: userProfile.document,
        phone: userProfile.phone,
        created_at: (userProfile.createdAt as Date).toISOString(),
        updated_at: (userProfile.updatedAt as Date).toISOString(),
      }
    : null

  return {
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
}

export const getPsychologists = createSafeAction(
  z.void().optional(),
  async () => {
    const psychologists = await prisma.psychologistProfile.findMany({
      where: {
        isVerified: true,
      },
      include: {
        user: {
          include: { profiles: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return psychologists.map(mapPsychologist)
  },
  { isPublic: true }
)

export const getPsychologistById = createSafeAction(
  z.string().uuid(),
  async (userId) => {
    // Try by userId or profileId
    const psych = await prisma.psychologistProfile.findFirst({
      where: {
        OR: [{ id: userId }, { userId }],
      },
      include: {
        user: { include: { profiles: true } },
        acceptedInsurances: {
          include: { healthInsurance: true },
        },
      },
    })

    if (!psych) return null

    return {
      ...mapPsychologist(psych),
      acceptedInsurances: psych.acceptedInsurances
        .map((i: any) => i.healthInsurance)
        .filter(Boolean),
    }
  },
  { isPublic: true }
)

const searchFiltersSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(50).optional().default(12),
  specialties: z.array(z.string()).optional(),
  healthInsurances: z.array(z.string().uuid()).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  genders: z.array(z.string()).optional(),
  searchQuery: z.string().optional(),
})

export const searchPsychologists = createSafeAction(
  searchFiltersSchema,
  async (filters) => {
    const {
      page,
      pageSize,
      specialties,
      healthInsurances,
      minPrice,
      maxPrice,
      genders,
      searchQuery,
    } = filters
    const skip = (page - 1) * pageSize

    const where: any = {
      isVerified: true,
    }

    if (specialties && specialties.length > 0) {
      where.specialties = { hasSome: specialties }
    }

    if (healthInsurances && healthInsurances.length > 0) {
      where.acceptedInsurances = {
        some: { healthInsuranceId: { in: healthInsurances } },
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerSession = {}
      if (minPrice !== undefined) where.pricePerSession.gte = minPrice
      if (maxPrice !== undefined) where.pricePerSession.lte = maxPrice
    }

    if ((genders && genders.length > 0) || searchQuery) {
      where.user = {
        profiles: {
          AND: [],
        },
      }
      if (genders && genders.length > 0) {
        where.user.profiles.AND.push({ gender: { in: genders } })
      }
      if (searchQuery) {
        where.user.profiles.AND.push({ fullName: { contains: searchQuery, mode: 'insensitive' } })
      }
    }

    const psychologists = await prisma.psychologistProfile.findMany({
      where,
      include: {
        user: { include: { profiles: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    })

    return psychologists.map(mapPsychologist)
  },
  { isPublic: true }
)

export const getPsychologistStats = createSafeAction(
  z.string().uuid(),
  async (userId) => {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!profile) return { totalSessions: 0 }

    const totalSessions = await prisma.appointment.count({
      where: {
        psychologistId: profile.id,
        status: 'COMPLETED',
      },
    })

    return { totalSessions }
  },
  { isPublic: true }
)
