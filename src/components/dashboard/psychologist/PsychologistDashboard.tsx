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
    CreditCard,
    MoreHorizontal,
    Star,
    Settings,
    FileText,
    CheckCircle2,
    ArrowRight,
    Bell,
    TrendingUp,
    ArrowUpRight
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
        {
            id: 1,
            patient: "Mariana Silva",
            time: "14:00",
            type: "Terapia Individual",
            status: "confirmed",
            image: "/avatars/03.png",
            duration: "50 min",
            details: "Sessão recorrente - Foco em ansiedade"
        },
        {
            id: 2,
            patient: "João Santos",
            time: "15:00",
            type: "Terapia Individual",
            status: "pending",
            image: "/avatars/04.png",
            duration: "50 min",
            details: "Primeira consulta"
        },
        {
            id: 3,
            patient: "Ana Oliveira",
            time: "16:30",
            type: "Acompanhamento",
            status: "confirmed",
            image: "/avatars/05.png",
            duration: "30 min",
            details: "Retorno mensal"
        },
    ]

    const RECENT_PATIENTS = [
        { id: 1, name: "Lucas Mendes", lastSession: "Ontem", status: "active", diagnosis: "Ansiedade Generalizada" },
        { id: 2, name: "Fernanda Costa", lastSession: "Há 2 dias", status: "active", diagnosis: "Burnout" },
        { id: 3, name: "Roberto Almeida", lastSession: "Há 1 semana", status: "inactive", diagnosis: "Depressão Leve" },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                        Painel do Profissional
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Bem-vindo(a), {userName}. Você tem 3 atendimentos hoje.
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" size="icon" className="relative border-slate-200 text-slate-600 hover:text-slate-900">
                        <Bell className="h-4 w-4" />
                        <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-red-500 rounded-full" />
                    </Button>
                    <Link href="/dashboard/ajustes">
                        <Button variant="outline" className="gap-2 text-slate-700 border-slate-200 hover:bg-slate-50">
                            <Settings className="h-4 w-4" />
                            Ajustes
                        </Button>
                    </Link>
                    <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200 border border-transparent transition-all">
                        <Video className="h-4 w-4" />
                        Sala Virtual
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-slate-500">Sessões (Hoje)</span>
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <CalendarIcon className="h-4 w-4 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">4</h3>
                            <div className="flex items-center text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                                +2
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-slate-500">Pacientes Ativos</span>
                            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                <Users className="h-4 w-4 text-indigo-600" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">12</h3>
                            <span className="text-xs text-slate-400">Total 28</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-slate-500">Faturamento (Mês)</span>
                            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                <CreditCard className="h-4 w-4 text-emerald-600" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">R$ 3.2k</h3>
                            <div className="flex items-center text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                                <ArrowUpRight className="h-3 w-3 mr-0.5" />
                                +15%
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-slate-500">Avaliação Média</span>
                            <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
                                <Star className="h-4 w-4 text-amber-600" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">4.9</h3>
                            <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">Excelente</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upcoming Schedule */}
                <Card className="col-span-1 lg:col-span-2 border-none shadow-sm bg-white flex flex-col">
                    <CardHeader className="border-b border-slate-100 bg-white pb-5 pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold text-slate-900">Agenda de Hoje</CardTitle>
                                <CardDescription>Terça-feira, 11 de Fevereiro</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium text-xs" asChild>
                                <Link href="/dashboard/agenda">VER AGENDA &rarr;</Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        <div className="flex flex-col">
                            {UPCOMING_SESSIONS.map((session, index) => {
                                const isNext = index === 0;
                                return (
                                    <div
                                        key={session.id}
                                        className={`
                                            flex items-stretch 
                                            ${isNext ? 'bg-blue-50/30' : 'bg-white'} 
                                            border-b border-slate-100 last:border-0 transition-colors
                                        `}
                                    >
                                        {/* Time Column */}
                                        <div className="w-24 relative flex flex-col items-center justify-center py-6 border-r border-slate-100/50">
                                            <span className={`text-lg font-bold ${isNext ? 'text-blue-600' : 'text-slate-700'}`}>{session.time}</span>
                                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mt-1 bg-slate-100 px-1.5 py-0.5 rounded text-center min-w-[3rem]">{session.duration.replace(' min', '')} MIN</span>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 flex items-center justify-between p-6">
                                            <div className="flex items-center gap-4">
                                                <Avatar className={`h-12 w-12 border-2 ${isNext ? 'border-blue-200' : 'border-slate-100'}`}>
                                                    <AvatarImage src={session.image} />
                                                    <AvatarFallback className={`${isNext ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>{session.patient.charAt(0)}</AvatarFallback>
                                                </Avatar>

                                                <div>
                                                    <h4 className={`font-semibold text-base ${isNext ? 'text-blue-900' : 'text-slate-900'}`}>
                                                        {session.patient}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-slate-500">
                                                            {session.type}
                                                        </span>
                                                        {session.status === 'confirmed' && (
                                                            <div className="flex items-center text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                Confirmado
                                                            </div>
                                                        )}
                                                        {session.status === 'pending' && (
                                                            <div className="flex items-center text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Pendente
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {isNext ? (
                                                    <Link href={`/sala/${session.id}`} className="w-full">
                                                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 h-9 shadow-md shadow-blue-200 text-xs font-semibold transition-all hover:scale-105 w-full">
                                                            <Video className="w-3 h-3 mr-2" />
                                                            Iniciar Atendimento
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 h-8 w-8 hover:bg-slate-100 rounded-full">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {UPCOMING_SESSIONS.length === 0 && (
                            <div className="p-12 text-center bg-slate-50/50">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                                    <CalendarIcon className="h-6 w-6 text-slate-300" />
                                </div>
                                <h3 className="text-sm font-medium text-slate-900">Agenda livre</h3>
                                <p className="text-slate-500 text-xs mt-1">Nenhum atendimento para hoje.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions / Recent Patients */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2 border-b border-slate-50 pt-4 px-4">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Settings className="h-3 w-3" />
                                Acesso Rápido
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2 pt-3">
                            <div className="space-y-1">
                                <Button variant="ghost" className="w-full justify-start h-10 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 px-3 transition-colors" asChild>
                                    <Link href="/dashboard/agenda">
                                        <div className="h-6 w-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center mr-3">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-sm font-medium">Gerenciar Horários</span>
                                    </Link>
                                </Button>
                                <Button variant="ghost" className="w-full justify-start h-10 text-slate-600 hover:bg-pink-50 hover:text-pink-700 px-3 transition-colors" asChild>
                                    <Link href="/dashboard/pacientes">
                                        <div className="h-6 w-6 rounded bg-pink-50 text-pink-600 flex items-center justify-center mr-3">
                                            <FileText className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="text-sm font-medium">Meus Prontuários</span>
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white">
                        <CardHeader className="pb-2 border-b border-slate-50 pt-4 px-4">
                            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                Histórico Recente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-50">
                                {RECENT_PATIENTS.map(patient => (
                                    <div key={patient.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900 group-hover:text-blue-700 transition-colors">{patient.name}</p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">{patient.lastSession}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 border-t border-slate-50">
                                <Button variant="ghost" size="sm" className="w-full text-slate-500 hover:text-slate-900 text-xs font-medium h-8">
                                    Ver todos
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
