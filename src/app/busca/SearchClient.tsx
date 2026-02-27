"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Star, ListFilter, ChevronRight, MapPin, Video } from "lucide-react"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"
import { motion, Variants } from "framer-motion"
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
import { getPsychologists } from "@/lib/actions/psychologists"

export default function SearchClient({ initialPsychologists }: { initialPsychologists: any[] }) {
    const { isAuthenticated } = useAuth()
    const [psychologists, setPsychologists] = useState<any[]>(initialPsychologists)

    return (
        <SearchContent psychologists={psychologists} loading={false} />
    )
}

const containerVars: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
}

const itemVars: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
}

function SearchContent({ psychologists, loading }: { psychologists: any[], loading: boolean }) {
    return (
        <motion.div
            variants={containerVars}
            initial="initial"
            animate="animate"
            className="space-y-8"
        >
            {/* Search Bar - Premium Hero Style */}
            <motion.div variants={itemVars} className="relative overflow-hidden bg-white p-8 md:p-10 rounded-3xl border border-slate-200/60 shadow-xl shadow-blue-900/5">
                {/* Decorative Backgrounds */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-blue-50/80 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-orange-50/80 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-6 max-w-3xl mx-auto text-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
                            Encontre seu psicólogo ideal
                        </h2>
                        <p className="text-lg text-slate-600 font-medium">
                            Conecte-se com profissionais qualificados para te apoiar em sua jornada de autoconhecimento e bem-estar.
                        </p>
                    </div>

                    <div className="relative max-w-2xl mx-auto group">
                        <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-md group-hover:bg-blue-500/10 transition-colors duration-500" />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 group-hover:text-blue-500 transition-colors duration-300 z-10" />
                        <Input
                            placeholder="Busque por nome, especialidade ou abordagem..."
                            className="pl-16 pr-6 h-16 text-lg shadow-sm w-full rounded-full border-2 border-slate-200 focus:border-blue-500 hover:border-slate-300 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 relative z-0 bg-white/80 backdrop-blur-sm"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Content Section */}
            <div className="flex flex-col lg:flex-row gap-8">
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
                <motion.aside variants={itemVars} className="hidden lg:block w-80 flex-shrink-0">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 sticky top-24">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <h3 className="font-extrabold text-lg flex items-center gap-2 text-slate-900">
                                <ListFilter className="w-5 h-5 text-blue-600" />
                                Filtros
                            </h3>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 rounded-full transition-colors">
                                Limpar tudo
                            </Button>
                        </div>
                        <SearchFilters />
                    </div>
                </motion.aside>

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
                        <motion.div variants={itemVars} className="text-center py-20">
                            <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Buscando os melhores profissionais...</p>
                        </motion.div>
                    ) : psychologists.length === 0 ? (
                        <motion.div variants={itemVars} className="text-center py-20 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
                            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-10 w-10 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Nenhum profissional encontrado</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mt-2">
                                Tente ajustar seus filtros ou buscar por outros termos para encontrar o que precisa.
                            </p>
                            <Button className="mt-6 rounded-full px-8" variant="outline">
                                Limpar filtros
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={containerVars}
                            className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6"
                        >
                            {psychologists.map((psychologist) => (
                                <motion.div key={psychologist.id} variants={itemVars} className="h-full">
                                    <PsychologistCard psychologist={psychologist} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Pagination */}
                    {psychologists.length > 0 && (
                        <motion.div variants={itemVars} className="mt-12 flex justify-center">
                            <Button variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 font-medium">
                                Carregar mais profissionais
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}


function SearchFilters() {
    return (
        <div className="space-y-5">
            <div className="space-y-2.5">
                <h4 className="text-sm font-medium leading-none text-slate-900">Especialidades</h4>
                <div className="grid grid-cols-1 gap-2">
                    {[
                        "Ansiedade",
                        "Depressão",
                        "Terapia de Casal",
                        "TDAH",
                        "Autoestima",
                        "Carreira",
                        "Burnout",
                        "Luto",
                        "Transtornos Alimentares",
                        "TOC",
                        "Fobias",
                        "Estresse Pós-Traumático"
                    ].map((item) => (
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
                <h4 className="text-sm font-medium leading-none text-slate-900">Abordagem Terapêutica</h4>
                <div className="grid grid-cols-1 gap-2">
                    {[
                        "Cognitivo-Comportamental (TCC)",
                        "Psicanálise",
                        "Humanista",
                        "Gestalt-terapia",
                        "Sistêmica",
                        "Psicodrama"
                    ].map((item) => (
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
                    {["Hoje", "Esta semana", "Próxima semana", "Finais de semana", "Horário noturno"].map((item) => (
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
                <h4 className="text-sm font-medium leading-none text-slate-900">Idiomas</h4>
                <div className="grid grid-cols-1 gap-2">
                    {["Português", "Inglês", "Espanhol", "Francês", "Italiano", "Libras"].map((item) => (
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
                <h4 className="text-sm font-medium leading-none text-slate-900">Experiência</h4>
                <div className="grid grid-cols-1 gap-2">
                    {["Menos de 2 anos", "2-5 anos", "5-10 anos", "Mais de 10 anos"].map((item) => (
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
                    {["Feminino", "Masculino", "Não-binário", "Sem preferência"].map((item) => (
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
                <h4 className="text-sm font-medium leading-none text-slate-900">Formato de Atendimento</h4>
                <div className="grid grid-cols-1 gap-2">
                    {["Online", "Presencial", "Híbrido"].map((item) => (
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
                <h4 className="text-sm font-medium leading-none text-slate-900">Público-Alvo</h4>
                <div className="grid grid-cols-1 gap-2">
                    {["Crianças", "Adolescentes", "Adultos", "Idosos", "Casais", "Famílias"].map((item) => (
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
    const bio = psychologist.bio || "Olá! Sou especialista em saúde mental e estou aqui para ajudar você a alcançar seus objetivos e bem-estar. Meu consultório é um espaço seguro e acolhedor."

    return (
        <Card className="overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 hover:border-blue-200/60 transition-all duration-500 border-slate-200/60 rounded-3xl group flex flex-col bg-white h-full relative hover:-translate-y-1">
            {/* Soft gradient hover effect on borders */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <CardContent className="p-0 flex flex-col flex-1 relative z-10">
                <div className="p-6 md:p-8 flex flex-col flex-1">
                    <div className="flex gap-5 mb-5">
                        <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-blue-100 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity duration-500" />
                            <Avatar className="h-24 w-24 border-[3px] border-white shadow-md ring-1 ring-slate-100/50 relative z-10 group-hover:scale-105 transition-transform duration-500">
                                <AvatarImage src={profile?.avatar_url || undefined} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 text-2xl font-bold">
                                    {displayName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-[3px] border-white rounded-full z-20 shadow-sm"></span>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex justify-between items-start gap-2 mb-1">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-extrabold text-xl text-slate-900 truncate group-hover:text-blue-700 transition-colors duration-300">
                                        {displayName}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium tracking-wide">CRP {crp}</p>
                                </div>
                                <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold text-amber-700 shadow-sm">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span>5.0</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                                <div className="flex items-center gap-1">
                                    <Video className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Online</span>
                                </div>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="truncate max-w-[100px]">São Paulo, SP</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-5">
                        {specialties.slice(0, 3).map((specialty: string) => (
                            <Badge key={specialty} variant="secondary" className="font-medium text-[11px] px-2.5 py-0.5 bg-slate-100/80 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors border border-slate-200/60 rounded-full">
                                {specialty}
                            </Badge>
                        ))}
                        {specialties.length > 3 && (
                            <span className="text-[11px] text-slate-500 flex items-center px-1 font-semibold">
                                +{specialties.length - 3} mais
                            </span>
                        )}
                    </div>

                    <div className="flex-1">
                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                            {bio}
                        </p>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-5 md:px-8 md:py-6 border-t border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between relative z-10 mt-auto">
                <div className="flex flex-col justify-center">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Sessão (50 min)</span>
                    <span className="font-extrabold text-slate-900 text-xl leading-none">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
                    </span>
                </div>

                <Link
                    href={`/psicologo/${psychologist.userId}`}
                    className="flex items-center justify-center gap-2 bg-blue-600/10 hover:bg-blue-600 text-blue-700 hover:text-white transition-all duration-300 font-bold text-sm h-11 px-6 rounded-full group-hover:shadow-md group-hover:shadow-blue-500/20 active:scale-95"
                >
                    Ver Perfil
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </CardFooter>
        </Card>
    )
}

