"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Star, ArrowLeft, ListFilter } from "lucide-react"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/components/providers/auth-provider"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SearchPage() {
    const { isAuthenticated } = useAuth()
    const [psychologists, setPsychologists] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function loadPsychologists() {
            try {
                const { getPsychologists } = await import("@/lib/actions/psychologists")
                const data = await getPsychologists()
                setPsychologists(data)
            } catch (error) {
                console.error("Error loading psychologists:", error)
            } finally {
                setLoading(false)
            }
        }
        loadPsychologists()
    }, [])

    const handleBack = () => {
        if (isAuthenticated) {
            router.push('/dashboard')
        } else {
            router.push('/')
        }
    }

    // Layout dedicado sem sidebar - mais espaço para filtros e resultados
    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Header com botão de voltar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            className="flex items-center gap-2 hover:bg-slate-100"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Voltar</span>
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                                Buscar Psicólogos
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-6">
                <SearchContent psychologists={psychologists} loading={loading} />
            </main>

            <Footer />
        </div>
    )
}

function SearchContent({ psychologists, loading }: { psychologists: any[], loading: boolean }) {
    return (
        <div className="space-y-6">
            {/* Search Bar - Mais proeminente */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            Encontre seu psicólogo ideal
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Conecte-se com profissionais qualificados para te apoiar em sua jornada de bem-estar.
                        </p>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Busque por nome, especialidade ou tema..."
                            className="pl-12 h-12 shadow-sm w-full rounded-full border-slate-300 focus:border-blue-500 hover:border-blue-400 transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Mobile Filters Trigger */}
                <div className="lg:hidden flex justify-between items-center">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filtros
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>Filtros</SheetTitle>
                                <SheetDescription>
                                    Refine sua busca para encontrar o profissional ideal.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-6">
                                <SearchFilters />
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Select defaultValue="relevance">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Ordenar por" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="relevance">Relevância</SelectItem>
                            <SelectItem value="price_asc">Menor Preço</SelectItem>
                            <SelectItem value="price_desc">Maior Preço</SelectItem>
                            <SelectItem value="rating">Avaliação</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Desktop Filters Sidebar - Mais largo */}
                <aside className="hidden lg:block w-80 flex-shrink-0">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <ListFilter className="w-5 h-5 text-slate-500" />
                                Filtros
                            </h3>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3">
                                Limpar
                            </Button>
                        </div>
                        <SearchFilters />
                    </div>
                </aside>

                {/* Results Grid - Mais espaçoso */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-sm text-slate-600">
                            Mostrando <span className="font-semibold text-slate-900">{psychologists.length}</span> profissionais disponíveis
                        </p>
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Ordenar por:</span>
                            <Select defaultValue="relevance">
                                <SelectTrigger className="w-[160px] h-9 text-sm">
                                    <SelectValue placeholder="Relevância" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="relevance">Relevância</SelectItem>
                                    <SelectItem value="price_asc">Menor Preço</SelectItem>
                                    <SelectItem value="price_desc">Maior Preço</SelectItem>
                                    <SelectItem value="rating">Avaliação</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">Carregando psicólogos...</p>
                        </div>
                    ) : psychologists.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">Nenhum profissional encontrado</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                Tente ajustar seus filtros ou buscar por outros termos.
                            </p>
                            <Button className="mt-6" variant="outline">
                                Limpar filtros
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
                            {psychologists.map((psychologist) => (
                                <PsychologistCard key={psychologist.id} psychologist={psychologist} />
                            ))}
                        </div>
                    )}

                    {/* Pagination (Visual only for now) */}
                    {psychologists.length > 0 && (
                        <div className="mt-10 flex justify-center">
                            <Button variant="outline" className="w-full sm:w-auto">
                                Carregar mais profissionais
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}


function SearchFilters() {
    return (
        <div className="space-y-5">
            <div className="space-y-2.5">
                <h4 className="text-sm font-medium leading-none text-slate-900">Especialidades</h4>
                <div className="grid grid-cols-1 gap-2">
                    {["Ansiedade", "Depressão", "Terapia de Casal", "TDAH", "Autoestima", "Carreira"].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`filter-${item}`} />
                            <label
                                htmlFor={`filter-${item}`}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-600 hover:text-slate-900"
                            >
                                {item}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium leading-none text-slate-900">Preço por sessão</h4>
                    <span className="text-xs text-muted-foreground">R$ 50 - R$ 300+</span>
                </div>
                <Slider defaultValue={[300]} max={500} step={10} className="py-3" />
            </div>

            <Separator />

            <div className="space-y-2.5">
                <h4 className="text-sm font-medium leading-none text-slate-900">Disponibilidade</h4>
                <div className="grid grid-cols-1 gap-2">
                    {["Hoje", "Esta semana", "Próxima semana"].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`filter-${item}`} />
                            <label
                                htmlFor={`filter-${item}`}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-600 hover:text-slate-900"
                            >
                                {item}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            <div className="space-y-2.5">
                <h4 className="text-sm font-medium leading-none text-slate-900">Gênero</h4>
                <div className="grid grid-cols-1 gap-2">
                    {["Feminino", "Masculino", "Outro"].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                            <Checkbox id={`filter-${item}`} />
                            <label
                                htmlFor={`filter-${item}`}
                                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-600 hover:text-slate-900"
                            >
                                {item}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function PsychologistCard({ psychologist }: { psychologist: any }) {
    const profile = psychologist.profile
    const displayName = profile?.full_name || 'Psicólogo'
    const specialties = psychologist.specialties || []
    const price = psychologist.price_per_session ? Number(psychologist.price_per_session) : 0
    const crp = psychologist.crp || 'Não informado'
    const bio = psychologist.bio || "Olá! Sou especialista em saúde mental e estou aqui para ajudar você a alcançar seus objetivos e bem-estar..."

    return (
        <Card className="overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 border-slate-200 group flex flex-col bg-white h-full">
            <CardContent className="p-0 flex flex-col flex-1">
                <div className="p-6 flex flex-col flex-1">
                    <div className="flex gap-4">
                        <div className="relative flex-shrink-0">
                            <Avatar className="h-20 w-20 border-2 border-white shadow-sm ring-1 ring-slate-100">
                                <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                                <AvatarFallback className="bg-blue-50 text-blue-600 text-xl font-medium">
                                    {displayName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                        {displayName}
                                    </h3>
                                    <p className="text-xs text-slate-500 mb-1 font-medium">CRP: {crp}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded text-xs font-bold text-yellow-700 flex-shrink-0">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span>5.0</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {specialties.slice(0, 3).map((specialty: string) => (
                                    <Badge key={specialty} variant="secondary" className="font-normal text-[10px] px-2 bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border-slate-200">
                                        {specialty}
                                    </Badge>
                                ))}
                                {specialties.length > 3 && (
                                    <span className="text-[10px] text-slate-400 flex items-center px-1 font-medium">
                                        +{specialties.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex-1">
                        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {bio}
                        </p>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-0 border-t border-slate-100 bg-slate-50/30 grid grid-cols-2 divide-x divide-slate-100 mt-auto">
                <div className="p-3 flex flex-col items-center justify-center hover:bg-white transition-colors">
                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Sessão</span>
                    <span className="font-bold text-slate-900 text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                    </span>
                </div>
                <Link
                    href={`/psicologo/${psychologist.userId}`}
                    className="p-3 bg-white hover:bg-blue-600 hover:text-white text-blue-600 flex items-center justify-center gap-2 transition-all font-semibold text-sm group-hover/btn"
                >
                    Ver perfil
                </Link>
            </CardFooter>
        </Card>
    )
}

