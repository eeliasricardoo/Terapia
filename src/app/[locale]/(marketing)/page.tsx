import { getCachedPsychologistCount } from '@/lib/cache/marketing'
import { Metadata } from 'next'

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
export const metadata: Metadata = {
  title: 'Início',
  description: 'A terapia que se adapta à sua vida. Encontre o psicólogo ideal em minutos.',
}

export default async function Home() {
  // Get dynamic count of verified psychologists (cached)
  const totalVerifiedPsychologists = await getCachedPsychologistCount()

  const displayCount = Math.max(500, totalVerifiedPsychologists + 500)

  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden relative bg-white">
      {/* Global Background Elements — Connected across the scroll */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sentirz-teal/[0.03] blur-[120px] animate-blob" />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sentirz-green/[0.02] blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-sentirz-orange/[0.02] blur-[140px] animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 w-full">
        <Hero />
        <Marquee />
        <SearchHighlight totalPsychologists={displayCount} />
        <HowItWorks />
        <Features />
        <Testimonials />
        <CTA />
      </div>
    </main>
  )
}
