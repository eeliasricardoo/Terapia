"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, ArrowRight, Users, Star, Clock } from "lucide-react"
import { motion, Variants } from "framer-motion"

const fadeIn: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

export function SearchHighlight() {
    return (
        <section className="w-full py-20 md:py-32 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[length:32px_32px] pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-7xl">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
                >
                    {/* Left side - Main CTA */}
                    <div className="space-y-8">
                        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                            <Search className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-700">Encontre a sua melhor versão</span>
                        </motion.div>

                        <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
                            O profissional certo
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">para o seu momento</span>
                        </motion.h2>

                        <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-600 max-w-xl leading-relaxed">
                            Sabemos que o primeiro passo é o mais importante. Nossa plataforma ajuda você a encontrar um psicólogo de forma leve, respeitando seu tempo e sua realidade.
                        </motion.p>

                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button asChild size="lg" className="group h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
                                <Link href="/busca" className="flex items-center gap-2">
                                    <Search className="h-5 w-5" />
                                    Quero conhecer
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>

                            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300">
                                <Link href="/cadastro">
                                    Começar Gratuitamente
                                </Link>
                            </Button>
                        </motion.div>
                    </div>

                    {/* Right side - Stats/Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 relative">
                        {/* Decorative glow behind cards */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-transparent blur-3xl -z-10 opacity-50 rounded-full" />
                        <motion.div variants={fadeIn} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-blue-100/50 text-blue-600">
                                    <Users className="h-7 w-7" />
                                </div>
                                <h3 className="font-extrabold text-3xl text-slate-900">500+</h3>
                            </div>
                            <p className="text-slate-600 font-medium">
                                Especialistas acolhedores e prontos para ouvir você sem julgamentos.
                            </p>
                        </motion.div>

                        <motion.div variants={fadeIn} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-amber-100/50 text-amber-600">
                                    <Star className="h-7 w-7" />
                                </div>
                                <h3 className="font-extrabold text-3xl text-slate-900">4.9/5</h3>
                            </div>
                            <p className="text-slate-600 font-medium">
                                Vidas transformadas diariamente através do cuidado verdadeiro e atento.
                            </p>
                        </motion.div>

                        <motion.div variants={fadeIn} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 sm:col-span-2">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                                <div className="p-3 rounded-xl bg-emerald-100/50 text-emerald-600 shrink-0">
                                    <Clock className="h-7 w-7" />
                                </div>
                                <h3 className="font-bold text-2xl text-slate-900">Terapia que se adapta a você</h3>
                            </div>
                            <p className="text-slate-600 font-medium text-lg">
                                Sessões online onde e quando quiser, no seu ritmo e no seu espaço. Cuidado 24/7 com máxima privacidade.
                            </p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
