'use client'

import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SessionDetailsDialog } from '@/components/dashboard/SessionDetailsDialog'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface Props {
  session: {
    id: string
    type: string
    scheduledAt: string
    durationMinutes: number
    psychologist: {
      name: string
      specialty: string
      image?: string
    }
  } | null
}

export function NextSessionHero({ session }: Props) {
  if (!session) {
    return (
      <Card className="border-none shadow-md overflow-hidden relative p-8 flex flex-col items-center justify-center text-center bg-white min-h-[300px]">
        <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <CalendarIcon className="h-8 w-8 text-slate-300" />
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

  const scheduledDate = new Date(session.scheduledAt)
  const dateStr = format(scheduledDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
  const timeRange = `${format(scheduledDate, 'HH:mm')} - ${format(new Date(scheduledDate.getTime() + session.durationMinutes * 60000), 'HH:mm')}`

  return (
    <Card className="border-none shadow-md overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 opacity-10 hidden md:block">
        <CalendarIcon className="h-32 w-32 text-blue-600" />
      </div>
      <div className="flex flex-col md:flex-row h-full">
        <div className="p-8 flex-1">
          <div className="inline-flex items-center rounded-full border border-blue-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-700 mb-4 capitalize">
            {dateStr}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">{session.type}</h2>
          <p className="text-slate-500 mb-6 flex items-center gap-2">
            <Clock className="h-4 w-4" /> {timeRange}
          </p>

          <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarImage src={session.psychologist.image || undefined} />
              <AvatarFallback>{session.psychologist.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-slate-900">{session.psychologist.name}</p>
              <p className="text-xs text-slate-500">{session.psychologist.specialty}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <SessionDetailsDialog session={session}>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
              >
                Detalhes
              </Button>
            </SessionDetailsDialog>
            <Link href={`/sala/${session.id}`}>
              <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                Entrar na Sala
              </Button>
            </Link>
          </div>
        </div>
        <div className="w-full md:w-1/3 bg-blue-50 relative min-h-[200px]">
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <p className="text-sm text-blue-800 italic">
              &quot;O autoconhecimento é o começo de toda sabedoria.&quot;
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
