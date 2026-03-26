import { Metadata } from 'next'
import dynamic from 'next/dynamic'

export const metadata: Metadata = {
  title: 'Encontrar Psicólogos',
  description:
    'Explore nossa lista de profissionais qualificados e encontre o terapeuta ideal para o seu perfil e necessidades.',
}

const SearchClient = dynamic(() => import('./SearchClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { unstable_cache } from 'next/cache'
import {
  PsychologistWithProfile,
  PsychologistProfile,
  Profile as UserProfile,
} from '@/lib/supabase/types'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/utils/logger'

// Use a pure prisma call to fetch all verified psychologists
const getCachedPsychologists = unstable_cache(
  async () => {
    try {
      // Import Prisma specifically inside the action to keep it clean
      const { prisma } = await import('@/lib/prisma')

      const psychologists = await prisma.psychologistProfile.findMany({
        where: {
          isVerified: true,
          stripeAccountId: { not: null },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          user: {
            include: {
              profiles: true, // Prisma relation
            },
          },
        },
      })

      if (!psychologists || psychologists.length === 0) {
        return []
      }

      // Map back to the legacy Supabase type structure to avoid breaking the SearchClient
      return psychologists.map((psych) => {
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

        return {
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
          profile,
        }
      }) as unknown as PsychologistWithProfile[]
    } catch (error) {
      logger.error('Failed to load psychologists API/DB:', error)
      return []
    }
  },
  ['psychologists-search-list-v6'],
  { revalidate: 60, tags: ['psychologists'] }
)

export default async function SearchPage() {
  const psychologists = await getCachedPsychologists()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center text-sm text-slate-500 gap-2 px-1">
            <Link href="/" className="hover:text-orange-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-700 font-medium font-outfit">Explorar Profissionais</span>
          </div>
        </div>

        <SearchClient initialPsychologists={psychologists} />
      </main>

      <Footer />
    </div>
  )
}
