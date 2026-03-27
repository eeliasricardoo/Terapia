'use server'

import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

export const getPsychologists = createSafeAction(
  z.void().optional(),
  async () => {
    const psychologists = await prisma.psychologistProfile.findMany({
      where: {
        isVerified: true,
        stripeOnboardingComplete: true,
      },
      include: {
        user: {
          include: { profiles: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return psychologists.map((psych) => ({
      ...psych,
      profile: psych.user.profiles,
      price_per_session: Number(psych.pricePerSession),
    }))
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
      ...psych,
      profile: psych.user.profiles,
      price_per_session: Number(psych.pricePerSession),
      acceptedInsurances: psych.acceptedInsurances.map((i) => i.healthInsurance),
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
      stripeOnboardingComplete: true,
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

    return psychologists.map((psych) => ({
      ...psych,
      profile: psych.user.profiles,
      price_per_session: Number(psych.pricePerSession),
    }))
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
