import { notFound } from 'next/navigation'
import { PsychologistProfileClient } from './PsychologistProfileClient'
import { unstable_cache } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { PsychologistWithProfile, PsychologistProfile } from '@/lib/supabase/types'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'
import { PsychologistAvailability, TimeSlot } from '@/lib/actions/availability'

async function getPsychologistDataInternal(userId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Fetch psychologist
    const { data: psych, error: psychError } = await supabase
      .from('psychologist_profiles')
      .select('*')
      .eq('userId', userId)
      .single()

    if (psychError || !psych) {
      if (psychError) logger.error('Error fetching psychologist:', psychError)
      return null
    }

    // Fetch profile (full_name, avatar_url, etc.)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    const fullPsychologist = {
      ...psych,
      profile: profile || null,
    } as PsychologistWithProfile

    // 2. Fetch overrides & appointments
    const recentPastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const overridesRes = await supabase
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
      select: {
        id: true,
        scheduledAt: true,
        durationMinutes: true,
      },
    })

    const apptsRes = {
      data: appointmentList.map((a) => ({
        id: a.id,
        scheduled_at: a.scheduledAt.toISOString(),
        duration_minutes: a.durationMinutes,
      })),
    }

    const overridesMap: Record<string, { type: 'blocked' | 'custom'; slots: TimeSlot[] }> = {}
    if (overridesRes.data) {
      overridesRes.data.forEach((o) => {
        overridesMap[o.date] = {
          type: o.type as 'blocked' | 'custom',
          slots: o.slots as unknown as TimeSlot[],
        }
      })
    }

    const appointmentsMap = apptsRes.data
      ? apptsRes.data.map((a) => ({
          id: a.id,
          scheduled_at: a.scheduled_at,
          duration_minutes: a.duration_minutes,
        }))
      : []

    const availability: PsychologistAvailability = {
      timezone: psych.timezone || 'America/Sao_Paulo',
      weeklySchedule: psych.weekly_schedule || null,
      overrides: overridesMap,
      appointments: appointmentsMap,
    }

    // 3. Fetch health insurances
    const { data: insurancesRes } = await supabase
      .from('psychologist_insurances')
      .select('health_insurance:health_insurances(id, name)')
      .eq('psychologist_id', psych.id)

    const acceptedInsurances = insurancesRes
      ? insurancesRes.map((item) => (item as any).health_insurance)
      : []

    // 4. Fetch stats (sessions count)
    const { getPsychologistStats } = await import('@/lib/actions/psychologists')
    const stats = await getPsychologistStats(userId)

    // Return combined payload
    return {
      psychologist: {
        ...fullPsychologist,
        acceptedInsurances,
      },
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
