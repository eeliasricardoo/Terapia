import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Clock,
    Settings,
    Search,
    Star,
    ChevronRight,
    Bell,
    Video,
    MessageSquare
} from "lucide-react"
import Link from "next/link"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

// Mock data
const NEXT_SESSION = {
    doctor: "Dra. Ana María Rojas",
    role: "Psicóloga Clínica",
    date: "Quinta-feira, 12 de Dezembro",
    time: "14:00 - 14:50",
    image: "/avatars/01.png",
    link: "#"
}

const NOTIFICATIONS = [
    { id: 1, title: "Complete seu perfil", desc: "Adicione informações de saúde para melhor atendimento.", type: "warning" },
    { id: 2, title: "Sessão confirmada", desc: "Sua consulta com Dr. Carlos foi confirmada.", type: "success" },
]

const RECOMMENDED_PSYCHOLOGISTS = [
    {
        id: 1,
        name: "Dra. Ana María Rojas",
        title: "Psicóloga Clínica",
        rating: 4.9,
        reviews: 123,
        tags: ["Ansiedade", "TCC"],
        image: "/avatars/01.png",
    },
    {
        id: 2,
        name: "Dr. Carlos Fuentes",
        title: "Terapia de Casal",
        rating: 4.8,
        reviews: 98,
        tags: ["Relacionamentos", "Comunicação"],
        image: "/avatars/02.png",
    },
    {
        id: 3,
        name: "Dra. Sofia Vergara",
        title: "Psicóloga Infantil",
        rating: 5.0,
        reviews: 76,
        tags: ["Crianças", "Família"],
        image: "/avatars/03.png",
    },
]

export default function DashboardPage() {
    return (
        <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Visão Geral</h1>
                    <p className="text-muted-foreground">Acompanhe seu progresso e próximas atividades.</p>
                </div>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className="relative">
                                <Bell className="h-4 w-4" />
                                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                            <div className="space-y-4">
                                <h4 className="font-medium leading-none">Notificações</h4>
                                <div className="grid gap-4">
                                    {NOTIFICATIONS.map((notif) => (
                                        <div key={notif.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                                            <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${notif.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                            <div>
                                                <p className="text-sm font-medium leading-none">{notif.title}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{notif.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full text-xs h-8">
                                    Marcar todas como lidas
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button asChild>
                        <Link href="/busca">Agendar Sessão</Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Column (2/3) */}
                <div className="md:col-span-2 space-y-6">

                    {/* Next Session Card */}
                    <Card className="border-l-4 border-l-primary shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20">Próxima Sessão</Badge>
                                    <CardTitle className="text-xl">{NEXT_SESSION.date}</CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                        <Clock className="h-4 w-4" /> {NEXT_SESSION.time}
                                    </CardDescription>
                                </div>
                                <Button size="icon" variant="ghost" className="rounded-full">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                    <AvatarImage src={NEXT_SESSION.image} />
                                    <AvatarFallback>DA</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold">{NEXT_SESSION.doctor}</p>
                                    <p className="text-sm text-muted-foreground">{NEXT_SESSION.role}</p>
                                </div>
                                <Button className="gap-2">
                                    <Video className="h-4 w-4" />
                                    Entrar na Sala
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Sessões Realizadas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">12</div>
                                <p className="text-xs text-muted-foreground mt-1">+2 esse mês</p>
                                <Progress value={60} className="h-1.5 mt-3" />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Plano Atual</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">Premium</div>
                                <p className="text-xs text-muted-foreground mt-1">Renova em 01/01/2026</p>
                                <div className="mt-3 flex gap-2">
                                    <Badge variant="secondary">Ativo</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommended Specialists */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Especialistas Recomendados</h2>
                            <Link href="/busca" className="text-sm text-primary hover:underline flex items-center">
                                Ver todos <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {RECOMMENDED_PSYCHOLOGISTS.slice(0, 2).map((doctor) => (
                                <Card key={doctor.id} className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-4 flex gap-4">
                                        <Avatar className="h-12 w-12 rounded-lg">
                                            <AvatarImage src={doctor.image} />
                                            <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold truncate">{doctor.name}</h4>
                                            <p className="text-xs text-muted-foreground truncate">{doctor.title}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs font-medium">{doctor.rating}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-6">
                    {/* Mood Tracker */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-none">
                        <CardHeader>
                            <CardTitle className="text-base">Como você está hoje?</CardTitle>
                            <CardDescription>Registre seu humor para acompanhar sua evolução.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between px-2">
                                <button className="text-2xl hover:scale-125 transition-transform p-2">😢</button>
                                <button className="text-2xl hover:scale-125 transition-transform p-2">😕</button>
                                <button className="text-2xl hover:scale-125 transition-transform p-2">😐</button>
                                <button className="text-2xl hover:scale-125 transition-transform p-2">🙂</button>
                                <button className="text-2xl hover:scale-125 transition-transform p-2">😁</button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Support */}
                    <Card>
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Precisa de ajuda?</p>
                                <p className="text-xs text-muted-foreground">Fale com nosso suporte</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}
