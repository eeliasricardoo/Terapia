"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, ArrowRight, Users, Star, Clock } from "lucide-react"

export function SearchHighlight() {
    return (
        <section className="w-full py-16 md:py-24 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    {/* Left side - Main CTA */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <Search className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">Encontre seu terapeuta ideal</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                            Buscar Psicólogo
                            <span className="block text-primary mt-2">Nunca foi tão fácil</span>
                        </h2>

                        <p className="text-lg text-muted-foreground max-w-xl">
                            Explore nossa rede de profissionais qualificados. Filtre por especialidade,
                            disponibilidade e abordagem terapêutica para encontrar o match perfeito.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button asChild size="lg" className="group">
                                <Link href="/busca" className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Buscar Agora
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>

                            <Button asChild variant="outline" size="lg">
                                <Link href="/cadastro">
                                    Criar Conta Grátis
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Right side - Stats/Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                        <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-2xl">500+</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Psicólogos certificados prontos para atender
                            </p>
                        </div>

                        <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Star className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-2xl">4.9/5</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Avaliação média dos nossos profissionais
                            </p>
                        </div>

                        <div className="bg-card border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow sm:col-span-2">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Clock className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-xl">Atendimento Flexível</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Encontre horários que se encaixam na sua rotina.
                                Sessões presenciais ou online disponíveis 24/7.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
