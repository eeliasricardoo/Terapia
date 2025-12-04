import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Home, MessageSquare, Settings, LogOut, Search, Star, ChevronRight } from "lucide-react"
import Link from "next/link"

// Mock data for recommended psychologists
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
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar isLoggedIn={true} userRole="client" />

            <div className="flex-1 container py-8 flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full lg:w-64 flex-shrink-0 space-y-2">
                    <nav className="flex flex-col space-y-1">
                        <Button variant="secondary" className="justify-start w-full font-medium" asChild>
                            <Link href="/dashboard">
                                <Home className="mr-2 h-4 w-4" />
                                Visão Geral
                            </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start w-full font-medium text-muted-foreground hover:text-primary" asChild>
                            <Link href="/dashboard/sessoes">
                                <Calendar className="mr-2 h-4 w-4" />
                                Minhas Sessões
                            </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start w-full font-medium text-muted-foreground hover:text-primary" asChild>
                            <Link href="/dashboard/mensagens">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Mensagens
                            </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start w-full font-medium text-muted-foreground hover:text-primary" asChild>
                            <Link href="/busca">
                                <Search className="mr-2 h-4 w-4" />
                                Buscar Psicólogos
                            </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start w-full font-medium text-muted-foreground hover:text-primary" asChild>
                            <Link href="/perfil">
                                <User className="mr-2 h-4 w-4" />
                                Meu Perfil
                            </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start w-full font-medium text-muted-foreground hover:text-primary" asChild>
                            <Link href="/configuracoes">
                                <Settings className="mr-2 h-4 w-4" />
                                Configurações
                            </Link>
                        </Button>
                        <div className="pt-4 mt-4 border-t">
                            <Button variant="ghost" className="justify-start w-full text-red-500 hover:text-red-600 hover:bg-red-50">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sair
                            </Button>
                        </div>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 space-y-8">
                    {/* Welcome Section */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Olá, João 👋</h1>
                            <p className="text-muted-foreground">Bem-vindo de volta ao seu espaço de cuidado.</p>
                        </div>
                        <Button asChild>
                            <Link href="/busca">Agendar Nova Sessão</Link>
                        </Button>
                    </div>

                    {/* Next Session Card (Hero-ish) */}
                    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Próxima Sessão
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-bold">Quinta-feira, 12 de Dezembro</h3>
                                    <p className="text-muted-foreground flex items-center gap-2">
                                        <Clock className="h-4 w-4" /> 14:00 - 14:50
                                    </p>
                                </div>
                                <div className="flex items-center gap-4 bg-background/50 p-3 rounded-lg border">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src="/avatars/01.png" />
                                        <AvatarFallback>DA</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">Dra. Ana María</p>
                                        <p className="text-sm text-muted-foreground">Psicóloga Clínica</p>
                                    </div>
                                    <Button size="sm" variant="secondary" className="ml-auto">
                                        Entrar na Sala
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sessões Realizadas</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12</div>
                                <p className="text-xs text-muted-foreground">+2 esse mês</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Meu Plano</CardTitle>
                                <Badge variant="secondary">Premium</Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Ativo</div>
                                <p className="text-xs text-muted-foreground">Renova em 01/01</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Humor Hoje</CardTitle>
                                <div className="flex gap-1">
                                    <span className="text-xl cursor-pointer hover:scale-110 transition-transform">😊</span>
                                    <span className="text-xl cursor-pointer hover:scale-110 transition-transform">😐</span>
                                    <span className="text-xl cursor-pointer hover:scale-110 transition-transform">😔</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Bem</div>
                                <p className="text-xs text-muted-foreground">Registrado às 09:00</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommended Specialists */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">Recomendados para você</h2>
                            <Link href="/busca" className="text-sm text-primary hover:underline flex items-center">
                                Ver todos <ChevronRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {RECOMMENDED_PSYCHOLOGISTS.map((doctor) => (
                                <Card key={doctor.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                    <CardHeader className="p-0">
                                        <div className="aspect-video relative bg-muted flex items-center justify-center">
                                            <div className="text-4xl font-bold text-muted-foreground/20">
                                                {doctor.name.charAt(0)}
                                            </div>
                                            {/* <Image src={doctor.image} alt={doctor.name} fill className="object-cover" /> */}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold truncate">{doctor.name}</h3>
                                                <p className="text-sm text-muted-foreground">{doctor.title}</p>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm font-medium">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                {doctor.rating}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {doctor.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <Button variant="outline" className="w-full" asChild>
                                            <Link href={`/psicologo/${doctor.id}`}>Ver Perfil</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    )
}
