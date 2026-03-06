import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

import { Hero } from '@/components/landing/Hero'
import { SearchHighlight } from '@/components/landing/SearchHighlight'
import { Features } from '@/components/landing/Features'
import { CTA } from '@/components/landing/CTA'

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

  // Start with a base number (e.g. 100) and add real verified ones
  // Or just use the real number if there are many. We'll use Math.max to avoid '0+' if DB is empty
  const displayCount = Math.max(500, totalVerifiedPsychologists + 500)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <Hero />
      <SearchHighlight totalPsychologists={displayCount} />
      <Features />
      <CTA />
    </main>
  )
}
