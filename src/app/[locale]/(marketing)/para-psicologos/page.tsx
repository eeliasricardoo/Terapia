import type { Metadata } from 'next'
import { ProfessionalsHero } from '@/components/professionals/ProfessionalsHero'
import { ProfessionalsFeatures } from '@/components/professionals/ProfessionalsFeatures'
import { CTA } from '@/components/landing/CTA'

export const metadata: Metadata = {
  title: 'Para Psicólogos - Transforme seu Atendimento Clínico',
  description:
    'Tenha total autonomia, gestão completa e uma agenda cheia de pacientes qualificados. A plataforma ideal para psicólogos que buscam crescer na clínica online.',
  keywords: [
    'psicologia clínica',
    'plataforma para psicólogos',
    'gestão de consultório',
    'terapias online',
  ],
}

export default function ForProfessionalsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between overflow-x-hidden">
      <ProfessionalsHero />
      <ProfessionalsFeatures />
      <CTA />
    </main>
  )
}
