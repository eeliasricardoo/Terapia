"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog"
import { motion } from "framer-motion"

export function Hero() {

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background overflow-hidden relative">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white opacity-70"></div>
            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center space-y-8 text-center">
                    <div className="space-y-4 max-w-3xl">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 pb-2"
                        >
                            Saúde Mental para Todos
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                            className="mx-auto max-w-[700px] text-slate-600 md:text-xl font-light leading-relaxed"
                        >
                            A plataforma completa para pacientes, psicólogos e empresas.
                            Encontre o profissional ideal ou gerencie sua carreira com tecnologia de ponta.
                        </motion.p>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                        className="flex flex-col sm:flex-row gap-4 w-full justify-center"
                    >
                        <Button asChild size="lg" className="h-12 px-8 text-lg shadow-lg shadow-blue-900/20 hover:shadow-blue-900/30 transition-all hover:-translate-y-1">
                            <Link href="/busca">Encontrar Psicólogo</Link>
                        </Button>
                        <RoleSelectionDialog mode="register">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-lg border-slate-200 hover:bg-slate-50 transition-all hover:-translate-y-1">
                                Criar Conta
                            </Button>
                        </RoleSelectionDialog>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
