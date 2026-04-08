import type { Metadata } from 'next'
import { CompaniesHero } from '@/components/companies/CompaniesHero'
import { CompaniesFeatures } from '@/components/companies/CompaniesFeatures'
import { CTA } from '@/components/landing/CTA'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'CompaniesPage' })
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: [
      'saúde mental corporativa',
      'benefícios para funcionários',
      'psicologia nas empresas',
      'bem-estar no trabalho',
    ],
  }
}

export default function ForCompaniesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between overflow-x-hidden">
      <CompaniesHero />
      <CompaniesFeatures />
      <CTA />
    </main>
  )
}
