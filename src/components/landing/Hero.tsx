"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog"
import { motion } from "framer-motion"
import { Heart, Star, ShieldCheck } from "lucide-react"

export function Hero() {
    return (
        <section className="w-full pt-20 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 bg-slate-50 overflow-hidden relative">
            {/* Animated Background effects */}
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, 50, 0],
                    y: [0, -50, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] opacity-30 bg-gradient-to-tr from-blue-300 to-purple-300 blur-[120px] rounded-full mix-blend-multiply pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, -30, 0],
                    y: [0, 40, 0]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] opacity-30 bg-gradient-to-tr from-sky-300 to-emerald-200 blur-[120px] rounded-full mix-blend-multiply pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-300 blur-[100px] rounded-full mix-blend-multiply pointer-events-none"
            />

            <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    {/* Text content */}
                    <div className="space-y-8 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 border border-blue-200 text-blue-800 text-sm font-medium mb-2"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                            Terapia Acessível & Solidária
                        </motion.div>

                        <div className="space-y-4">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                                className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl/tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900"
                            >
                                Encontre seu equilíbrio.<br /> Transforme vidas.
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                                className="text-slate-600 md:text-xl font-light leading-relaxed max-w-[600px] mx-auto lg:mx-0"
                            >
                                Um espaço seguro para cuidar de si com terapeutas acolhedores. <span className="font-medium text-slate-800">Para profissionais:</span> faça parte de uma rede solidária, ofereça valor social e ganhe destaque.
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                            className="flex flex-col sm:flex-row gap-4 w-full justify-center lg:justify-start pt-4"
                        >
                            <Button asChild size="lg" className="h-14 px-8 text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all hover:-translate-y-1 bg-blue-600 hover:bg-blue-700">
                                <Link href="/busca">Quero fazer terapia</Link>
                            </Button>
                            <RoleSelectionDialog mode="register">
                                <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-2 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all hover:-translate-y-1 bg-white/50 backdrop-blur-sm">
                                    Sou Psicólogo(a)
                                </Button>
                            </RoleSelectionDialog>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                            className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-sm text-slate-500 font-medium"
                        >
                            <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Profissionais Verificados</div>
                            <div className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-rose-400" /> Ação Voluntária</div>
                        </motion.div>
                    </div>

                    {/* Image / Illustration content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                        className="relative mx-auto w-full max-w-lg lg:max-w-none mt-8 lg:mt-0"
                    >
                        {/* Decorative glass container with breathing animation */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative rounded-3xl shadow-[0_20px_50px_-12px_rgba(30,58,138,0.2)] border border-white/60 bg-white/40 backdrop-blur-md p-4"
                        >
                            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] w-full bg-slate-100/50">
                                <Image
                                    src="/hero-illustration.png"
                                    alt="Ilustração Terapia Saúde Mental"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
                                    priority
                                />
                            </div>

                            {/* Floating glassmorphism badge 1 */}
                            <motion.div
                                animate={{ y: [-8, 8, -8], rotate: [-2, 2, -2] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                                className="absolute -left-6 top-12 bg-white/80 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-4 flex items-center gap-4 animate-in fade-in zoom-in duration-500 delay-700"
                            >
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Star className="h-5 w-5 fill-blue-600" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Top Terapeutas</p>
                                    <p className="font-bold text-slate-900 text-sm">Cuidado com Excelência</p>
                                </div>
                            </motion.div>

                            {/* Floating glassmorphism badge 2 */}
                            <motion.div
                                animate={{ y: [8, -8, 8], rotate: [2, -2, 2] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                                className="absolute -right-6 bottom-16 bg-white/80 backdrop-blur-md border border-white/50 shadow-xl rounded-2xl p-4 flex items-center gap-4 animate-in fade-in zoom-in duration-500 delay-1000"
                            >
                                <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                                    <Heart className="h-5 w-5 fill-rose-500" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Atendimento Social</p>
                                    <p className="font-bold text-slate-900 text-sm">Terapia ao seu alcance</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
