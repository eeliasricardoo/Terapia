"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Loader2, CalendarX } from "lucide-react"
import { getPatientSessionHistory, type SessionHistoryItem } from "@/lib/actions/patients"

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    SCHEDULED: { label: 'Agendada', className: 'bg-blue-50 text-blue-700' },
    COMPLETED: { label: 'Confirmada', className: 'bg-emerald-50 text-emerald-700' },
    CANCELED: { label: 'Cancelada', className: 'bg-red-50 text-red-700' },
    NO_SHOW: { label: 'Não Compareceu', className: 'bg-slate-100 text-slate-600' },
    // fallback for lowercase strings coming from old records
    scheduled: { label: 'Agendada', className: 'bg-blue-50 text-blue-700' },
    completed: { label: 'Confirmada', className: 'bg-emerald-50 text-emerald-700' },
    cancelled: { label: 'Cancelada', className: 'bg-red-50 text-red-700' },
}

interface SessionHistoryTabProps {
    patientId: string
}

export function SessionHistoryTab({ patientId }: SessionHistoryTabProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [sessions, setSessions] = useState<SessionHistoryItem[]>([])

    useEffect(() => {
        if (!patientId) return
        setIsLoading(true)
        getPatientSessionHistory(patientId)
            .then(setSessions)
            .finally(() => setIsLoading(false))
    }, [patientId])

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-lg">Sessões Realizadas</h3>
                <Button variant="outline" size="sm" className="h-8 text-xs" disabled>
                    Exportar Histórico
                </Button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p className="text-sm">Carregando histórico...</p>
                </div>
            ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 gap-3 text-slate-400">
                    <CalendarX className="h-8 w-8" />
                    <p className="text-sm text-center">Nenhuma sessão registrada com este paciente ainda.</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pl-8 py-2">
                    {sessions.map((session) => {
                        const statusInfo = STATUS_LABELS[session.status] || { label: session.status, className: 'bg-slate-100 text-slate-600' }
                        return (
                            <div key={session.id} className="relative group">
                                <div className="absolute -left-[39px] top-1.5 h-4 w-4 rounded-full border-2 border-white bg-slate-300 group-hover:bg-blue-500 transition-colors shadow-sm z-10" />
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-900 text-sm">Sessão de Terapia Individual</p>
                                            <Badge
                                                variant="secondary"
                                                className={`text-[10px] h-5 px-1.5 hover:opacity-90 ${statusInfo.className}`}
                                            >
                                                {statusInfo.label}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                            <Calendar className="h-3.5 w-3.5" /> {session.scheduledAt}
                                            <span className="text-slate-300">•</span>
                                            <Clock className="h-3.5 w-3.5" /> {session.endTime}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2">{session.psychologistName}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-slate-900">{session.price}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
