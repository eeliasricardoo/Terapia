import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Video,
    Calendar as CalendarIcon,
    Search,
    PlusCircle,
    FileText,
    MapPin
} from "lucide-react"
import Link from "next/link"
import { RescheduleDialog } from "@/components/dashboard/RescheduleDialog"

// Mock Data
const NEXT_SESSION = {
    id: 1,
    doctor: "Dr. Carlos Pereira",
    role: "Psicólogo Clínico",
    date: "Amanhã, 15 de Outubro",
    time: "14:30",
    image: "/avatars/02.png",
    countdown: "23 horas e 15 minutos"
}

const HISTORY = [
    { id: 1, doctor: "Dr. Carlos Pereira", date: "08 de Outubro de 2025" },
    { id: 2, doctor: "Dr. Carlos Pereira", date: "01 de Outubro de 2025" },
    { id: 3, doctor: "Dr. Carlos Pereira", date: "24 de Setembro de 2025" },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Olá, João!</h1>
                <p className="text-muted-foreground mt-1">Bem-vindo de volta, estamos felizes em te ver.</p>
            </div>

            {/* Next Session Section */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Sua Próxima Sessão</h2>
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardContent className="p-0 flex flex-col md:flex-row">
                        <div className="p-6 flex-1 flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                                    <AvatarImage src={NEXT_SESSION.image} />
                                    <AvatarFallback>CP</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">Terapia com {NEXT_SESSION.doctor}</h3>
                                    <p className="text-slate-500">{NEXT_SESSION.date} às {NEXT_SESSION.time}</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600 mb-6">
                                Faltam: <span className="text-blue-600 font-medium">{NEXT_SESSION.countdown}</span>
                            </p>

                            <div className="flex gap-3">
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2 px-6">
                                    <Video className="h-4 w-4" />
                                    Entrar na Sessão
                                </Button>
                                <RescheduleDialog session={NEXT_SESSION}>
                                    <Button variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-700">
                                        Remarcar
                                    </Button>
                                </RescheduleDialog>
                            </div>
                        </div>

                        {/* Decorative Map/Image Area */}
                        <div className="w-full md:w-1/3 bg-blue-50 relative min-h-[200px]">
                            <div className="absolute inset-0 flex items-center justify-center">
                                {/* Using a placeholder pattern or map-like graphic */}
                                <div className="text-blue-200 opacity-20">
                                    <MapPin className="h-32 w-32" />
                                </div>
                            </div>
                            {/* You could use an actual image here if available */}
                            {/* <Image src="/map-placeholder.png" fill className="object-cover" /> */}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Ações Rápidas</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                <PlusCircle className="h-6 w-6 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Agendar nova sessão</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Marque um novo horário com seu psicólogo atual.
                            </p>
                            <RescheduleDialog session={NEXT_SESSION}>
                                <Button variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 w-full justify-start">
                                    Reagendar com {NEXT_SESSION.doctor.split(' ')[1]}
                                </Button>
                            </RescheduleDialog>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                <Search className="h-6 w-6 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Buscar novo psicólogo</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Explore outros profissionais para encontrar o ideal para você.
                            </p>
                            <Button asChild variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 w-full justify-start">
                                <Link href="/busca">Encontrar Psicólogos</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Session History */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Histórico de Sessões</h2>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {HISTORY.map((session) => (
                                <div key={session.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <CalendarIcon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">Sessão com {session.doctor}</p>
                                            <p className="text-sm text-muted-foreground">{session.date}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium">
                                        Ver Resumo
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t text-center">
                            <Button variant="link" className="text-blue-600" asChild>
                                <Link href="/dashboard/sessoes">Ver todo o histórico</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
