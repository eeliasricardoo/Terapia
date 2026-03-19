'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight, Award, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTimeZoneLabel } from '@/lib/date-utils'

interface BookingWidgetProps {
  selectedPlan: 'single' | 'monthly'
  setSelectedPlan: (plan: 'single' | 'monthly') => void
  displayPrice: number
  price: number
  monthlyTotal: number
  timezone: string
  currentMonthName: string
  currentYear: number
  handlePrevMonth: () => void
  handleNextMonth: () => void
  daysInMonth: number
  selectedDay: number | null
  setSelectedDay: (day: number) => void
  setSelectedTime: (time: string | null) => void
  isDayAvailable: (date: Date) => boolean
  availableSlotsForSelectedDay: string[]
  selectedTime: string | null
  onSubmit: () => void
  currentMonth: number
  externalSchedulingUrl?: string | null
}

export function BookingWidget({
  selectedPlan,
  setSelectedPlan,
  displayPrice,
  price,
  monthlyTotal,
  timezone,
  currentMonthName,
  currentYear,
  handlePrevMonth,
  handleNextMonth,
  daysInMonth,
  selectedDay,
  setSelectedDay,
  setSelectedTime,
  isDayAvailable,
  availableSlotsForSelectedDay,
  selectedTime,
  onSubmit,
  currentMonth,
  externalSchedulingUrl,
}: BookingWidgetProps) {
  if (externalSchedulingUrl) {
    return (
      <Card className="border-none shadow-xl shadow-blue-900/5 bg-white overflow-hidden ring-1 ring-slate-100 flex flex-col">
        <div className="p-8 text-center space-y-6">
          <div
            className={cn(
              'p-8 rounded-3xl text-white text-center transition-all duration-500 relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 shadow-indigo-600/20 shadow-xl'
            )}
          >
            <div className="relative z-10">
              <p className="text-sm font-medium text-blue-50 mb-1 opacity-90 whitespace-nowrap">
                Valor da Sessão (50 min)
              </p>
              <p className="text-4xl font-extrabold tracking-tight">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  displayPrice
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-xl">Agendamento Externo</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Este profissional utiliza uma plataforma externa para gerenciar sua agenda. Clique no
              botão abaixo para escolher seu horário e realizar o agendamento.
            </p>
          </div>

          <Button
            asChild
            className="w-full h-16 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 rounded-2xl"
          >
            <a href={externalSchedulingUrl} target="_blank" rel="noopener noreferrer">
              Agendar agora <ArrowRight className="h-5 w-5 ml-2" />
            </a>
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>Você será redirecionado para uma página segura</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-xl shadow-blue-900/5 bg-white overflow-hidden ring-1 ring-slate-100 flex flex-col max-h-[calc(100vh-6.5rem)]">
      <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full pb-4">
        {/* Plan Selection Header */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 rounded-2xl mb-6 mx-6 mt-6">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={cn(
              'py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 relative',
              selectedPlan === 'monthly'
                ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            )}
          >
            Pacote Mensal
          </button>
          <button
            onClick={() => setSelectedPlan('single')}
            className={cn(
              'py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300 relative',
              selectedPlan === 'single'
                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            )}
          >
            Sessão Avulsa
          </button>
        </div>

        <div
          className={cn(
            'mx-6 p-6 md:p-8 rounded-3xl text-white text-center transition-all duration-500 relative overflow-hidden',
            selectedPlan === 'single'
              ? 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-900/20 shadow-xl'
              : 'bg-gradient-to-br from-indigo-600 to-blue-700 shadow-indigo-600/20 shadow-xl'
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

          <div className="relative z-10">
            <p className="text-sm font-medium text-blue-50 mb-1 opacity-90 whitespace-nowrap">
              {selectedPlan === 'single' ? 'Valor da Sessão (50 min)' : 'Sessão no Plano Mensal'}
            </p>
            <div className="flex items-end justify-center gap-2 mt-1">
              <p className="text-4xl md:text-[2.75rem] font-extrabold tracking-tight leading-none whitespace-nowrap">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  displayPrice
                )}
              </p>
              {selectedPlan === 'monthly' && (
                <span className="text-sm md:text-base font-medium text-indigo-200 line-through decoration-indigo-300/50 mb-1 whitespace-nowrap">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    price
                  )}
                </span>
              )}
            </div>
            {selectedPlan === 'monthly' && (
              <div className="mt-5 bg-white/20 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm">
                <Award className="w-4 h-4 text-amber-300" />
                Economize 20% no total de{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  monthlyTotal
                )}
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6 md:p-8">
          <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full bg-green-500 animate-pulse"
              aria-hidden="true"
            ></div>
            Selecione um horário
          </h3>
          <p className="text-xs text-slate-500 mb-4 ml-4">
            Fuso horário: {getTimeZoneLabel(timezone)}
          </p>

          <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white hover:shadow-sm"
                onClick={handlePrevMonth}
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-slate-900 text-sm">
                {currentMonthName} {currentYear}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white hover:shadow-sm"
                onClick={handleNextMonth}
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <span key={i} className="text-[10px] font-bold text-slate-500 py-1">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const date = new Date(currentYear, currentMonth, day)
                const available = isDayAvailable(date)

                return (
                  <button
                    key={day}
                    disabled={!available}
                    onClick={() => {
                      if (available) {
                        setSelectedDay(day)
                        setSelectedTime(null)
                      }
                    }}
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all duration-200
                                            ${
                                              day === selectedDay
                                                ? 'bg-blue-600 text-white font-bold shadow-md scale-100 z-10'
                                                : available
                                                  ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 hover:scale-110 cursor-pointer'
                                                  : 'text-slate-400 cursor-not-allowed'
                                            }
                                        `}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900">Horários disponíveis</h4>
            {selectedDay ? (
              <div className="grid grid-cols-3 gap-2">
                {availableSlotsForSelectedDay.length > 0 ? (
                  availableSlotsForSelectedDay.map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      className={`h-10 text-sm font-medium border-slate-200 transition-all
                                            ${
                                              selectedTime === time
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100'
                                                : 'text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                                            }
                                        `}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))
                ) : (
                  <div className="col-span-3 text-sm text-slate-500 py-2">
                    Nenhum horário disponível para este dia.
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4 italic">
                Selecione um dia disponível acima
              </p>
            )}
          </div>

          <Separator className="my-6" />

          <Button
            className={cn(
              'w-full h-14 text-lg font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed',
              selectedPlan === 'monthly'
                ? 'bg-blue-700 hover:bg-blue-800 shadow-blue-700/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
            )}
            disabled={!selectedTime}
            onClick={onSubmit}
          >
            {selectedTime
              ? selectedPlan === 'monthly'
                ? 'Contratar Pacote Mensal'
                : 'Confirmar Agendamento'
              : 'Escolha um horário'}
            {selectedTime && <ArrowRight className="h-5 w-5 ml-2" />}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>Pagamento seguro e sigilo garantido</span>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
