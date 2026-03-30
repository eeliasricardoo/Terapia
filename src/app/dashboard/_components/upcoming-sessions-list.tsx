'use client'

import { Card } from '@/components/ui/card'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UpcomingSession {
  id: string
  type: string
  scheduledAt: string
  durationMinutes: number
  psychologist: {
    userId: string
    name: string
    specialty: string
    image?: string
    timezone: string
  }
}

interface Props {
  sessions: UpcomingSession[]
}

export function UpcomingSessionsList({ sessions }: Props) {
  // If no sessions, handled by Hero or parent
  if (sessions.length <= 1) return null

  // Skip the first one if it's already in the hero
  const otherSessions = sessions.slice(1)

  if (otherSessions.length === 0) return null

  return (
    <div className="pt-8">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
        Próximos Agendamentos
      </h2>
      <div className="space-y-4">
        {otherSessions.map((session) => {
          const date = new Date(session.scheduledAt)
          const dateStrRaw = format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })
          const dateStr = dateStrRaw.charAt(0).toUpperCase() + dateStrRaw.slice(1)
          const timeStr = format(date, 'HH:mm')

          return (
            <Card
              key={session.id}
              className="p-6 border border-slate-100 hover:border-blue-200 transition-all group rounded-[1.5rem] shadow-sm bg-white"
            >
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                    <Calendar className="h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-slate-900">{dateStr}</span>
                      <span className="text-xs font-bold text-slate-400">•</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                        {timeStr}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest leading-tight mb-1">
                      {session.type}
                    </p>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={session.psychologist.image} />
                        <AvatarFallback className="text-[10px] bg-slate-100 text-slate-500">
                          {session.psychologist.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold text-slate-600">
                        {session.psychologist.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link href={`/sala/${session.id}`}>
                    <Button
                      variant="ghost"
                      className="rounded-full h-10 px-5 text-xs font-bold text-blue-600 hover:bg-blue-50"
                    >
                      Acessar Link
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
