import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Video,
    Calendar as CalendarIcon,
    Users,
    Clock,
    DollarSign,
    MoreHorizontal,
    TrendingUp,
    Settings,
    FileText
} from "lucide-react"
import Link from "next/link"
import { Profile } from "@/lib/supabase/types"

interface Props {
    userProfile: Profile
}

export function PsychologistDashboard({ userProfile }: Props) {
    const userName = userProfile?.full_name?.split(' ')[0] || 'Doutor(a)'

    // Mock data for psychologist dashboard
    const UPCOMING_SESSIONS = [
        { id: 1, patient: "Mariana Silva", time: "14:00", type: "Terapia Individual", status: "confirmed", image: "/avatars/03.png" },
        { id: 2, patient: "João Santos", time: "15:00", type: "Terapia Individual", status: "pending", image: "/avatars/04.png" },
        { id: 3, patient: "Ana Oliveira", time: "16:30", type: "Acompanhamento", status: "confirmed", image: "/avatars/05.png" },
    ]

    const RECENT_PATIENTS = [
        { id: 1, name: "Lucas Mendes", lastSession: "Ontem", status: "active" },
        { id: 2, name: "Fernanda Costa", lastSession: "Há 2 dias", status: "active" },
        { id: 3, name: "Roberto Almeida", lastSession: "Há 1 semana", status: "inactive" },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Olá, {userName}! 🩺</h1>
                    <p className="text-muted-foreground mt-1">
                        Aqui está o resumo do seu dia e próxima agenda.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Configurar Agenda
                    </Button>
                    <Button className="gap-2 bg-green-600 hover:bg-green-700">
                        <Video className="h-4 w-4" />
                        Minha Sala Virtual
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Sessões Hoje</p>
                            <h3 className="text-2xl font-bold text-slate-900">4</h3>
                        </div>
                        <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pacientes Ativos</p>
                            <h3 className="text-2xl font-bold text-slate-900">12</h3>
                        </div>
                        <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Ganhos do Mês</p>
                            <h3 className="text-2xl font-bold text-slate-900">R$ 3.2k</h3>
                        </div>
                        <div className="h-10 w-10 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Avaliação Média</p>
                            <h3 className="text-2xl font-bold text-slate-900">4.9</h3>
                        </div>
                        <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Schedule */}
                <Card className="col-span-1 lg:col-span-2 border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Agenda de Hoje</CardTitle>
                        <CardDescription>Você tem 3 sessões confirmadas para hoje.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {UPCOMING_SESSIONS.map((session) => (
                                <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="font-mono text-lg font-bold text-slate-900 bg-white px-3 py-1 rounded border border-slate-100">
                                            {session.time}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={session.image} />
                                                <AvatarFallback>{session.patient.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h4 className="font-semibold text-slate-900">{session.patient}</h4>
                                                <p className="text-xs text-slate-500">{session.type}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {session.status === 'confirmed' ? (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700">Confirmado</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pendente</Badge>
                                        )}
                                        <Button variant="ghost" size="icon" className="text-slate-400">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions / Recent Patients */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Próximos Passos</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="outline" className="w-full justify-start h-12 text-slate-600" asChild>
                                <Link href="/dashboard/agenda">
                                    <CalendarIcon className="mr-2 h-4 w-4" /> Gerenciar Horários Livres
                                </Link>
                            </Button>
                            <Button variant="outline" className="w-full justify-start h-12 text-slate-600" asChild>
                                <Link href="/dashboard/pacientes">
                                    <FileText className="mr-2 h-4 w-4" /> Prontuários e Anotações
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Pacientes Recentes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {RECENT_PATIENTS.map(patient => (
                                    <div key={patient.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{patient.name}</p>
                                                <p className="text-xs text-slate-500">Visto: {patient.lastSession}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-xs">Ver ficha</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
