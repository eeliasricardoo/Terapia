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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
    Video,
    Calendar as CalendarIcon,
    Search,
    PlusCircle,
    FileText,
    MapPin,
    Clock,
    User,
    ArrowRight,
    Sparkles
} from "lucide-react"
import Link from "next/link"
import { RescheduleDialog } from "@/components/dashboard/RescheduleDialog"
import { getCurrentUserProfile } from "@/lib/actions/profile"

// Mock Data - TODO: Replace with real session data when sessions table is created
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

export default async function DashboardPage() {
    // Fetch current user profile
    const userProfile = await getCurrentUserProfile()
    const userName = userProfile?.full_name?.split(' ')[0] || 'Usuário'

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Olá, {userName}! 👋</h1>
                    <p className="text-muted-foreground mt-1">
                        Bem-vindo de volta ao seu espaço de cuidado.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="gap-2 px-6">
                                <Video className="h-4 w-4" />
                                Iniciar Sessão Agora
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Sala de Espera Virtual</DialogTitle>
                                <DialogDescription>
                                    Sua sessão com Dra. Sofía Pérez está agendada para hoje às 14:00.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex items-center justify-center py-6">
                                <div className="text-center space-y-4">
                                    <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                        <Video className="h-10 w-10" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">O link para a videochamada estará disponível 5 minutos antes.</p>
                                </div>
                            </div >
                            <DialogFooter className="sm:justify-start">
                                <Button type="button" variant="secondary" className="w-full">
                                    Fechar
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Find Psychologist CTA - High Priority */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Search className="h-64 w-64 text-white" />
                    </div>
                    <CardContent className="p-8 relative z-10">
                        <div className="max-w-2xl">
                            <h2 className="text-3xl font-bold mb-4">Encontre o profissional ideal para você</h2>
                            <p className="text-blue-100 text-lg mb-8">
                                Nossa plataforma conta com especialistas em diversas áreas prontos para te ajudar.
                                Comece sua jornada de autoconhecimento hoje mesmo.
                            </p>
                            <Button size="lg" variant="secondary" className="text-blue-600 hover:bg-white/90 gap-2 text-base font-semibold px-8 h-12" asChild>
                                <Link href="/busca">
                                    <Search className="h-5 w-5" />
                                    Buscar Psicólogos
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Next Session Card (Hero) */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-2 border-none shadow-md overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-10 hidden md:block">
                        <CalendarIcon className="h-32 w-32 text-blue-600" />
                    </div>
                    <div className="flex flex-col md:flex-row h-full">
                        <div className="p-8 flex-1">
                            <div className="inline-flex items-center rounded-full border border-blue-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-700 mb-4">
                                Próxima Sessão
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Terapia Individual</h2>
                            <p className="text-slate-500 mb-6 flex items-center gap-2">
                                <Clock className="h-4 w-4" /> Hoje, 14:00 - 14:50
                            </p>

                            <div className="flex items-center gap-4 mb-8">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarImage src="/avatars/01.png" />
                                    <AvatarFallback>SP</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Dra. Sofía Pérez</p>
                                    <p className="text-xs text-slate-500">Psicóloga Clínica</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                                    Detalhes
                                </Button>
                                <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                                    Entrar na Sala
                                </Button>
                            </div>
                        </div>
                        <div className="w-full md:w-1/3 bg-blue-50 relative min-h-[200px]">
                            {/* Illustration or decorative pattern could go here */}
                            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                                <p className="text-sm text-blue-800 italic">"O autoconhecimento é o começo de toda sabedoria."</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Quick Stats / Mood Tracker */}
                <Card className="border-none shadow-md bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg">Como você está hoje?</CardTitle>
                        <CardDescription>Registre seu humor diário</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-2">
                            {/* Mock Mood Buttons */}
                            {['😢', '😕', '😐', '🙂', '😄'].map((emoji, i) => (
                                <button key={i} className="aspect-square rounded-xl hover:bg-slate-100 flex items-center justify-center text-2xl transition-transform hover:scale-110">
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <h4 className="text-sm font-semibold text-slate-900 mb-4">Seu progresso</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">Sessões este mês</span>
                                    <span className="font-bold text-slate-900">3/4</span>
                                </div>
                                <Progress value={75} className="h-2 bg-slate-100" indicatorClassName="bg-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions Grid */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="p-6">
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Meu Perfil</h3>
                            <p className="text-sm text-slate-500 mb-4">Gerencie seus dados e preferências</p>
                            <Button variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 w-full justify-start group-hover:pl-4 transition-all">
                                Editar Perfil <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="p-6">
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Diário Emocional</h3>
                            <p className="text-sm text-slate-500 mb-4">Escreva sobre seus sentimentos</p>
                            <Button asChild variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100 w-full justify-start group-hover:pl-4 transition-all">
                                <Link href="/dashboard/diario">
                                    Abrir Diário <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
                        <CardContent className="p-6 h-full flex flex-col justify-between">
                            <div>
                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm">
                                    <Sparkles className="h-5 w-5 text-yellow-300" />
                                </div>
                                <h3 className="font-semibold text-white mb-1">Precisa de ajuda agora?</h3>
                                <p className="text-sm text-slate-300">Acesse nossos conteúdos de bem-estar ou fale com o suporte.</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                                <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10 text-sm font-medium px-2">
                                    Conteúdos
                                </Button>
                                <Button variant="ghost" className="text-blue-300 hover:text-blue-200 hover:bg-white/5 text-sm font-medium px-2 ml-auto">
                                    Suporte
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent History */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Histórico Recente</CardTitle>
                            <CardDescription>Suas últimas atividades na plataforma</CardDescription>
                        </div>
                        <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium">
                            Ver Tudo
                        </Button>
                    </CardHeader>
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
