"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog"
import { motion } from "framer-motion"
import { Heart, Star, ShieldCheck } from "lucide-react"

export function Hero() {
    return (
        <section className="w-full pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 bg-white overflow-hidden relative">
            {/* Minimalist Background Light */}
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-gradient-to-tr from-blue-50 to-indigo-50/50 blur-[100px] rounded-full pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
                    {/* Text content */}
                    <div className="space-y-8 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600 text-xs font-semibold tracking-wide uppercase"
                        >
                            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500" />
                            Plataforma Integrada
                        </motion.div>

                        <div className="space-y-6">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                                className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl/tight text-slate-900"
                            >
                                Saúde mental, <br className="hidden lg:block" /> acessível para <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">todos.</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                                className="text-slate-500 md:text-lg leading-relaxed max-w-[500px] mx-auto lg:mx-0"
                            >
                                Conectamos quem precisa de cuidado a profissionais verificados. Psicólogos ganham visibilidade no ranking ao adotarem vagas de valor social.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                            className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start pt-4"
                        >
                            <Button asChild size="lg" className="h-12 px-8 text-base font-medium shadow-sm hover:shadow-md transition-all bg-slate-900 hover:bg-slate-800 text-white rounded-full">
                                <Link href="/busca">Encontrar Psicólogo</Link>
                            </Button>
                            <RoleSelectionDialog mode="register">
                                <Button variant="outline" size="lg" className="h-12 px-8 text-base font-medium border-slate-200 text-slate-700 hover:bg-slate-50 transition-all rounded-full">
                                    Sou Psicólogo
                                </Button>
                            </RoleSelectionDialog>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                            className="flex flex-wrap justify-center lg:justify-start items-center gap-x-6 gap-y-3 pt-6 text-sm text-slate-500 font-medium"
                        >
                            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-slate-400" /> Profissionais Verificados</div>
                            <div className="flex items-center gap-2"><Heart className="h-4 w-4 text-slate-400" /> Vagas de Voluntariado</div>
                        </motion.div>
                    </div>

                    {/* Image / Illustration content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="relative mx-auto w-full max-w-lg lg:max-w-none mt-8 lg:mt-0"
                    >
                        {/* Clean minimal container */}
                        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 bg-white p-2 w-full lg:w-[90%] lg:ml-auto">
                            <div className="relative rounded-[1.5rem] overflow-hidden aspect-[4/3] w-full bg-slate-50">
                                <Image
                                    src="/hero-illustration.png"
                                    alt="Ilustração Terapia Saúde Mental"
                                    fill
                                    className="object-cover transition-transform duration-1000 ease-out hover:scale-105"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Minimal floating badge 1 */}
                        <motion.div
                            animate={{ y: [-4, 4, -4] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="absolute left-0 lg:-left-4 top-12 bg-white/95 backdrop-blur-sm border border-slate-100 shadow-xl shadow-slate-200/60 rounded-2xl p-4 flex items-center gap-4"
                        >
                            <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Star className="h-4 w-4 fill-blue-600" />
                            </div>
                            <div className="hidden sm:block pr-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Destaque</p>
                                <p className="font-semibold text-slate-800 text-sm leading-none">Sistema de Ranking</p>
                            </div>
                        </motion.div>

                        {/* Minimal floating badge 2 */}
                        <motion.div
                            animate={{ y: [4, -4, 4] }}
                            transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
                            className="absolute right-0 bottom-16 bg-white/95 backdrop-blur-sm border border-slate-100 shadow-xl shadow-slate-200/60 rounded-2xl p-4 flex items-center gap-4"
                        >
                            <div className="h-10 w-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                                <Heart className="h-4 w-4 fill-rose-500" />
                            </div>
                            <div className="hidden sm:block pr-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Impacto</p>
                                <p className="font-semibold text-slate-800 text-sm leading-none">Acolhimento Social</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Smooth transition gradient to next section */}
            <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
        </section>
    )
}
