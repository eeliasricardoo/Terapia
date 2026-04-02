import type { Metadata } from 'next'
import { CompaniesHero } from '@/components/companies/CompaniesHero'
import { CompaniesFeatures } from '@/components/companies/CompaniesFeatures'
import { CTA } from '@/components/landing/CTA'

export const metadata: Metadata = {
  title: 'Para Empresas - Saúde Mental e Bem-estar Corporativo',
  description:
    'Leve terapia de qualidade para seus colaboradores e melhore o clima organizacional. Ofereça benefícios de saúde mental com gestão simples e eficiente.',
  keywords: [
    'saúde mental corporativa',
    'benefícios para funcionários',
    'psicologia nas empresas',
    'bem-estar no trabalho',
  ],
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
