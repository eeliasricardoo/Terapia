"use client"

import Link from "next/link"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Award, Building } from "lucide-react"

interface RoleSelectionDialogProps {
    children?: React.ReactNode
    mode?: "register" | "login"
    open?: boolean
    onOpenChange?: (open: boolean) => void
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
            ? "Como você quer criar a sua conta?"
            : "Como você deseja entrar?"
    }

    const getDescription = () => {
        return mode === "register"
            ? "Selecione a opção que deseja criar a sua conta:"
            : "Selecione o seu perfil para fazer login:"
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
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">{getTitle()}</DialogTitle>
                    <DialogDescription className="text-center">
                        {getDescription()}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 md:grid-cols-3 pt-4">
                    <Link href={getLink("paciente")} className="block" onClick={() => handleOpenChange(false)}>
                        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-2 hover:border-primary/50">
                            <CardHeader>
                                <User className="h-10 w-10 mb-2 text-primary" />
                                <CardTitle>Cliente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    {mode === "register"
                                        ? "Quero fazer sessões de terapias e ver conteúdos sobre saúde emocional"
                                        : "Acessar minha área de paciente para agendar e gerenciar sessões"
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={getLink("profissional")} className="block" onClick={() => handleOpenChange(false)}>
                        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-2 hover:border-primary/50">
                            <CardHeader>
                                <Award className="h-10 w-10 mb-2 text-primary" />
                                <CardTitle>Especialista</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    {mode === "register"
                                        ? "Quero atender pacientes online e fazer gestão da minha carreira"
                                        : "Acessar minha agenda, pacientes e gestão financeira"
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href={getLink("empresa")} className="block" onClick={() => handleOpenChange(false)}>
                        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-2 hover:border-primary/50">
                            <CardHeader>
                                <Building className="h-10 w-10 mb-2 text-primary" />
                                <CardTitle>Empresa</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    {mode === "register"
                                        ? "Quero promover bem-estar emocional aos meus colaboradores"
                                        : "Acessar painel de gestão de benefícios e relatórios"
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    )
}
