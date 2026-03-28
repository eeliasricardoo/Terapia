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
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
      <div className="relative flex-shrink-0 mx-auto md:mx-0">
        <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-lg ring-1 ring-slate-100">
          <AvatarImage
            src={psychologist.profile?.avatar_url || undefined}
            className="object-cover"
          />
          <AvatarFallback className="text-4xl bg-blue-50 text-blue-600 font-medium">
            {displayName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div
          className="absolute bottom-2 right-2 bg-green-500 border-4 border-white rounded-full p-1.5"
          title="Verificado"
          role="img"
          aria-label="Profissional verificado"
        ></div>
      </div>

      <div className="flex-1 text-center md:text-left space-y-3">
        <div>
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1 justify-center md:justify-start">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
              {displayName}
            </h1>
            {psychologist.is_verified && (
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 gap-1 w-fit mx-auto md:mx-0"
              >
                <CheckCircle2 className="h-3 w-3" />
                Profissional Verificado
              </Badge>
            )}
          </div>
          <p className="text-lg text-slate-600 font-medium">{firstSpecialty}</p>
          <p className="text-sm text-slate-500 font-mono mt-1">
            CRP: {psychologist.crp || 'Não informado'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-4 justify-center md:justify-start pt-2">
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-slate-900">5.0</span>
            <span className="text-slate-500">(Novo)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Briefcase className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-slate-900">
              {psychologist.years_of_experience || 1}+
            </span>
            <span>anos experiência</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="font-bold text-slate-900">{stats?.totalSessions || 0}</span>
            <span>sessões</span>
          </div>
        </div>
      </div>
    </div>
  )
}
