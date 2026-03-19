import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

import { Hero } from '@/components/landing/Hero'
import { Marquee } from '@/components/landing/Marquee'
import { SearchHighlight } from '@/components/landing/SearchHighlight'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Features } from '@/components/landing/Features'
import { Testimonials } from '@/components/landing/Testimonials'
import { CTA } from '@/components/landing/CTA'
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
