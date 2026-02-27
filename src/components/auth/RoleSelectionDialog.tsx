"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { User, Award, Building, ArrowRight } from "lucide-react"
import { motion, Variants } from "framer-motion"

interface RoleSelectionDialogProps {
    children?: React.ReactNode
    mode?: "register" | "login"
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const containerVars: Variants = {
    initial: { opacity: 0 },
    animate: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
}

const itemVars: Variants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
}

export function RoleSelectionDialog({
    children,
    mode = "register",
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange
}: RoleSelectionDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)

    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? controlledOnOpenChange : setInternalOpen

    // Ensure setOpen is defined
    const handleOpenChange = (newOpen: boolean) => {
        if (setOpen) {
            setOpen(newOpen)
        }
    }

    const getTitle = () => {
        return mode === "register"
            ? "Escolha o seu caminho"
            : "Bem-vindo de volta"
    }

    const getDescription = () => {
        return mode === "register"
            ? "Como você gostaria de utilizar nossa plataforma hoje?"
            : "Selecione o seu perfil para acessar sua conta:"
    }

    const getLink = (type: "paciente" | "profissional" | "empresa") => {
        const base = mode === "register" ? "/cadastro" : "/login"
        return `${base}/${type}`
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {children && (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[1024px] p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
                {/* Custom Modal Background */}
                <div className="absolute inset-0 bg-white/95 backdrop-blur-3xl" />

                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 p-8 md:p-12">
                    <DialogHeader className="mb-10 text-center space-y-3">
                        <DialogTitle className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                            {getTitle()}
                        </DialogTitle>
                        <DialogDescription className="text-lg text-slate-600 font-medium">
                            {getDescription()}
                        </DialogDescription>
                    </DialogHeader>

                    <motion.div
                        variants={containerVars}
                        initial="initial"
                        animate="animate"
                        className="grid gap-6 md:grid-cols-3"
                    >
                        <motion.div variants={itemVars}>
                            <Link href={getLink("paciente")} onClick={() => handleOpenChange(false)} className="block group h-full focus:outline-none">
                                <div className="h-full relative overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-500 hover:-translate-y-1 flex flex-col">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <div className="relative z-10 w-full h-44 overflow-hidden bg-slate-50 border-b border-slate-100 flex-shrink-0">
                                        <Image
                                            src="/role-paciente.png"
                                            alt="Paciente"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    </div>

                                    <div className="relative z-10 p-6 md:p-8 flex flex-col flex-grow">
                                        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors duration-500">
                                            <User className="h-6 w-6 text-blue-600" />
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">Para Mim</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                                            {mode === "register"
                                                ? "Quero encontrar um especialista acolhedor e iniciar minha jornada de cuidado."
                                                : "Acessar minha área, agendar sessões e ver meus conteúdos."
                                            }
                                        </p>

                                        <div className="flex items-center text-sm font-bold text-blue-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                            {mode === "register" ? "Criar conta" : "Entrar"}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>

                        <motion.div variants={itemVars}>
                            <Link href={getLink("profissional")} onClick={() => handleOpenChange(false)} className="block group h-full focus:outline-none">
                                <div className="h-full relative overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-500 hover:-translate-y-1 flex flex-col">
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <div className="relative z-10 w-full h-44 overflow-hidden bg-slate-50 border-b border-slate-100 flex-shrink-0">
                                        <Image
                                            src="/role-profissional.png"
                                            alt="Especialista"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    </div>

                                    <div className="relative z-10 p-6 md:p-8 flex flex-col flex-grow">
                                        <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors duration-500">
                                            <Award className="h-6 w-6 text-orange-600" />
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-700 transition-colors">Sou Especialista</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                                            {mode === "register"
                                                ? "Quero oferecer atendimento, fazer parte da rede e gerenciar minha carreira."
                                                : "Acessar minha agenda, pacientes e painel financeiro."
                                            }
                                        </p>

                                        <div className="flex items-center text-sm font-bold text-orange-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                            {mode === "register" ? "Criar conta" : "Entrar"}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>

                        <motion.div variants={itemVars}>
                            <Link href={getLink("empresa")} onClick={() => handleOpenChange(false)} className="block group h-full focus:outline-none">
                                <div className="h-full relative overflow-hidden rounded-3xl bg-white border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-500 hover:-translate-y-1 flex flex-col">
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <div className="relative z-10 w-full h-44 overflow-hidden bg-slate-50 border-b border-slate-100 flex-shrink-0">
                                        <Image
                                            src="/role-empresa.png"
                                            alt="Empresa"
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                        />
                                    </div>

                                    <div className="relative z-10 p-6 md:p-8 flex flex-col flex-grow">
                                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors duration-500">
                                            <Building className="h-6 w-6 text-emerald-600" />
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-700 transition-colors">Para Empresa</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
                                            {mode === "register"
                                                ? "Promover saúde emocional sustentável e cuidado corporativo de qualidade."
                                                : "Acessar painel de gestão corporativa e relatórios."
                                            }
                                        </p>

                                        <div className="flex items-center text-sm font-bold text-emerald-600 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                            {mode === "register" ? "Criar conta" : "Entrar"}
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
