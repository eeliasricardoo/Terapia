"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/layout/Footer"
import {
    CheckCircle2,
    Briefcase,
    Users,
    Star,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    GraduationCap,
    Languages,
    Award,
    BookOpen
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type { PsychologistWithProfile } from "@/lib/supabase/types"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getTimeZoneLabel } from "@/lib/date-utils"
import type { PsychologistAvailability } from "@/lib/actions/availability"
import { format, isBefore, startOfDay, addMinutes, parseISO } from "date-fns"
import { toZonedTime } from "date-fns-tz"

const TIME_SLOTS = [
    "09:00", "10:00", "11:00",
    "14:00", "15:00", "16:00"
]

const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

interface Props {
    psychologist: PsychologistWithProfile
    availability: PsychologistAvailability | null
}

export function PsychologistProfileClient({ psychologist, availability }: Props) {
    const [selectedDay, setSelectedDay] = useState(15)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedPlan, setSelectedPlan] = useState<'single' | 'monthly'>('monthly')

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
        setSelectedDay(1)
    }

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
        setSelectedDay(1)
    }

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const currentMonthName = MONTHS[currentDate.getMonth()]
    const currentYear = currentDate.getFullYear()
    const daysInMonth = getDaysInMonth(currentDate)

    // Extract data from psychologist object
    const profile = psychologist.profile
    const displayName = profile?.full_name || 'Psicólogo'
    const firstSpecialty = psychologist.specialties?.[0] || 'Psicologia Clínica'
    const price = psychologist.price_per_session ? Number(psychologist.price_per_session) : 150

    // Pricing Logic
    const monthlyPricePerSession = price * 0.8 // 20% discount
    const monthlyTotal = monthlyPricePerSession * 4

    const displayPrice = selectedPlan === 'single' ? price : monthlyPricePerSession

    // Availability specific logic
    const timezone = availability?.timezone || "America/Sao_Paulo"
    const today = toZonedTime(new Date(), timezone)

    const isDayAvailable = (date: Date) => {
        if (!availability) return false

        // Check if date is in the past
        if (isBefore(date, startOfDay(today))) {
            return false
        }

        const dateStr = format(date, 'yyyy-MM-dd')

        // Check overrides
        if (availability.overrides[dateStr]) {
            return availability.overrides[dateStr].type === 'custom' && availability.overrides[dateStr].slots.length > 0
        }

        // Check weekly schedule
        if (!availability.weeklySchedule) return false

        const dayOfWeekIndex = date.getDay()
        const daysMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const
        const dayKey = daysMap[dayOfWeekIndex]

        return availability.weeklySchedule[dayKey]?.enabled && availability.weeklySchedule[dayKey].slots.length > 0
    }

    const getAvailableSlotsForDay = (date: Date) => {
        if (!availability || !isDayAvailable(date)) return []

        const dateStr = format(date, 'yyyy-MM-dd')
        let slotsDef: { start: string, end: string }[] = []

        if (availability.overrides[dateStr] && availability.overrides[dateStr].type === 'custom') {
            slotsDef = availability.overrides[dateStr].slots
        } else if (availability.weeklySchedule) {
            const dayOfWeekIndex = date.getDay()
            const daysMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const
            const dayKey = daysMap[dayOfWeekIndex]
            slotsDef = availability.weeklySchedule[dayKey]?.slots || []
        }

        const durationMinutes = availability.weeklySchedule?.sessionDuration ? parseInt(availability.weeklySchedule.sessionDuration) : 50
        const breakMinutes = 10
        let generatedSlots: string[] = []

        slotsDef.forEach(slot => {
            let current = new Date(`1970-01-01T${slot.start}:00`)
            const end = new Date(`1970-01-01T${slot.end}:00`)

            while (current < end) {
                const hour = current.getHours().toString().padStart(2, '0')
                const min = current.getMinutes().toString().padStart(2, '0')
                generatedSlots.push(`${hour}:${min}`)

                current = addMinutes(current, durationMinutes + breakMinutes)
                // Do not add slots that would end after the end bound
                if (addMinutes(current, durationMinutes) > end) {
                    break;
                }
            }
        })

        return generatedSlots
    }

    const availableSlotsForSelectedDay = selectedDay
        ? getAvailableSlotsForDay(new Date(currentYear, currentDate.getMonth(), selectedDay))
        : []

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <main className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto w-full pb-32 lg:pb-8">
                {/* Breadcrumb integrado ao conteúdo */}
                <div className="mb-6">
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
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content Column */}
                    <div className="flex-1 space-y-8">
                        {/* Profile Header Block */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
                            <div className="relative flex-shrink-0 mx-auto md:mx-0">
                                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-lg ring-1 ring-slate-100">
                                    <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                                    <AvatarFallback className="text-4xl bg-blue-50 text-blue-600 font-medium">
                                        {displayName.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-2 right-2 bg-green-500 border-4 border-white rounded-full p-1.5" title="Verificado">
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-3">
                                <div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1 justify-center md:justify-start">
                                        <h1 className="text-3xl font-bold text-slate-900 leading-tight">{displayName}</h1>
                                        {psychologist.is_verified && (
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 gap-1 w-fit mx-auto md:mx-0">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Profissional Verificado
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-lg text-slate-600 font-medium">{firstSpecialty}</p>
                                    <p className="text-sm text-slate-400 font-mono mt-1">CRP: {psychologist.crp || 'Não informado'}</p>
                                </div>

                                <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-bold text-slate-900">5.0</span>
                                        <span className="text-slate-400">(42 avaliações)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <Briefcase className="h-4 w-4 text-blue-500" />
                                        <span className="font-semibold text-slate-900">10+</span>
                                        <span>anos experiência</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <Users className="h-4 w-4 text-blue-500" />
                                        <span className="font-bold text-slate-900">500+</span>
                                        <span>sessões</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bio Section */}
                        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                Sobre mim
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                {psychologist.bio || 'Psicólogo(a) dedicado(a) ao bem-estar emocional e mental dos pacientes. Utilizo abordagens baseadas em evidências para ajudar pessoas a superarem desafios e alcançarem seus objetivos terapêuticos.'}
                            </p>
                        </section>

                        {/* Education and Experience Section */}
                        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                Formação e Qualificações
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 bg-slate-50 p-2 rounded-lg">
                                            <GraduationCap className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Formação Acadêmica</h3>
                                            <ul className="mt-2 space-y-3">
                                                <li className="text-sm">
                                                    <p className="font-medium text-slate-900">Graduação em Psicologia</p>
                                                    <p className="text-slate-500">Universidade Federal (2010 - 2015)</p>
                                                </li>
                                                <li className="text-sm">
                                                    <p className="font-medium text-slate-900">Especialização em TCC</p>
                                                    <p className="text-slate-500">Instituto de Psicologia (2016 - 2018)</p>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 bg-slate-50 p-2 rounded-lg">
                                            <Languages className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Idiomas</h3>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal">Português (Nativo)</Badge>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal">Inglês (Avançado)</Badge>
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal">Espanhol (Intermediário)</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 pt-4">
                                        <div className="mt-1 bg-slate-50 p-2 rounded-lg">
                                            <Award className="h-5 w-5 text-slate-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Certificações</h3>
                                            <ul className="mt-2 space-y-1">
                                                <li className="text-sm text-slate-600">Certificado em Prática Clínica Supervisionada</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Specialties Section */}
                        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                            <h2 className="text-xl font-bold text-slate-900">Especialidades e Abordagens</h2>
                            <div className="flex flex-wrap gap-2">
                                {psychologist.specialties?.map((spec) => (
                                    <Badge key={spec} variant="outline" className="text-base px-4 py-1.5 border-slate-200 text-slate-600 bg-slate-50 font-normal">
                                        {spec}
                                    </Badge>
                                )) || (
                                        <p className="text-sm text-muted-foreground">Nenhuma especialidade cadastrada</p>
                                    )}
                            </div>
                        </section>

                        {/* Video Placeholder (if URL exists) */}
                        {psychologist.video_presentation_url && (
                            <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                                <h2 className="text-xl font-bold text-slate-900">Apresentação</h2>
                                <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                    <p>Vídeo de apresentação indisponível no momento</p>
                                </div>
                            </section>
                        )}

                        {/* Reviews Section */}
                        <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-6">
                            <h2 className="text-xl font-bold text-slate-900">Opiniões de pacientes</h2>
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <Star className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500">Este profissional ainda não recebeu avaliações escritas.</p>
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar - Sticky Booking Widget */}
                    <div id="booking-widget" className="w-full lg:w-[400px] flex-shrink-0">
                        <div className="sticky top-24 space-y-6">
                            <Card className="border-none shadow-xl shadow-blue-900/5 bg-white overflow-hidden ring-1 ring-slate-100">
                                {/* Plan Selection Header */}
                                <div className="grid grid-cols-2 text-center border-b font-medium text-sm">
                                    <button
                                        onClick={() => setSelectedPlan('monthly')}
                                        className={cn(
                                            "py-4 px-2 transition-colors relative",
                                            selectedPlan === 'monthly'
                                                ? "bg-blue-700 text-white font-bold"
                                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                        )}
                                    >
                                        Pacote Mensal
                                        {selectedPlan === 'monthly' && (
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 border-x-8 border-x-transparent border-t-8 border-t-blue-700"></div>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setSelectedPlan('single')}
                                        className={cn(
                                            "py-4 px-2 transition-colors relative",
                                            selectedPlan === 'single'
                                                ? "bg-blue-600 text-white font-bold"
                                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                        )}
                                    >
                                        Sessão Avulsa
                                        {selectedPlan === 'single' && (
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 border-x-8 border-x-transparent border-t-8 border-t-blue-600"></div>
                                        )}
                                    </button>
                                </div>

                                <div className={cn("p-6 pb-2 text-white text-center transition-colors duration-300", selectedPlan === 'single' ? "bg-blue-600" : "bg-blue-700")}>
                                    <p className="text-sm font-medium opacity-90">
                                        {selectedPlan === 'single' ? 'Valor da Sessão (50 min)' : 'Valor por Sessão (Plano Mensal)'}
                                    </p>
                                    <div className="flex items-baseline justify-center gap-2 mt-1">
                                        <p className="text-3xl font-bold">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice)}
                                        </p>
                                        {selectedPlan === 'monthly' && (
                                            <span className="text-sm opacity-75 line-through decoration-white/50">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                                            </span>
                                        )}
                                    </div>
                                    {selectedPlan === 'monthly' && (
                                        <div className="mt-2 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold inline-block">
                                            Economize 20% no total de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyTotal)}
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-6">
                                    <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Selecione um horário
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-4 ml-4">
                                        Fuso horário: {getTimeZoneLabel(timezone)}
                                    </p>

                                    <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:shadow-sm" onClick={handlePrevMonth}>
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="font-semibold text-slate-900 text-sm">{currentMonthName} {currentYear}</span>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white hover:shadow-sm" onClick={handleNextMonth}>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                                                <span key={i} className="text-[10px] font-bold text-slate-400 py-1">{d}</span>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1 text-center">
                                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                                                const date = new Date(currentYear, currentDate.getMonth(), day)
                                                const isAvailable = isDayAvailable(date)

                                                return (
                                                    <button
                                                        key={day}
                                                        disabled={!isAvailable && day !== selectedDay}
                                                        onClick={() => {
                                                            if (isAvailable) {
                                                                setSelectedDay(day)
                                                                setSelectedTime(null) // Reset time when day changes
                                                            }
                                                        }}
                                                        className={`h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all duration-200
                                                                ${day === selectedDay
                                                                ? 'bg-blue-600 text-white font-bold shadow-md scale-100 z-10'
                                                                : isAvailable
                                                                    ? 'bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 hover:scale-110 cursor-pointer'
                                                                    : 'text-slate-300 cursor-not-allowed'
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
                                                {availableSlotsForSelectedDay.length > 0 ? availableSlotsForSelectedDay.map((time) => (
                                                    <Button
                                                        key={time}
                                                        variant="outline"
                                                        className={`h-10 text-sm font-medium border-slate-200 transition-all
                                                                ${selectedTime === time
                                                                ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100"
                                                                : "text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"}
                                                            `}
                                                        onClick={() => setSelectedTime(time)}
                                                    >
                                                        {time}
                                                    </Button>
                                                )) : (
                                                    <div className="col-span-3 text-sm text-slate-500 py-2">Nenhum horário disponível para este dia.</div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-4 italic">Selecione um dia disponível acima</p>
                                        )}
                                    </div>

                                    <Separator className="my-6" />

                                    <Button
                                        className={cn(
                                            "w-full h-14 text-lg font-bold shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                            selectedPlan === 'monthly'
                                                ? "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                                                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                                        )}
                                        disabled={!selectedTime}
                                        onClick={() => window.location.href = `/pagamento?doctor=${psychologist.userId}&date=${currentYear}-${currentDate.getMonth() + 1}-${selectedDay}&time=${selectedTime}&plan=${selectedPlan}`}
                                    >
                                        {selectedTime
                                            ? (selectedPlan === 'monthly' ? 'Contratar Pacote Mensal' : 'Confirmar Agendamento')
                                            : 'Escolha um horário'}
                                        {selectedTime && <ArrowRight className="h-5 w-5 ml-2" />}
                                    </Button>

                                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                                        <span>Pagamento seguro e sigilo garantido</span>
                                    </div>
                                </CardContent>
                            </Card>
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
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(displayPrice)}
                            </span>
                            {selectedPlan === 'monthly' && (
                                <span className="text-xs text-slate-400 line-through">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button
                        className={cn(
                            "h-12 px-8 font-bold shadow-lg transition-all rounded-xl",
                            selectedPlan === 'monthly'
                                ? "bg-blue-700 hover:bg-blue-800 shadow-blue-700/20"
                                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                        )}
                        onClick={() => {
                            if (selectedTime) {
                                window.location.href = `/pagamento?doctor=${psychologist.userId}&date=${currentYear}-${currentDate.getMonth() + 1}-${selectedDay}&time=${selectedTime}&plan=${selectedPlan}`
                            } else {
                                document.getElementById('booking-widget')?.scrollIntoView({ behavior: 'smooth' })
                            }
                        }}
                    >
                        {selectedTime
                            ? (selectedPlan === 'monthly' ? 'Contratar' : 'Agendar')
                            : 'Ver Horários'}
                    </Button>
                </div>
            </div>

            <Footer />
        </div>
    )
}
