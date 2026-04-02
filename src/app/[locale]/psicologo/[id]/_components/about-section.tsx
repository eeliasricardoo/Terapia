'use client'

import { Badge } from '@/components/ui/badge'
import { GraduationCap, Languages, Award } from 'lucide-react'
import type { PsychologistWithProfile } from '@/lib/supabase/types'

interface AboutSectionProps {
  psychologist: PsychologistWithProfile
}

export function AboutSection({ psychologist }: AboutSectionProps) {
  return (
    <div className="space-y-6">
      {/* Bio */}
      <section className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-border shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-foreground">Sobre mim</h2>
        <p className="text-muted-foreground leading-relaxed text-base sm:text-lg whitespace-pre-wrap">
          {psychologist.bio ||
            'Psicólogo(a) dedicado(a) ao bem-estar emocional e mental dos pacientes. Utilizo abordagens baseadas em evidências para ajudar pessoas a superarem desafios e alcançarem seus objetivos terapêuticos.'}
        </p>
      </section>

      {/* Formação */}
      <section className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-border shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-foreground">Formação e Qualificações</h2>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 bg-[hsl(var(--sentirz-teal-pastel))] p-2 rounded-lg shrink-0">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Formação Acadêmica</h3>
              <ul className="mt-2 space-y-3">
                <li className="text-sm">
                  <p className="font-medium text-foreground">
                    {psychologist.academic_level || 'Graduação em Psicologia'}
                  </p>
                  <p className="text-muted-foreground">
                    {psychologist.university || 'Não informado'}
                  </p>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[hsl(var(--sentirz-teal-pastel))] p-2 rounded-lg shrink-0">
                <Languages className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Idiomas</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-muted text-foreground font-normal">
                    Português (Nativo)
                  </Badge>
                  <Badge variant="secondary" className="bg-muted text-foreground font-normal">
                    Inglês (Avançado)
                  </Badge>
                  <Badge variant="secondary" className="bg-muted text-foreground font-normal">
                    Espanhol (Intermediário)
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 bg-[hsl(var(--sentirz-orange-pastel))] p-2 rounded-lg shrink-0">
                <Award className="h-5 w-5 text-[hsl(var(--sentirz-orange))]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Certificações</h3>
                <ul className="mt-2 space-y-1">
                  <li className="text-sm text-muted-foreground">
                    Certificado em Prática Clínica Supervisionada
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-border shadow-sm space-y-5">
        <h2 className="text-xl font-bold text-foreground">Especialidades e Abordagens</h2>
        <div className="flex flex-wrap gap-2">
          {psychologist.specialties?.map((spec) => (
            <Badge
              key={spec}
              variant="outline"
              className="text-sm px-4 py-1.5 border-border text-foreground bg-muted/40 font-normal hover:bg-[hsl(var(--sentirz-teal-pastel))] hover:text-primary hover:border-primary/30 transition-colors"
            >
              {spec}
            </Badge>
          )) || <p className="text-sm text-muted-foreground">Nenhuma especialidade cadastrada</p>}
        </div>
      </section>
    </div>
  )
}
