"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart } from "lucide-react"
import { motion, Variants } from "framer-motion"

const fadeIn: Variants = {
    initial: { opacity: 0, scale: 0.95, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

export function CTA() {
    return (
        <section className="w-full py-20 md:py-32 relative overflow-hidden">
            {/* Background Image / Pattern */}
            <div className="absolute inset-0 bg-slate-900" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />

            {/* Glow effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10 mx-auto max-w-4xl">
                <motion.div
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={fadeIn}
                    className="flex flex-col items-center justify-center space-y-8 text-center bg-white/10 backdrop-blur-2xl border border-white/20 p-10 md:p-16 rounded-3xl shadow-2xl"
                >
                    <div className="h-16 w-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-2 mx-auto">
                        <Heart className="h-8 w-8 text-blue-300" />
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-white">
                            Pronto para dar o primeiro passo?
                        </h2>
                        <p className="mx-auto max-w-[600px] text-slate-300 text-lg md:text-xl leading-relaxed">
                            Cuidar da mente não precisa ser um luxo inatingível. Descubra uma terapia profunda, acessível e construída através da verdadeira empatia social.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                        <Button asChild size="lg" className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all group">
                            <Link href="/busca" className="flex items-center gap-2">
                                Encontrar Meu Psicólogo
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    <p className="text-slate-400 text-sm mt-6 font-medium">
                        É um profissional de psicologia? <Link href="/cadastro?role=psychologist" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-400/30 transition-colors">Junte-se ao nosso movimento solidário</Link>.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
