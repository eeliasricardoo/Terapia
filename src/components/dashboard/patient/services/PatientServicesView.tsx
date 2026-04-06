'use client'

import { useEffect, useState } from 'react'
import { Loader2, Package, Tag, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { BookingWidget } from '@/app/[locale]/psicologo/[id]/_components/booking-widget'
import { usePsychologistProfile } from '@/app/[locale]/psicologo/[id]/_hooks/use-psychologist-profile'
import { getPatientBookingData, getPatientServicesView } from '@/lib/actions/services-config'
import type { PatientBookingData, PatientServicesData } from '@/lib/actions/services-config'

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

interface LoadedData {
  booking: PatientBookingData
  services: PatientServicesData
}

function BookingSection({
  booking,
  plans,
}: {
  booking: PatientBookingData
  plans: PatientServicesData['plans']
}) {
  const {
    selectedDay,
    setSelectedDay,
    currentDate,
    selectedTime,
    setSelectedTime,
    selectedPlan,
    setSelectedPlan,
    pricing,
    calendar,
    timezone,
  } = usePsychologistProfile(booking.psychologist, booking.availability)

  const handleBooking = () => {
    if (!selectedTime || selectedDay === null) return
    const url = `/pagamento?doctor=${booking.psychologist.userId}&date=${calendar.currentYear}-${currentDate.getMonth() + 1}-${selectedDay}&time=${selectedTime}&plan=${selectedPlan}`
    window.location.href = url
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Serviços &amp; Tarifas</h1>
        <p className="text-sm text-slate-500 mt-1">
          Agende com {booking.psychologist.profile?.full_name || 'seu psicólogo'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
        {/* Left: custom plans + coupon hint */}
        <div className="space-y-6">
          {plans.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Pacotes disponíveis
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
                  >
                    <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-blue-500" />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant="secondary"
                          className="text-xs font-semibold bg-slate-100 text-slate-600 border-0"
                        >
                          {plan.sessions} sessões
                        </Badge>
                        {plan.discount > 0 && (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5 flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" />-{plan.discount}%
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-900 text-sm mb-1">{plan.name}</p>
                      <p className="text-xl font-bold text-slate-900">{fmt(plan.price)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {fmt(plan.price / plan.sessions)} por sessão
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Coupon hint */}
          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="h-9 w-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0">
              <Tag className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">Tem um cupom de desconto?</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Aplique seu cupom na tela de pagamento ao agendar uma sessão.
              </p>
            </div>
          </div>
        </div>

        {/* Right: full booking widget */}
        <BookingWidget
          selectedPlan={selectedPlan}
          setSelectedPlan={setSelectedPlan}
          displayPrice={pricing.displayPrice}
          price={pricing.price}
          monthlyTotal={pricing.monthlyTotal}
          monthlyEnabled={pricing.monthlyEnabled}
          monthlyDiscount={pricing.monthlyDiscount}
          timezone={timezone}
          currentMonthName={calendar.currentMonthName}
          currentYear={calendar.currentYear}
          handlePrevMonth={calendar.handlePrevMonth}
          handleNextMonth={calendar.handleNextMonth}
          daysInMonth={calendar.daysInMonth}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          setSelectedTime={setSelectedTime}
          isDayAvailable={calendar.isDayAvailable}
          availableSlotsForSelectedDay={calendar.availableSlotsForSelectedDay}
          selectedTime={selectedTime}
          onSubmit={handleBooking}
          currentMonth={currentDate.getMonth()}
          externalSchedulingUrl={booking.psychologist.external_scheduling_url ?? null}
        />
      </div>
    </div>
  )
}

export function PatientServicesView() {
  const [data, setData] = useState<LoadedData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getPatientBookingData(), getPatientServicesView()]).then(
      ([bookingRes, servicesRes]) => {
        if (bookingRes.success && servicesRes.success) {
          setData({ booking: bookingRes.data, services: servicesRes.data })
        } else {
          setError(
            !bookingRes.success
              ? bookingRes.error
              : !servicesRes.success
                ? servicesRes.error
                : 'Erro ao carregar'
          )
        }
        setIsLoading(false)
      }
    )
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-slate-300 animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Package className="h-7 w-7 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">Sem serviços disponíveis</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Agende sua primeira sessão para ver os serviços disponíveis do seu psicólogo.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <BookingSection booking={data.booking} plans={data.services.plans} />
    </div>
  )
}
