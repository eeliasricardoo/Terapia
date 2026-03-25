import { notFound } from 'next/navigation'
import { PsychologistProfileClient } from './PsychologistProfileClient'
import { unstable_cache } from 'next/cache'
import { PsychologistWithProfile, PsychologistProfile } from '@/lib/supabase/types'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { PsychologistAvailability, TimeSlot } from '@/lib/actions/availability'

async function getPsychologistDataInternal(userId: string) {
  try {
    const { prisma } = await import('@/lib/prisma')

    // 1. Fetch psychologist, profile and insurances in a single trip
    const psych = await prisma.psychologistProfile.findUnique({
      where: { userId },
      include: {
        user: {
          include: { profiles: true },
        },
        acceptedInsurances: {
          include: { healthInsurance: true },
        },
      },
    })

    if (!psych) {
      return null
    }

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

    const fullPsychologist = {
      id: psych.id,
      userId: psych.userId,
      crp: psych.crp,
      bio: psych.bio,
      specialties: psych.specialties,
      price_per_session: psych.pricePerSession ? Number(psych.pricePerSession) : null,
      video_presentation_url: psych.videoPresentationUrl,
      is_verified: psych.isVerified,
      weekly_schedule: psych.weeklySchedule as any,
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
      profile: profile,
    }

    // 2. Fetch overrides & appointments in parallel
    const recentPastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    const recentPastDateStr = recentPastDate.toISOString().split('T')[0]

    const [overridesList, appointmentList] = await Promise.all([
      prisma.scheduleOverride.findMany({
        where: {
          psychologistId: psych.id,
          date: { gte: recentPastDateStr },
        },
        select: { date: true, type: true, slots: true },
      }),
      prisma.appointment.findMany({
        where: {
          psychologistId: psych.id,
          status: { notIn: ['CANCELED'] },
          scheduledAt: { gte: recentPastDate },
        },
        select: {
          id: true,
          scheduledAt: true,
          durationMinutes: true,
        },
      }),
    ])

    const overridesMap: Record<string, { type: 'blocked' | 'custom'; slots: TimeSlot[] }> = {}
    overridesList.forEach((o) => {
      overridesMap[o.date] = {
        type: o.type as 'blocked' | 'custom',
        slots: (o.slots as unknown as TimeSlot[]) || [],
      }
    })

    const appointmentsMap = appointmentList.map((a) => ({
      id: a.id,
      scheduled_at: a.scheduledAt.toISOString(),
      duration_minutes: a.durationMinutes,
    }))

    const availability: PsychologistAvailability = {
      timezone: psych.timezone || 'America/Sao_Paulo',
      weeklySchedule: psych.weeklySchedule as any,
      overrides: overridesMap,
      appointments: appointmentsMap,
    }

    // 3. Extract and map accepted insurances
    const acceptedInsurances = psych.acceptedInsurances
      .map((item) => item.healthInsurance)
      .filter(Boolean)

    // 4. Fetch stats (sessions count)
    const { getPsychologistStats } = await import('@/lib/actions/psychologists')
    const stats = await getPsychologistStats(userId)

    // Return combined payload
    return {
      psychologist: {
        ...fullPsychologist,
        acceptedInsurances,
      } as unknown as PsychologistWithProfile,
      availability,
      stats,
    }
  } catch (error) {
    logger.error('Failed to load psychologist data:', error)
    return null
  }
}

const getCachedPsychologistData = unstable_cache(
  async (userId: string) => getPsychologistDataInternal(userId),
  ['psychologist-profile-view'],
  { revalidate: 30, tags: ['appointments', 'psychologists', 'overrides'] }
)

interface PageProps {
  params: {
    id: string
  }
}

export default async function PsychologistProfilePage({ params }: PageProps) {
  // Both user profile & availability cached and aggregated in 1 trip
  const data = await getCachedPsychologistData(params.id)

  if (!data || !data.psychologist) {
    notFound()
  }

  return (
    <PsychologistProfileClient
      psychologist={data.psychologist}
      availability={data.availability}
      stats={data.stats}
    />
  )
}
