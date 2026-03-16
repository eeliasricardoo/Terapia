import { ProfessionalsHero } from '@/components/professionals/ProfessionalsHero'
import { ProfessionalsFeatures } from '@/components/professionals/ProfessionalsFeatures'
import { CTA } from '@/components/landing/CTA'

export default function ForProfessionalsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between overflow-x-hidden">
      <ProfessionalsHero />
      <ProfessionalsFeatures />
      <CTA />
    </main>
  )
}
