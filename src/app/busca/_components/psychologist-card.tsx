'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, MapPin, Video, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'

interface PsychologistCardProps {
  psychologist: any
}

export const PsychologistCard = memo(function PsychologistCard({
  psychologist,
}: PsychologistCardProps) {
  const profile = psychologist.profile
  const displayName = profile?.full_name || 'Psicólogo'
  const specialties = psychologist.specialties || []
  const price = psychologist.price_per_session ? Number(psychologist.price_per_session) : 0
  const crp = psychologist.crp || 'Não informado'
  const bio =
    psychologist.bio ||
    'Olá! Sou especialista em saúde mental e estou aqui para ajudar você a alcançar seus objetivos e bem-estar. Meu consultório é um espaço seguro e acolhedor.'

  return (
    <Card className="overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20 transition-all duration-500 border-slate-200/60 rounded-3xl group flex flex-col bg-white h-full relative hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardContent className="p-0 flex flex-col flex-1 relative z-10">
        <div className="p-6 md:p-8 flex flex-col flex-1">
          <div className="flex gap-5 mb-5">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
              <Avatar className="h-24 w-24 border-[3px] border-white shadow-md ring-1 ring-slate-100/50 relative z-10 group-hover:scale-105 transition-transform duration-500">
                <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-indigo-50/30 text-primary text-2xl font-bold">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-[3px] border-white rounded-full z-20 shadow-sm"></span>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex justify-between items-start gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-xl text-slate-900 truncate group-hover:text-primary transition-colors duration-300">
                    {displayName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium tracking-wide">CRP {crp}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full text-xs font-bold text-slate-500 shadow-sm border border-slate-100">
                  <Star className="w-3.5 h-3.5 text-slate-300" />
                  <span>Novo</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                <div className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-primary" />
                  <span>Online</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[120px]">
                    {profile?.city && profile?.state
                      ? `${profile.city}, ${profile.state}`
                      : profile?.city || profile?.state || 'Brasil'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-5">
            {specialties.slice(0, 3).map((specialty: string) => (
              <Badge
                key={specialty}
                variant="secondary"
                className="font-medium text-[11px] px-2.5 py-0.5 bg-slate-100/80 text-slate-700 group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-slate-200/60 rounded-full"
              >
                {specialty}
              </Badge>
            ))}
            {specialties.length > 3 && (
              <span className="text-[11px] text-slate-500 flex items-center px-1 font-semibold">
                +{specialties.length - 3} mais
              </span>
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">{bio}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 md:px-8 md:py-6 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between relative z-10 mt-auto">
        <div className="flex flex-col justify-center">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            Sessão (50 min)
          </span>
          <span className="font-extrabold text-slate-900 text-xl leading-none">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
          </span>
        </div>

        <Link
          href={`/psicologo/${psychologist.userId}`}
          className="flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-300 font-bold text-sm h-11 px-6 rounded-full group-hover:shadow-md group-hover:shadow-primary/20 active:scale-95 whitespace-nowrap"
        >
          Ver Perfil
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </CardFooter>
    </Card>
  )
})
