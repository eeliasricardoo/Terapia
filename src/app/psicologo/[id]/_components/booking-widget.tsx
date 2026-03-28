'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  monthlyEnabled: boolean
  monthlyDiscount?: number
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
  monthlyEnabled,
  monthlyDiscount = 20,
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
      <Card className="border-none shadow-xl shadow-primary/5 bg-white overflow-hidden ring-1 ring-border flex flex-col">
        <div className="p-8 text-center space-y-6">
          <div className="p-8 rounded-3xl text-primary-foreground text-center relative overflow-hidden bg-primary shadow-xl shadow-primary/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-sm font-medium text-primary-foreground/70 mb-1 whitespace-nowrap">
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
            <h3 className="font-bold text-foreground text-xl">Agendamento Externo</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Este profissional utiliza uma plataforma externa para gerenciar sua agenda. Clique no
              botão abaixo para escolher seu horário e realizar o agendamento.
            </p>
          </div>

          <Button
            asChild
            className="w-full h-16 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-2xl"
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
    <Card className="border-none shadow-xl shadow-primary/5 bg-white overflow-hidden ring-1 ring-border flex flex-col max-h-[calc(100dvh-6.5rem)]">
      <div className="flex-1 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full pb-4">
        {/* Plan selector */}
        {monthlyEnabled && (
          <div className="grid grid-cols-2 p-1.5 bg-muted/60 rounded-2xl mb-6 mx-3 sm:mx-6 mt-6">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={cn(
                'py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300',
                selectedPlan === 'monthly'
                  ? 'bg-white text-primary shadow-sm ring-1 ring-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              Pacote Mensal
            </button>
            <button
              onClick={() => setSelectedPlan('single')}
              className={cn(
                'py-3 px-2 rounded-xl text-sm font-bold transition-all duration-300',
                selectedPlan === 'single'
                  ? 'bg-white text-primary shadow-sm ring-1 ring-border/50'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              Sessão Avulsa
            </button>
          </div>
        )}

        {/* Price card */}
        <div
          className={cn(
            'mx-3 sm:mx-6 p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-primary-foreground text-center transition-all duration-500 relative overflow-hidden shadow-xl',
            !monthlyEnabled && 'mt-6',
            selectedPlan === 'single'
              ? 'bg-primary shadow-primary/20'
              : 'bg-gradient-to-br from-primary via-primary/90 to-secondary shadow-primary/20'
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <p className="text-sm font-medium text-primary-foreground/70 mb-1 whitespace-nowrap">
              {selectedPlan === 'single' ? 'Valor da Sessão (50 min)' : 'Sessão no Plano Mensal'}
            </p>
            <div className="flex items-end justify-center gap-2 mt-1">
              <p className="text-4xl md:text-[2.75rem] font-extrabold tracking-tight leading-none whitespace-nowrap">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  displayPrice
                )}
              </p>
              {selectedPlan === 'monthly' && (
                <span className="text-sm md:text-base font-medium text-primary-foreground/50 line-through mb-1 whitespace-nowrap">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    price
                  )}
                </span>
              )}
            </div>
            {selectedPlan === 'monthly' && (
              <div className="mt-5 bg-white/20 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm">
                <Award className="w-4 h-4 text-[hsl(var(--sentirz-orange))]" />
                Economize {monthlyDiscount}% no total de{' '}
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  monthlyTotal
                )}
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4 sm:p-6 md:p-8">
          <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
            Selecione um horário
          </h3>
          <p className="text-xs text-muted-foreground mb-4 ml-4">
            Fuso horário: {getTimeZoneLabel(timezone)}
          </p>

          {/* Calendar */}
          <div className="mb-6 bg-muted/30 rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white hover:shadow-sm text-muted-foreground hover:text-foreground"
                onClick={handlePrevMonth}
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-foreground text-sm">
                {currentMonthName} {currentYear}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-white hover:shadow-sm text-muted-foreground hover:text-foreground"
                onClick={handleNextMonth}
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <span key={i} className="text-[10px] font-bold text-muted-foreground py-1">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const date = new Date(currentYear, currentMonth, day)
                const available = isDayAvailable(date)
                const isSelected = day === selectedDay

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
                    className={cn(
                      'h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all duration-200 mx-auto',
                      isSelected
                        ? 'bg-primary text-primary-foreground font-bold shadow-md'
                        : available
                          ? 'bg-[hsl(var(--sentirz-teal-pastel))] text-primary font-semibold hover:bg-primary hover:text-primary-foreground hover:scale-110 cursor-pointer'
                          : 'text-muted-foreground/40 cursor-not-allowed'
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time slots */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Horários disponíveis</h4>
            {selectedDay ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableSlotsForSelectedDay.length > 0 ? (
                  availableSlotsForSelectedDay.map((time) => (
                    <Button
                      key={time}
                      variant="outline"
                      className={cn(
                        'h-10 text-sm font-medium transition-all',
                        selectedTime === time
                          ? 'bg-primary text-primary-foreground border-primary shadow-md ring-2 ring-primary/20'
                          : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-[hsl(var(--sentirz-teal-pastel))]'
                      )}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))
                ) : (
                  <div className="col-span-2 sm:col-span-3 text-sm text-muted-foreground py-2">
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
            className="w-full h-14 text-base font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
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
