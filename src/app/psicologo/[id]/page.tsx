"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import {
    CheckCircle2,
    Briefcase,
    Users,
    Star,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar as CalendarIcon
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

// Mock Data
const DOCTOR = {
    id: 1,
    name: "Dra. Sofía Pérez",
    title: "Psicóloga Clínica",
    license: "CRP 12/34567",
    image: "/avatars/01.png",
    verified: true,
    specialty_summary: "Especialista em Ansiedade e Terapia de Casal",
    experience: 12,
    sessions: "1.500+",
    rating: 4.9,
    about: "Com mais de uma década de experiência em psicologia clínica, meu foco é criar um espaço seguro e de confiança onde meus pacientes possam explorar seus pensamentos e emoções sem julgamento. Especializo-me no tratamento de ansiedade, estresse e desafios nos relacionamentos. Minha metodologia integra a Terapia Cognitivo-Comportamental (TCC) com técnicas de mindfulness para proporcionar ferramentas práticas e efetivas que promovem o bem-estar a longo prazo. Acredito firmemente no potencial de cada pessoa para superar obstáculos e viver uma vida mais plena e significativa.",
    specialties: ["Ansiedade", "Depressão", "Terapia de Casal", "Estresse Laboral", "Autoestima", "Terapia Familiar"],
    reviews: [
        {
            id: 1,
            author: "Ana M.",
            date: "12 de Setembro, 2024",
            rating: 5,
            text: "A Dra. Pérez é incrível. Ela me ajudou a entender meus padrões de ansiedade e me deu ferramentas que realmente funcionam no meu dia a dia. Recomendo totalmente."
        },
        {
            id: 2,
            author: "Carlos e Laura",
            date: "28 de Agosto, 2024",
            rating: 5,
            text: "Nossa terapia de casal com a Sofia nos permitiu nos comunicar de uma maneira muito mais saudável. Sua orientação tem sido fundamental para reconstruir nossa relação."
        },
        {
            id: 3,
            author: "Javier R.",
            date: "15 de Julho, 2024",
            rating: 4,
            text: "Muito profissional e atenta. Me senti ouvido e compreendido desde a primeira sessão. O formato online é muito cômodo."
        }
    ]
}

const TIME_SLOTS = [
    "09:00", "10:00", "11:00",
    "14:00", "15:00", "16:00"
]

const MONTHS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

export default function PsychologistProfilePage() {
    const [selectedDay, setSelectedDay] = useState(15)
    const [currentDate, setCurrentDate] = useState(new Date(2024, 9)) // Start in October 2024

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))
        setSelectedDay(1) // Reset day to 1 when changing month
    }

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))
        setSelectedDay(1) // Reset day to 1 when changing month
    }

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const currentMonthName = MONTHS[currentDate.getMonth()]
    const currentYear = currentDate.getFullYear()
    const daysInMonth = getDaysInMonth(currentDate)

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar isLoggedIn={true} userRole="client" />

            <main className="flex-1 container py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Sidebar - Profile Card */}
                    <aside className="w-full lg:w-80 space-y-6">
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <div className="relative mb-4">
                                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                                        <AvatarImage src={DOCTOR.image} />
                                        <AvatarFallback className="text-4xl">{DOCTOR.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>

                                <h1 className="text-2xl font-bold text-slate-900">{DOCTOR.name}</h1>
                                <p className="text-blue-600 font-medium">{DOCTOR.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{DOCTOR.license}</p>

                                {DOCTOR.verified && (
                                    <div className="flex items-center gap-1 mt-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Verificada
                                    </div>
                                )}

                                <p className="text-sm text-slate-600 mt-4 mb-6">
                                    {DOCTOR.specialty_summary}
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
                                        <p className="text-lg font-bold text-slate-900">{DOCTOR.experience}</p>
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
                                        <p className="text-lg font-bold text-slate-900">{DOCTOR.sessions}</p>
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
                                        <p className="text-lg font-bold text-slate-900">{DOCTOR.rating} / 5</p>
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
                                    {DOCTOR.about}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Specialties */}
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Especialidades</h2>
                                <div className="flex flex-wrap gap-2">
                                    {DOCTOR.specialties.map((spec) => (
                                        <Badge key={spec} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1 text-sm font-normal">
                                            {spec}
                                        </Badge>
                                    ))}
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
                                            {/* Mock days */}
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
                                    <div className="flex-1 border-l pl-0 md:pl-8 pt-6 md:pt-0 border-t md:border-t-0">
                                        <h3 className="font-semibold text-slate-900 mb-4">
                                            {selectedDay} de {currentMonthName}, {currentYear}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {TIME_SLOTS.map((time) => (
                                                <Button key={time} variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                                                    {time}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reviews */}
                        <Card className="border-none shadow-sm">
                            <CardContent className="p-8">
                                <h2 className="text-xl font-bold text-slate-900 mb-6">Opiniões de pacientes</h2>
                                <div className="space-y-6">
                                    {DOCTOR.reviews.map((review, index) => (
                                        <div key={review.id}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex text-yellow-400">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-slate-200'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-muted-foreground">{review.date}</span>
                                            </div>
                                            <p className="text-slate-600 text-sm italic mb-2">"{review.text}"</p>
                                            <p className="text-sm font-bold text-slate-900">- {review.author}</p>
                                            {index < DOCTOR.reviews.length - 1 && <Separator className="mt-6" />}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
