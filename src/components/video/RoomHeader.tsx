import { Clock, Users, PhoneOff, ShieldCheck, HeartPulse } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RoomHeaderProps {
  remainingSeconds: number
  remoteParticipantCount: number
  onLeave: () => void
}

export function RoomHeader({ remainingSeconds, remoteParticipantCount, onLeave }: RoomHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isFiveMinutesWarning = remainingSeconds > 0 && remainingSeconds <= 300

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-8 shadow-sm z-30 shrink-0 sticky top-0">
      {/* Brand & Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 transition-transform group-hover:scale-105 duration-300">
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 tracking-tight leading-none text-lg">
              MindCare
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-500 mt-1">
              Sala de Atendimento
            </span>
          </div>
        </div>

        <Separator orientation="vertical" className="h-8 bg-slate-200" />

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200/50 gap-2 px-3 py-1.5 shadow-sm font-semibold rounded-full"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Em Atendimento
          </Badge>

          <div
            className={cn(
              'flex items-center gap-2 font-bold text-sm px-4 py-1.5 rounded-full border transition-all duration-300 shadow-sm',
              isFiveMinutesWarning
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-slate-50 text-slate-600 border-slate-100'
            )}
          >
            <Clock
              className={cn('h-4 w-4', isFiveMinutesWarning ? 'text-red-500' : 'text-slate-400')}
            />
            {formatTime(remainingSeconds)}
          </div>
        </div>
      </div>

      {/* Participants & Actions */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100/50 rounded-full border border-slate-200/50 text-slate-500 text-sm font-medium">
          <Users className="h-4 w-4 opacity-70" />
          {remoteParticipantCount > 0 ? (
            <span className="flex items-center gap-2">
              {remoteParticipantCount + 1}{' '}
              <span className="text-[10px] opacity-60 font-bold uppercase tracking-wider">
                Presentes
              </span>
            </span>
          ) : (
            <span className="text-[10px] opacity-60 font-bold uppercase tracking-wider">
              Aguardando Paciente
            </span>
          )}
        </div>

        <Separator orientation="vertical" className="h-8 bg-slate-200" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
          >
            <ShieldCheck className="h-5 w-5" />
          </Button>

          <Button
            variant="destructive"
            onClick={onLeave}
            className="px-6 rounded-full font-bold shadow-lg shadow-red-200 bg-red-500 hover:bg-red-600 transition-all hover:scale-[1.02] active:scale-[0.98] h-11"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            Finalizar Sessão
          </Button>
        </div>
      </div>
    </header>
  )
}
