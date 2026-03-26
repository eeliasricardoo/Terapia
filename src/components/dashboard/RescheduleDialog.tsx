'use client'
import { logger } from '@/lib/utils/logger'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2, Clock, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { getPsychologistAvailability, PsychologistAvailability } from '@/lib/actions/availability'
import { getPsychologistById } from '@/lib/actions/psychologists'
import { rescheduleSession, cancelSession } from '@/lib/actions/sessions'
import { PsychologistWithProfile } from '@/lib/supabase/types'
import { usePsychologistProfile } from '@/app/psicologo/[id]/_hooks/use-psychologist-profile'
import { cn } from '@/lib/utils'

interface RescheduleDialogProps {
  children: React.ReactNode
  session: {
    id: string | number
    doctor: string
    role: string
    image: string
    date: string
    time: string
    psychologistId?: string
    crp?: string
    specialties?: string[]
    price?: number
  }
}

export function RescheduleDialog({ children, session }: RescheduleDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [psychologist, setPsychologist] = useState<PsychologistWithProfile | null>(null)
  const [availability, setAvailability] = useState<PsychologistAvailability | null>(null)

  const router = useRouter()

  const isPsychologistView = session.role === 'Paciente'

  useEffect(() => {
    if (open && !psychologist && session.psychologistId) {
      const loadInfo = async () => {
        setLoading(true)
        try {
          const [pData, aData] = await Promise.all([
            getPsychologistById(session.psychologistId!),
            getPsychologistAvailability(session.psychologistId!),
          ])

          setPsychologist(pData)
          setAvailability(aData)
        } catch (error) {
          logger.error('Error loading psychologist availability:', error)
          toast.error('Erro ao carregar disponibilidade')
        } finally {
          setLoading(false)
        }
      }
      loadInfo()
    }
  }, [open, session.psychologistId, psychologist, session.id])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl bg-white max-h-[90vh] flex flex-col"
        aria-describedby="reschedule-description"
      >
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white relative flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <DialogHeader className="relative z-10 text-left">
            <DialogTitle className="text-2xl font-black tracking-tight text-white mb-2">
              Reagendar Sessão
            </DialogTitle>
            <p className="text-white/80 text-sm font-medium" id="reschedule-description">
              {isPsychologistView
                ? `Escolha uma nova data para sua sessão com ${session.doctor}.`
                : `Escolha uma nova data para seu atendimento com ${session.doctor}.`}
            </p>
          </DialogHeader>
        </div>

        {loading ? (
          <div className="h-[400px] flex flex-col items-center justify-center gap-4 bg-white">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Carregando agenda...</p>
          </div>
        ) : psychologist && availability ? (
          <RescheduleForm
            psychologist={psychologist}
            availability={availability}
            sessionId={String(session.id)}
            isPsychologistView={isPsychologistView}
            onSuccess={() => {
              setOpen(false)
              router.refresh()
            }}
            isRescheduling={isRescheduling}
            setIsRescheduling={setIsRescheduling}
            initialTime={session.time}
          />
        ) : (
          <div className="p-12 text-center bg-white">
            <p className="text-slate-500 font-medium">
              Não foi possível carregar a agenda. Tente novamente.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => setOpen(false)}>
              Voltar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function RescheduleForm({
  psychologist,
  availability,
  sessionId,
  isPsychologistView,
  onSuccess,
  isRescheduling,
  setIsRescheduling,
  initialTime,
}: {
  psychologist: PsychologistWithProfile
  availability: PsychologistAvailability
  sessionId: string
  isPsychologistView: boolean
  onSuccess: () => void
  isRescheduling: boolean
  setIsRescheduling: (v: boolean) => void
  initialTime: string
}) {
  const {
    selectedDay,
    setSelectedDay,
    currentDate,
    selectedTime,
    setSelectedTime,
    calendar,
    timezone,
  } = usePsychologistProfile(psychologist, availability, initialTime)

  const handleReschedule = async () => {
    if (!selectedDay || !selectedTime) return

    setIsRescheduling(true)
    try {
      const paddedMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
      const paddedDay = String(selectedDay).padStart(2, '0')
      const dateStr = `${currentDate.getFullYear()}-${paddedMonth}-${paddedDay}`

      // Criar a string de data/hora e converter para UTC considerando o timezone do psicólogo
      // Usar formato "YYYY-MM-DD HH:mm:ss" para o fromZonedTime interpretar corretamente
      const localDateTimeString = `${dateStr} ${selectedTime}:00`
      const utcDate = fromZonedTime(localDateTimeString, timezone)
      const newScheduledAt = utcDate.toISOString()

      const result = await rescheduleSession({
        sessionId,
        newScheduledAt,
      })

      if (result.success) {
        toast.success('Sessão reagendada!', {
          description: `Sua sessão foi movida para o dia ${paddedDay} de ${format(currentDate, 'MMMM', { locale: ptBR })} às ${selectedTime}.`,
        })
        onSuccess()
      } else {
        toast.error('Erro ao reagendar', { description: result.error })
      }
    } catch (error) {
      logger.error('Error rescheduling session:', error)
      toast.error('Erro inesperado ao reagendar')
    } finally {
      setIsRescheduling(false)
    }
  }

  return (
    <div className="bg-white p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
      {/* Date Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
            {calendar.currentMonthName} {calendar.currentYear}
          </h4>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl hover:bg-slate-100"
              onClick={calendar.handlePrevMonth}
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl hover:bg-slate-100"
              onClick={calendar.handleNextMonth}
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <span key={i} className="text-[10px] font-black text-slate-500 py-1 text-center">
              {d}
            </span>
          ))}
          {Array.from({ length: (calendar as any).firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10 w-10 md:h-11 md:w-11" />
          ))}
          {Array.from({ length: calendar.daysInMonth }, (_, i) => i + 1).map((day) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const available = calendar.isDayAvailable(date)
            const isSelected = day === selectedDay

            return (
              <button
                key={day}
                disabled={!available}
                onClick={() => {
                  setSelectedDay(day)
                  setSelectedTime(null)
                }}
                className={cn(
                  'h-10 w-10 md:h-11 md:w-11 rounded-2xl flex items-center justify-center text-sm transition-all relative overflow-hidden',
                  isSelected
                    ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-600/30'
                    : available
                      ? 'bg-blue-50 text-blue-600 font-bold hover:bg-blue-100'
                      : 'text-slate-400 cursor-not-allowed opacity-40'
                )}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time Selection */}
      <div className="space-y-4">
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" /> Horários Disponíveis
        </h4>

        {selectedDay ? (
          <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
            {calendar.availableSlotsForSelectedDay.length > 0 ? (
              calendar.availableSlotsForSelectedDay.map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  className={cn(
                    'h-12 text-sm font-bold border-slate-200 transition-all rounded-xl',
                    selectedTime === time
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                      : 'text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
                  )}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))
            ) : (
              <div className="col-span-3 py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium italic">
                  Nenhum horário disponível para este dia.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-sm text-slate-500 font-bold italic">Selecione uma data acima</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          disabled={!selectedTime || isRescheduling}
          onClick={handleReschedule}
        >
          {isRescheduling ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Reagendando...
            </>
          ) : (
            <>
              Confirmar Reagendamento <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          className="w-full h-11 text-red-500 hover:text-red-700 hover:bg-red-50 font-bold transition-all rounded-xl"
          disabled={isRescheduling}
          onClick={async () => {
            const confirmed = window.confirm('Tem certeza que deseja cancelar esta sessão?')
            if (!confirmed) return

            setIsRescheduling(true) // Reutiliza state pra bloquear UI
            try {
              const res = await cancelSession(sessionId)
              if (res.success) {
                toast.success('Sessão cancelada!')
                onSuccess()
              } else {
                toast.error('Erro ao cancelar', { description: res.error })
              }
            } catch (err) {
              toast.error('Erro inesperado')
            } finally {
              setIsRescheduling(false)
            }
          }}
        >
          Cancelar Sessão Permanente
        </Button>
      </div>
    </div>
  )
}
