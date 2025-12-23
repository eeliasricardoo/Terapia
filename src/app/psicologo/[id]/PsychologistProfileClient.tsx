"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/layout/Footer"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import {
    CheckCircle2,
    Briefcase,
    Users,
    Star,
    ChevronLeft,
    ChevronRight,
    ArrowRight
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { MobileNav } from "@/components/dashboard/MobileNav"
import type { PsychologistWithProfile } from "@/lib/supabase/types"

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
}

export function PsychologistProfileClient({ psychologist }: Props) {
    const [selectedDay, setSelectedDay] = useState(15)
    const [currentDate, setCurrentDate] = useState(new Date(2024, 9))
    const [selectedTime, setSelectedTime] = useState<string | null>(null)

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

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            <MobileNav />

            <div className="flex-1 container py-8 flex flex-col lg:flex-row gap-8">
                <DashboardSidebar className="hidden lg:flex" />
                <main className="flex-1 space-y-6">
                    <div className="flex flex-col xl:flex-row gap-8">
                        {/* Left Sidebar - Profile Card */}
                        <aside className="w-full xl:w-80 space-y-6">
                            <Card className="border-none shadow-sm overflow-hidden">
                                <CardContent className="p-6 flex flex-col items-center text-center">
                                    <div className="relative mb-4">
                                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                                            <AvatarImage src={profile?.avatar_url || undefined} />
                                            <AvatarFallback className="text-4xl">{displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <h1 className="text-2xl font-bold text-slate-900">{displayName}</h1>
                                    <p className="text-blue-600 font-medium">{firstSpecialty}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{psychologist.crp || 'CRP não informado'}</p>

                                    {psychologist.is_verified && (
                                        <div className="flex items-center gap-1 mt-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Verificado
                                        </div>
                                    )}

                                    <p className="text-sm text-slate-600 mt-4 mb-6">
                                        {psychologist.specialties?.slice(0, 2).join(', ') || 'Especialista em Psicologia'}
                                    </p>

                                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-md">
                                        Agendar Consulta
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Stats Cards */}
                            <div className="grid gap-4">
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Briefcase className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Anos de Experiência</p>
                                            <p className="text-lg font-bold text-slate-900">10+</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Users className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Sessões Realizadas</p>
                                            <p className="text-lg font-bold text-slate-900">500+</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border-none shadow-sm">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Star className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Avaliação Média</p>
                                            <p className="text-lg font-bold text-slate-900">4.9 / 5</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1 space-y-6">
                            {/* About */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-8">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">Sobre mim</h2>
                                    <p className="text-slate-600 leading-relaxed">
                                        {psychologist.bio || 'Psicólogo(a) dedicado(a) ao bem-estar emocional e mental dos pacientes. Utilizo abordagens baseadas em evidências para ajudar pessoas a superarem desafios e alcançarem seus objetivos terapêuticos.'}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Specialties */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-8">
                                    <h2 className="text-xl font-bold text-slate-900 mb-4">Especialidades</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {psychologist.specialties?.map((spec) => (
                                            <Badge key={spec} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 text-sm font-normal">
                                                {spec}
                                            </Badge>
                                        )) || (
                                                <p className="text-sm text-muted-foreground">Nenhuma especialidade cadastrada</p>
                                            )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Availability */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-8">
                                    <h2 className="text-xl font-bold text-slate-900 mb-6">Minha Disponibilidade</h2>

                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Calendar Mock */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-4">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <span className="font-semibold text-slate-900">{currentMonthName} {currentYear}</span>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                                                <span className="text-muted-foreground text-xs py-2">DO</span>
                                                <span className="text-muted-foreground text-xs py-2">SE</span>
                                                <span className="text-muted-foreground text-xs py-2">TE</span>
                                                <span className="text-muted-foreground text-xs py-2">QU</span>
                                                <span className="text-muted-foreground text-xs py-2">QU</span>
                                                <span className="text-muted-foreground text-xs py-2">SE</span>
                                                <span className="text-muted-foreground text-xs py-2">SÁ</span>
                                            </div>
                                            <div className="grid grid-cols-7 gap-1 text-center text-sm">
                                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                                                    <button
                                                        key={day}
                                                        onClick={() => setSelectedDay(day)}
                                                        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors
                                                            ${day === selectedDay ? 'bg-blue-500 text-white font-bold' : 'hover:bg-slate-100 text-slate-700'}
                                                        `}
                                                    >
                                                        {day}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Time Slots */}
                                        <div className="flex-1 border-l pl-0 md:pl-8 pt-6 md:pt-0 border-t md:border-t-0 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-semibold text-slate-900 mb-4">
                                                    {selectedDay} de {currentMonthName}, {currentYear}
                                                </h3>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {TIME_SLOTS.map((time) => (
                                                        <Button
                                                            key={time}
                                                            variant={selectedTime === time ? "default" : "outline"}
                                                            className={`
                                                                ${selectedTime === time
                                                                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                                                    : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"}
                                                            `}
                                                            onClick={() => setSelectedTime(time)}
                                                        >
                                                            {time}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {selectedTime && (
                                                <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                    <div className="bg-slate-50 p-4 rounded-lg mb-4 text-sm text-slate-600 border border-slate-100">
                                                        <p className="flex justify-between mb-1">
                                                            <span>Consulta:</span>
                                                            <span className="font-semibold text-slate-900">50 min</span>
                                                        </p>
                                                        <p className="flex justify-between text-lg font-bold text-slate-900 mt-2 pt-2 border-t border-slate-200">
                                                            <span>Total:</span>
                                                            <span className="text-blue-600">R$ {price.toFixed(2)}</span>
                                                        </p>
                                                    </div>
                                                    <Button
                                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-between px-6"
                                                        onClick={() => window.location.href = `/pagamento?doctor=${psychologist.user_id}&date=${currentYear}-${currentDate.getMonth() + 1}-${selectedDay}&time=${selectedTime}`}
                                                    >
                                                        Ir para o Pagamento
                                                        <ArrowRight className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Reviews - Placeholder */}
                            <Card className="border-none shadow-sm">
                                <CardContent className="p-8">
                                    <h2 className="text-xl font-bold text-slate-900 mb-6">Opiniões de pacientes</h2>
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        Ainda não há avaliações para este profissional.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    )
}
