'use client'

import { Button } from '@/components/ui/button'
import { Footer } from '@/components/layout/Footer'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { PsychologistWithProfile } from '@/lib/supabase/types'
import type { PsychologistAvailability } from '@/lib/actions/availability'

import { usePsychologistProfile } from './_hooks/use-psychologist-profile'
import { ProfileHeader } from './_components/profile-header'
import { AboutSection } from './_components/about-section'
import { PresentationVideo } from './_components/presentation-video'
import { ReviewsSection } from './_components/reviews-section'
import { BookingWidget } from './_components/booking-widget'
import { useAuth } from '@/components/providers/auth-provider'
import { GuestBookingDialog } from './_components/guest-booking-dialog'
import { useState } from 'react'

interface Props {
  psychologist: PsychologistWithProfile
  availability: PsychologistAvailability | null
}

export function PsychologistProfileClient({ psychologist, availability }: Props) {
  const { isAuthenticated } = useAuth()
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false)

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
  } = usePsychologistProfile(psychologist, availability)

  const displayName = psychologist.profile?.full_name || 'Psicólogo'
  const firstSpecialty = psychologist.specialties?.[0] || 'Psicologia Clínica'

  const handleBooking = () => {
    if (!selectedTime || selectedDay === null) return

    const bookingUrl = `/pagamento?doctor=${psychologist.userId}&date=${calendar.currentYear}-${currentDate.getMonth() + 1}-${selectedDay}&time=${selectedTime}&plan=${selectedPlan}`

    if (!isAuthenticated) {
      setIsGuestDialogOpen(true)
      return
    }

    window.location.href = bookingUrl
  }

  const formattedDate = selectedDay
    ? new Date(calendar.currentYear, currentDate.getMonth(), selectedDay).toLocaleDateString(
        'pt-BR',
        {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }
      )
    : ''

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <main className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto w-full pb-32 lg:pb-8">
        <nav aria-label="Navegação estrutural" className="mb-6">
          <div className="flex items-center text-sm text-slate-500 gap-2">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/busca" className="hover:text-blue-600 transition-colors">
              Buscar Psicólogos
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-700 font-medium">{displayName}</span>
          </div>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Column */}
          <div className="flex-1 space-y-8">
            <ProfileHeader
              psychologist={psychologist}
              displayName={displayName}
              firstSpecialty={firstSpecialty}
            />

            <AboutSection psychologist={psychologist} />

            <PresentationVideo videoUrl={psychologist.video_presentation_url} />

            <ReviewsSection />
          </div>

          {/* Right Sidebar - Sticky Booking Widget */}
          <div id="booking-widget" className="w-full lg:w-[400px] flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <BookingWidget
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
                displayPrice={pricing.displayPrice}
                price={pricing.price}
                monthlyTotal={pricing.monthlyTotal}
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
              />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 lg:hidden z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-4 max-w-7xl mx-auto">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {selectedPlan === 'single' ? 'Sessão Avulsa' : 'Pacote Mensal'}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  pricing.displayPrice
                )}
              </span>
              {selectedPlan === 'monthly' && (
                <span className="text-xs text-slate-400 line-through">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    pricing.price
                  )}
                </span>
              )}
            </div>
          </div>
          <Button
            className={cn(
              'h-12 px-8 font-bold shadow-lg transition-all rounded-xl',
              selectedPlan === 'monthly'
                ? 'bg-blue-700 hover:bg-blue-800 shadow-blue-700/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
            )}
            onClick={() => {
              if (selectedTime) {
                handleBooking()
              } else {
                document.getElementById('booking-widget')?.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            {selectedTime ? (selectedPlan === 'monthly' ? 'Contratar' : 'Agendar') : 'Ver Horários'}
          </Button>
        </div>
      </div>

      <Footer />

      <GuestBookingDialog
        isOpen={isGuestDialogOpen}
        onClose={() => setIsGuestDialogOpen(false)}
        psychologistName={displayName}
        selectedDate={formattedDate}
        selectedTime={selectedTime || ''}
        bookingUrl={
          selectedDay
            ? `/pagamento?doctor=${psychologist.userId}&date=${calendar.currentYear}-${currentDate.getMonth() + 1}-${selectedDay}&time=${selectedTime}&plan=${selectedPlan}`
            : '#'
        }
      />
    </div>
  )
}
