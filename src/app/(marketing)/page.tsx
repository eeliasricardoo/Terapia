import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

// Above-fold: static imports for fastest LCP
import { Hero } from '@/components/landing/Hero'
import { Marquee } from '@/components/landing/Marquee'

// Below-fold: dynamic imports for JS bundle splitting
import dynamic from 'next/dynamic'

const SearchHighlight = dynamic(() =>
  import('@/components/landing/SearchHighlight').then((m) => ({ default: m.SearchHighlight }))
)
const HowItWorks = dynamic(() =>
  import('@/components/landing/HowItWorks').then((m) => ({ default: m.HowItWorks }))
)
const Features = dynamic(() =>
  import('@/components/landing/Features').then((m) => ({ default: m.Features }))
)
const Testimonials = dynamic(() =>
  import('@/components/landing/Testimonials').then((m) => ({ default: m.Testimonials }))
)
const CTA = dynamic(() => import('@/components/landing/CTA').then((m) => ({ default: m.CTA })))
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Início',
  description: 'A terapia que se adapta à sua vida. Encontre o psicólogo ideal em minutos.',
}

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  // Get dynamic count of verified psychologists
  const totalVerifiedPsychologists = await prisma.psychologistProfile.count({
    where: { isVerified: true },
  })

  const displayCount = Math.max(500, totalVerifiedPsychologists + 500)

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden">
      <Hero />
      <Marquee />
      <SearchHighlight totalPsychologists={displayCount} />
      <HowItWorks />
      <Features />
      <Testimonials />
      <CTA />
    </main>
  )
}
