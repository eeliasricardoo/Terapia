'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, MapPin, Video, ChevronRight } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { memo } from 'react'
import { useTranslations, useFormatter } from 'next-intl'

import { PsychologistWithProfile } from '@/lib/supabase/types'

interface PsychologistCardProps {
  psychologist: PsychologistWithProfile
}

export const PsychologistCard = memo(function PsychologistCard({
  psychologist,
}: PsychologistCardProps) {
  const t = useTranslations('SearchPage')
  const format = useFormatter()

  const profile = psychologist.profile
  const displayName = profile?.full_name || t('card.fallbackName')
  const specialties = psychologist.specialties || []
  const price = psychologist.price_per_session ? Number(psychologist.price_per_session) : 0
  const crp = psychologist.crp || t('card.notInformed')
  const bio = psychologist.bio || t('card.fallbackBio')

  return (
    <Card className="overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 border-slate-200/60 rounded-[2.5rem] group flex flex-col bg-white h-full relative hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardContent className="p-0 flex flex-col flex-1 relative z-10">
        <div className="p-4 sm:p-6 flex flex-col flex-1">
          <div className="flex gap-3 sm:gap-4 mb-4">
            <div className="relative flex-shrink-0">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-white shadow-sm ring-1 ring-slate-100/50 relative z-10">
                <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-indigo-50/30 text-primary text-xl font-bold">
                  {displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full z-20 shadow-sm"></span>
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex justify-between items-start gap-2 mb-0.5">
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-lg text-slate-900 truncate group-hover:text-primary transition-colors duration-300">
                    {displayName}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">
                    CRP {crp}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 border border-slate-100">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{t('card.new')}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5 font-medium">
                <div className="flex items-center gap-1">
                  <Video className="w-3 h-3 text-primary" />
                  <span>{t('card.online')}</span>
                </div>
                <span className="w-0.5 h-0.5 rounded-full bg-slate-300" />
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[100px]">
                    {profile?.city && profile?.state
                      ? `${profile.city}, ${profile.state}`
                      : profile?.city || profile?.state || t('card.brazil')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {specialties.slice(0, 3).map((specialty: string) => (
              <Badge
                key={specialty}
                variant="secondary"
                className="font-semibold text-[10px] px-2 py-0 bg-slate-100/60 text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors border-transparent rounded-full"
              >
                {specialty}
              </Badge>
            ))}
          </div>

          <div className="flex-1">
            <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">{bio}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 sm:px-6 sm:py-4 border-t border-slate-100 bg-slate-50/30 flex flex-row items-center justify-between relative z-10 mt-auto">
        <div className="flex flex-col justify-center">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
            {t('card.sessionDuration')}
          </span>
          <span className="font-black text-slate-900 text-lg leading-none">
            {format.number(price, { style: 'currency', currency: 'BRL' })}
          </span>
        </div>

        <Link
          href={`/psicologo/${psychologist.userId}`}
          className="flex items-center justify-center gap-1.5 bg-primary text-white hover:bg-primary/90 transition-all duration-300 font-bold text-xs h-9 px-5 rounded-full shadow-sm hover:shadow-md active:scale-95"
        >
          {t('card.viewProfile')}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </CardFooter>
    </Card>
  )
})
