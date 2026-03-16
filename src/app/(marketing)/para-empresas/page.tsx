import { CompaniesHero } from '@/components/companies/CompaniesHero'
import { CompaniesFeatures } from '@/components/companies/CompaniesFeatures'
import { CTA } from '@/components/landing/CTA'

export default function ForCompaniesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between overflow-x-hidden">
      <CompaniesHero />
      <CompaniesFeatures />
      <CTA />
    </main>
  )
}
