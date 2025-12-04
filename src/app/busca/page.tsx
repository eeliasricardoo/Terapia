import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

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
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />

            <main className="flex-1 container py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Encontre seu psicólogo ideal</h1>
                    <p className="text-muted-foreground">Busque e filtre entre centenas de profissionais para encontrar o indicado para ti.</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 space-y-8">
                        <div className="space-y-4">
                            <div className="relative">
                                <Input placeholder="Buscar por nome..." className="pl-4" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold">Especialidades</h3>
                            <div className="space-y-2">
                                {["Ansiedade", "Depressão", "Terapia de Casal", "TDAH"].map((item) => (
                                    <div key={item} className="flex items-center space-x-2">
                                        <Checkbox id={item} />
                                        <label htmlFor={item} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {item}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold">Idioma</h3>
                            <div className="space-y-2">
                                {["Português", "Espanhol", "Inglês"].map((item) => (
                                    <div key={item} className="flex items-center space-x-2">
                                        <Checkbox id={item} />
                                        <label htmlFor={item} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {item}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold">Preço</h3>
                            <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>R$ 50</span>
                                <span>R$ 300+</span>
                            </div>
                        </div>

                        <Button className="w-full">Aplicar Filtros</Button>
                        <Button variant="outline" className="w-full">Limpar</Button>
                    </aside>

                    {/* Results Grid */}
                    <div className="flex-1">
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Mostrando 6 de 150 psicólogos</p>
                            <div className="flex gap-2">
                                <Badge variant="secondary" className="cursor-pointer">Ansiedade &times;</Badge>
                                <Badge variant="secondary" className="cursor-pointer">Português &times;</Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {PSYCHOLOGISTS.map((doctor) => (
                                <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                                    <CardHeader className="p-0">
                                        <div className="aspect-square relative bg-muted">
                                            {/* Placeholder for image */}
                                            <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-muted-foreground/20">
                                                {doctor.name.charAt(0)}
                                            </div>
                                            {/* <Image src={doctor.image} alt={doctor.name} fill className="object-cover" /> */}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6 text-center">
                                        <h3 className="font-bold text-lg mb-1">{doctor.name}</h3>
                                        <p className="text-sm text-muted-foreground mb-3">{doctor.title}</p>

                                        <div className="flex items-center justify-center gap-1 mb-4">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="font-medium">{doctor.rating}</span>
                                            <span className="text-muted-foreground text-sm">({doctor.reviews})</span>
                                        </div>

                                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                                            {doctor.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="font-normal">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-6 pt-0">
                                        <Button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-none shadow-none">
                                            Ver Perfil
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-12 flex justify-center gap-2">
                            <Button variant="outline" size="icon" disabled>&lt;</Button>
                            <Button variant="default" size="icon">1</Button>
                            <Button variant="outline" size="icon">2</Button>
                            <Button variant="outline" size="icon">3</Button>
                            <span className="flex items-center px-2">...</span>
                            <Button variant="outline" size="icon">12</Button>
                            <Button variant="outline" size="icon">&gt;</Button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
