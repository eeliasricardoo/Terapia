import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import Link from "next/link"

// Mock data for psychologists
const PSYCHOLOGISTS = [
    {
        id: 1,
        name: "Dra. Ana María Rojas",
        title: "Psicóloga Clínica",
        rating: 4.9,
        reviews: 123,
        tags: ["Ansiedade", "TCC"],
        image: "/avatars/01.png",
        price: 150
    },
    {
        id: 2,
        name: "Dr. Carlos Fuentes",
        title: "Terapia de Casal",
        rating: 4.8,
        reviews: 98,
        tags: ["Relacionamentos", "Comunicação"],
        image: "/avatars/02.png",
        price: 180
    },
    {
        id: 3,
        name: "Dra. Sofia Vergara",
        title: "Psicóloga Infantil",
        rating: 5.0,
        reviews: 76,
        tags: ["Crianças", "Família"],
        image: "/avatars/03.png",
        price: 160
    },
    {
        id: 4,
        name: "Dra. Isabella Gómez",
        title: "Psicóloga Clínica",
        rating: 4.9,
        reviews: 110,
        tags: ["Depressão", "Mindfulness"],
        image: "/avatars/04.png",
        price: 140
    },
    {
        id: 5,
        name: "Dr. Juan David Pérez",
        title: "Terapia Humanista",
        rating: 4.7,
        reviews: 85,
        tags: ["Autoestima", "Crescimento"],
        image: "/avatars/05.png",
        price: 170
    },
    {
        id: 6,
        name: "Dra. Valentina Ortiz",
        title: "Neuropsicologia",
        rating: 4.9,
        reviews: 150,
        tags: ["Avaliação", "TDAH"],
        image: "/avatars/06.png",
        price: 200
    },
]

export default function SearchPage() {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            <Navbar isLoggedIn={true} userRole="client" />

            <div className="flex-1 container py-8 flex flex-col lg:flex-row gap-8">
                {/* Dashboard Sidebar for Patient Context */}
                <div className="hidden lg:block">
                    <DashboardSidebar />
                </div>

                <main className="flex-1">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Encontre seu psicólogo ideal</h1>
                        <p className="text-muted-foreground">Busque e filtre entre centenas de profissionais para encontrar o indicado para ti.</p>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-8">
                        {/* Search Filters */}
                        <aside className="w-full xl:w-64 space-y-8 flex-shrink-0">
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Filtros</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Buscar por nome..." className="pl-9" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">Especialidades</h3>
                                <div className="space-y-3">
                                    {["Ansiedade", "Depressão", "Terapia de Casal", "TDAH", "Autoestima", "Carreira"].map((item) => (
                                        <div key={item} className="flex items-center space-x-2">
                                            <Checkbox id={item} />
                                            <label htmlFor={item} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                                                {item}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">Idioma</h3>
                                <div className="space-y-3">
                                    {["Português", "Espanhol", "Inglês"].map((item) => (
                                        <div key={item} className="flex items-center space-x-2">
                                            <Checkbox id={item} />
                                            <label htmlFor={item} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                                                {item}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold">Gênero</h3>
                                <div className="space-y-3">
                                    {["Feminino", "Masculino", "Outro"].map((item) => (
                                        <div key={item} className="flex items-center space-x-2">
                                            <Checkbox id={item} />
                                            <label htmlFor={item} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                                                {item}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold">Preço</h3>
                                    <span className="text-xs text-muted-foreground">R$ 50 - R$ 300+</span>
                                </div>
                                <Slider defaultValue={[50]} max={300} step={10} className="w-full" />
                            </div>

                            <div className="space-y-2 pt-4">
                                <Button className="w-full">Aplicar Filtros</Button>
                                <Button variant="outline" className="w-full">Limpar</Button>
                            </div>
                        </aside>

                        {/* Results Grid */}
                        <div className="flex-1">
                            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <p className="text-sm text-muted-foreground">Mostrando 6 de 150 psicólogos</p>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-secondary/80 transition-colors text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100">
                                        Ansiedade &times;
                                    </Badge>
                                    <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-secondary/80 transition-colors text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-100">
                                        Português &times;
                                    </Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {PSYCHOLOGISTS.map((doctor) => (
                                    <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200">
                                        <CardContent className="p-6 flex flex-col items-center text-center">
                                            <div className="mb-4 relative">
                                                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                                                    <AvatarImage src={doctor.image} />
                                                    <AvatarFallback className="text-2xl bg-slate-100 text-slate-400">
                                                        {doctor.name.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>

                                            <h3 className="font-bold text-lg mb-1 text-slate-900">{doctor.name}</h3>
                                            <p className="text-sm text-muted-foreground mb-3">{doctor.title}</p>

                                            <div className="flex items-center justify-center gap-1 mb-4 bg-yellow-50 px-3 py-1 rounded-full">
                                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                                <span className="font-bold text-sm text-slate-700">{doctor.rating}</span>
                                                <span className="text-muted-foreground text-xs">({doctor.reviews})</span>
                                            </div>

                                            <div className="flex flex-wrap justify-center gap-2 mb-6">
                                                {doctor.tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="font-normal text-xs bg-slate-100 text-slate-600 hover:bg-slate-200">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>

                                            <Button asChild className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-none shadow-none font-semibold h-10">
                                                <Link href={`/psicologo/${doctor.id}`}>
                                                    Ver Perfil
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            <div className="mt-12 flex justify-center items-center gap-2">
                                <Button variant="ghost" size="icon" disabled className="text-muted-foreground">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="default" size="icon" className="h-9 w-9">1</Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9">2</Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9">3</Button>
                                <span className="text-muted-foreground px-2">...</span>
                                <Button variant="ghost" size="icon" className="h-9 w-9">12</Button>
                                <Button variant="ghost" size="icon" className="text-muted-foreground">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    )
}
