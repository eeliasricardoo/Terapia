'use client'

import { Calendar as CalendarIcon, Clock, Video, ArrowRight, RotateCcw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SessionDetailsDialog } from '@/components/dashboard/SessionDetailsDialog'
import { RescheduleDialog } from '@/components/dashboard/RescheduleDialog'

import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Props {
  session: {
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
  } | null
}

export function NextSessionHero({ session }: Props) {
  if (!session) {
    return (
      <Card className="border-none shadow-md overflow-hidden relative p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-white min-h-[200px]">
        <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
          <CalendarIcon className="h-6 w-6 text-slate-400" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">Sem sessões agendadas</h2>
        <p className="text-sm text-slate-500 mb-4">
          Você não possui atendimentos marcados para os próximos dias.
        </p>
        <Link href="/busca">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
            Encontrar um Psicólogo
          </Button>
        </Link>
      </Card>
    )
  }

  const timezone = session.psychologist.timezone || 'America/Sao_Paulo'
  const scheduledDate = new Date(session.scheduledAt)
  const dateStrRaw = formatInTimeZone(scheduledDate, timezone, "EEEE, dd 'de' MMMM", {
    locale: ptBR,
  })
  const dateStr = dateStrRaw.charAt(0).toUpperCase() + dateStrRaw.slice(1)
  const finishTime = new Date(scheduledDate.getTime() + session.durationMinutes * 60000)
  const startTimeStr = formatInTimeZone(scheduledDate, timezone, 'HH:mm')
  const finishTimeStr = formatInTimeZone(finishTime, timezone, 'HH:mm')

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Card className="border-none shadow-lg overflow-hidden rounded-2xl sm:rounded-3xl">
        <div className="flex flex-col sm:flex-row">
          {/* Left — Psychologist panel */}
          <div className="relative sm:w-56 lg:w-64 shrink-0 bg-slate-900 flex flex-col items-center justify-center p-6 sm:p-8 gap-3 overflow-hidden">
            {/* Subtle gradient blobs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--sentirz-teal))] opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[hsl(var(--sentirz-green))] opacity-10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center gap-3">
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-white/10">
                  <AvatarImage src={session.psychologist.image || undefined} />
                  <AvatarFallback className="bg-[hsl(var(--sentirz-teal))] text-white font-black text-2xl">
                    {session.psychologist.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-slate-900" />
              </div>

              <div>
                <p className="text-sm font-bold text-white leading-tight">
                  {session.psychologist.name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{session.psychologist.specialty}</p>
              </div>
            </div>
          </div>

          {/* Right — Session info */}
          <div className="flex-1 bg-white p-5 sm:p-7 flex flex-col justify-between gap-5">
            {/* Top: label + date/time */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/8 px-2.5 py-1 rounded-full border border-primary/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Próxima sessão
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  {session.type}
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight font-outfit">
                  {dateStr}
                </h2>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {startTimeStr} – {finishTimeStr}
                  </span>
                  <span className="text-slate-200">·</span>
                  <span className="text-sm text-slate-400 font-medium">
                    {session.durationMinutes} min
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom: actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-slate-100">
              <Link href={`/sala/${session.id}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-10 px-5 text-sm font-bold shadow-sm transition-all active:scale-95 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Entrar na Sala
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </Button>
              </Link>

              <div className="flex items-center gap-1">
                <SessionDetailsDialog session={session}>
                  <Button
                    variant="ghost"
                    className="h-9 rounded-xl px-3 text-sm font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                  >
                    Documentos
                  </Button>
                </SessionDetailsDialog>

                <RescheduleDialog
                  session={{
                    id: session.id,
                    doctor: session.psychologist.name,
                    role: session.psychologist.specialty || 'Psicólogo(a)',
                    image: session.psychologist.image || '/avatars/01.png',
                    date: format(new Date(session.scheduledAt), "dd 'de' MMMM, yyyy", {
                      locale: ptBR,
                    }),
                    time: format(new Date(session.scheduledAt), 'HH:mm'),
                    psychologistId: session.psychologist.userId,
                    scheduledAt: session.scheduledAt,
                  }}
                >
                  <Button
                    variant="ghost"
                    className="h-9 rounded-xl px-3 text-sm font-medium text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reagendar
                  </Button>
                </RescheduleDialog>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
