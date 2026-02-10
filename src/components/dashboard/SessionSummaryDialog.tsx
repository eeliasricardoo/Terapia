"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, User, FileText, CheckCircle2 } from "lucide-react"

interface SessionSummaryDialogProps {
    session: {
        id: number
        doctor: string
        date: string
    }
    children: React.ReactNode
}

export function SessionSummaryDialog({ session, children }: SessionSummaryDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Resumo da Sessão</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Session Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{session.doctor}</p>
                                <p className="text-sm text-muted-foreground">Psicólogo Clínico</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Concluída
                        </Badge>
                    </div>

                    <Separator />

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Data:</span>
                            <span className="font-medium">{session.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Duração:</span>
                            <span className="font-medium">50 minutos</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Session Notes */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-lg">Anotações da Sessão</h3>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                            <p className="text-sm text-slate-700 leading-relaxed">
                                Sessão focada em técnicas de gerenciamento de ansiedade. Discutimos estratégias
                                de respiração e mindfulness para momentos de estresse.
                            </p>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                Paciente demonstrou progresso significativo em relação às sessões anteriores,
                                relatando melhor controle emocional nas situações do dia a dia.
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* Homework/Next Steps */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <h3 className="font-semibold text-lg">Tarefas para Casa</h3>
                        </div>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2 text-sm">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span className="text-slate-700">Praticar exercícios de respiração diafragmática por 5 minutos, 2x ao dia</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span className="text-slate-700">Manter o diário emocional atualizado diariamente</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <span className="text-green-600 mt-0.5">•</span>
                                <span className="text-slate-700">Identificar e anotar gatilhos de ansiedade durante a semana</span>
                            </li>
                        </ul>
                    </div>

                    {/* Footer Note */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-blue-800">
                            💡 <strong>Lembrete:</strong> Estas anotações são confidenciais e fazem parte do seu histórico terapêutico.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
