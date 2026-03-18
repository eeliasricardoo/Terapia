'use client'

import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SessionDetailsDialog } from '@/components/dashboard/SessionDetailsDialog'
import { RescheduleDialog } from '@/components/dashboard/RescheduleDialog'

import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

const QUOTES = [
  'O autoconhecimento é o começo de toda sabedoria.',
  'Cuide da sua mente com a mesma dedicação que cuida do seu corpo.',
  'Cada passo na direção certa, por menor que seja, é um progresso.',
  'Permita-se sentir. Suas emoções são válidas.',
  'A vulnerabilidade é a maior medida de coragem.',
  'Não existe saúde sem saúde mental.',
  'Pedir ajuda é um ato de força, não de fraqueza.',
  'O melhor momento para cuidar de si é agora.',
]

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
      <Card className="border-none shadow-md overflow-hidden relative p-8 flex flex-col items-center justify-center text-center bg-white min-h-[300px]">
        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <CalendarIcon className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sem sessões agendadas</h2>
        <p className="text-slate-500 mb-6">
          Você não possui atendimentos marcados para os próximos dias.
        </p>
        <Link href="/busca">
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            Encontrar um Psicólogo
          </Button>
        </Link>
      </Card>
    )
  }

  const timezone = session.psychologist.timezone || 'America/Sao_Paulo'
  const scheduledDate = new Date(session.scheduledAt)
  const dateStr = formatInTimeZone(scheduledDate, timezone, "EEEE, dd 'de' MMMM", { locale: ptBR })

  const finishTime = new Date(scheduledDate.getTime() + session.durationMinutes * 60000)
  const startTimeStr = formatInTimeZone(scheduledDate, timezone, 'HH:mm')
  const finishTimeStr = formatInTimeZone(finishTime, timezone, 'HH:mm')
  const timeRange = `${startTimeStr} - ${finishTimeStr}`

  // Detect if user zone is different to show a subtle warning?
  // For now let's just show the session time as agreed (psychologist's clock).

  return (
    <Card className="border border-slate-100 shadow-sm overflow-hidden relative rounded-[2rem]">
      <div className="flex flex-col md:flex-row min-h-[320px]">
        <div className="p-10 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
              {dateStr}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {timeRange}
            </span>
          </div>

          <h2 className="text-4xl font-black text-slate-900 mb-6 leading-tight">
            Sua próxima sessão de <span className="text-blue-600">{session.type}</span>
          </h2>

          <div className="flex items-center gap-4 mb-10">
            <Avatar className="h-14 w-14 ring-4 ring-slate-50 transition-all hover:ring-blue-50">
              <AvatarImage src={session.psychologist.image || undefined} />
              <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                {session.psychologist.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-bold text-slate-900">{session.psychologist.name}</p>
              <p className="text-xs font-medium text-slate-500">{session.psychologist.specialty}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 mt-4">
            <Link href={`/sala/${session.id}`} className="w-full sm:w-auto">
              <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-full px-10 h-14 text-sm font-bold shadow-xl shadow-slate-200 transition-all active:scale-95">
                Entrar na Sala
              </Button>
            </Link>

            <div className="flex items-center gap-1">
              <SessionDetailsDialog session={session}>
                <Button
                  variant="ghost"
                  className="h-10 rounded-full px-4 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Detalhes
                </Button>
              </SessionDetailsDialog>

              <div className="w-px h-3 bg-slate-100 mx-1" />

              <RescheduleDialog
                session={{
                  id: session.id,
                  doctor: session.psychologist.name,
                  role: 'Psicóloga Clínica', // Patient view
                  image: session.psychologist.image || '/avatars/01.png',
                  date: format(new Date(session.scheduledAt), "dd 'de' MMMM, yyyy", {
                    locale: ptBR,
                  }),
                  time: format(new Date(session.scheduledAt), 'HH:mm'),
                  psychologistId: session.psychologist.userId,
                }}
              >
                <Button
                  variant="ghost"
                  className="h-10 rounded-full px-4 text-xs font-bold text-slate-500 hover:text-rose-500 transition-colors"
                >
                  Reagendar
                </Button>
              </RescheduleDialog>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[35%] bg-slate-50 flex items-center justify-center p-12 border-l border-slate-100">
          <div className="text-center">
            <p className="text-lg font-serif italic text-slate-400 leading-relaxed">
              &quot;{QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length]}&quot;
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
