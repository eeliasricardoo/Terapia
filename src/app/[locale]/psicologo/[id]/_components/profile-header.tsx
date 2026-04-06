'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Star, Briefcase, Users } from 'lucide-react'
import type { PsychologistWithProfile } from '@/lib/supabase/types'

interface ProfileHeaderProps {
  psychologist: PsychologistWithProfile
  displayName: string
  firstSpecialty: string
  stats?: { totalSessions: number }
}

export function ProfileHeader({
  psychologist,
  displayName,
  firstSpecialty,
  stats,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-border shadow-sm flex flex-col md:flex-row gap-6 items-start">
      <div className="relative flex-shrink-0 mx-auto md:mx-0">
        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-lg ring-1 ring-border">
          <AvatarImage
            src={psychologist.profile?.avatar_url || undefined}
            className="object-cover"
          />
          <AvatarFallback className="text-4xl bg-[hsl(var(--sentirz-teal-pastel))] text-primary font-medium">
            {displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div
          className="absolute bottom-2 right-2 bg-green-500 border-4 border-white rounded-full p-1.5"
          title="Verificado"
          role="img"
          aria-label="Profissional verificado"
        />
      </div>

      <div className="flex-1 text-center md:text-left space-y-3">
        <div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1 justify-center md:justify-start">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {displayName}
            </h1>
            {psychologist.is_verified && (
              <Badge
                variant="secondary"
                className="bg-[hsl(var(--sentirz-teal-pastel))] text-primary hover:bg-[hsl(var(--sentirz-teal-pastel))] gap-1 w-fit mx-auto md:mx-0"
              >
                <CheckCircle2 className="h-3 w-3" />
                Profissional Verificado
              </Badge>
            )}
          </div>
          <p className="text-lg text-muted-foreground font-medium">{firstSpecialty}</p>
          <p className="text-sm text-muted-foreground font-mono mt-1">
            CRP: {psychologist.crp || 'Não informado'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center md:justify-start pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
            <Star className="h-4 w-4 text-[hsl(var(--sentirz-orange))] fill-[hsl(var(--sentirz-orange))]" />
            <span className="font-bold text-foreground">5.0</span>
            <span className="text-muted-foreground">(Novo)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">
              {psychologist.years_of_experience || 1}+
            </span>
            <span>anos experiência</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
            <Users className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground">{stats?.totalSessions || 0}</span>
            <span>sessões</span>
          </div>
        </div>
      </div>
    </div>
  )
}
