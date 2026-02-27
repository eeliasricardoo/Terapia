"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Smile, Meh, Frown, AlertCircle, Activity,
    FilePlus, Calendar, Loader2, CheckCircle2
} from "lucide-react"
import { toast } from "sonner"
import { getEvolutions, saveEvolution, type EvolutionData } from "@/lib/actions/patients"

const MOODS = [
    { icon: Smile, label: 'Bem', color: 'text-emerald-500', activeBg: 'bg-emerald-50 border-emerald-400 shadow-emerald-100' },
    { icon: Meh, label: 'Neutro', color: 'text-amber-500', activeBg: 'bg-amber-50 border-amber-400 shadow-amber-100' },
    { icon: Frown, label: 'Mal', color: 'text-red-500', activeBg: 'bg-red-50 border-red-400 shadow-red-100' },
    { icon: AlertCircle, label: 'Crise', color: 'text-purple-500', activeBg: 'bg-purple-50 border-purple-400 shadow-purple-100' },
]

const MOOD_BADGE: Record<string, { label: string; className: string; icon: typeof Smile }> = {
    'Bem': { label: 'Bem', className: 'bg-emerald-50 text-emerald-600 border-none', icon: Smile },
    'Neutro': { label: 'Neutro', className: 'bg-amber-50 text-amber-600 border-none', icon: Meh },
    'Mal': { label: 'Mal', className: 'bg-red-50 text-red-600 border-none', icon: Frown },
    'Crise': { label: 'Crise', className: 'bg-purple-50 text-purple-600 border-none', icon: AlertCircle },
}

interface EvolutionsTabProps {
    patientId: string
}

export function EvolutionsTab({ patientId }: EvolutionsTabProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [evolutions, setEvolutions] = useState<EvolutionData[]>([])

    const [selectedMood, setSelectedMood] = useState<string | undefined>()
    const [publicSummary, setPublicSummary] = useState("")
    const [privateNotes, setPrivateNotes] = useState("")

    useEffect(() => {
        if (!patientId) return
        setIsLoading(true)
        getEvolutions(patientId)
            .then(setEvolutions)
            .finally(() => setIsLoading(false))
    }, [patientId])

    const handleSave = () => {
        if (!publicSummary && !privateNotes) {
            toast.error("Preencha ao menos o resumo ou a análise técnica.")
            return
        }
        startTransition(async () => {
            const result = await saveEvolution(patientId, {
                mood: selectedMood,
                publicSummary,
                privateNotes,
            })
            if (result.success) {
                toast.success("Registro salvo com sucesso!")
                // Refresh list
                const updated = await getEvolutions(patientId)
                setEvolutions(updated)
                // Reset form
                setSelectedMood(undefined)
                setPublicSummary("")
                setPrivateNotes("")
            } else {
                toast.error(result.error || "Erro ao salvar registro.")
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* New Evolution Form */}
            <Card className="border-slate-200 shadow-sm bg-slate-50/50">
                <CardHeader className="pb-3 pt-4 px-4 bg-white border-b border-slate-100 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-600" />
                            Registro de Sessão
                        </CardTitle>
                        <span className="text-xs text-slate-400 font-mono">
                            {new Date().toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4">
                    <div>
                        <label className="text-xs font-medium text-slate-500 mb-2 block uppercase tracking-wide">
                            Como o paciente chegou hoje?
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {MOODS.map((mood) => {
                                const isActive = selectedMood === mood.label
                                return (
                                    <button
                                        key={mood.label}
                                        onClick={() => setSelectedMood(isActive ? undefined : mood.label)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${isActive
                                                ? `${mood.activeBg} shadow-sm`
                                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                                            }`}
                                    >
                                        <mood.icon className={`h-4 w-4 ${mood.color}`} />
                                        <span className="text-xs font-medium text-slate-600">{mood.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500 block uppercase tracking-wide">
                                Resumo da Sessão (Público no Prontuário)
                            </label>
                            <Textarea
                                placeholder="O que foi discutido hoje?"
                                value={publicSummary}
                                onChange={e => setPublicSummary(e.target.value)}
                                className="min-h-[100px] text-sm resize-none bg-white focus:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-500 block uppercase tracking-wide flex items-center gap-2">
                                Análise Técnica Privada
                                <Badge variant="outline" className="text-[9px] h-4 px-1 bg-slate-100 text-slate-500 border-slate-200">
                                    Sigiloso
                                </Badge>
                            </label>
                            <Textarea
                                placeholder="Suas impressões técnicas..."
                                value={privateNotes}
                                onChange={e => setPrivateNotes(e.target.value)}
                                className="min-h-[100px] text-sm resize-none bg-amber-50/30 border-amber-100 focus:bg-amber-50/50 focus:border-amber-200"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={isPending}
                            className="bg-slate-900 text-white hover:bg-slate-800 gap-2"
                        >
                            {isPending ? (
                                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando...</>
                            ) : (
                                <><FilePlus className="h-3.5 w-3.5" /> Salvar Registro</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline */}
            <div className="space-y-6 pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">Histórico Recente</h3>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <p className="text-sm">Carregando evoluções...</p>
                    </div>
                ) : evolutions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 gap-3 text-slate-400">
                        <FilePlus className="h-8 w-8" />
                        <p className="text-sm text-center">Nenhum registro de evolução ainda.<br />Use o formulário acima para criar o primeiro.</p>
                    </div>
                ) : (
                    <div className="relative border-l border-slate-200 ml-4 space-y-8 pl-8 pb-4">
                        {evolutions.map((ev) => {
                            const moodInfo = ev.mood ? MOOD_BADGE[ev.mood] : null
                            const MoodIcon = moodInfo?.icon
                            return (
                                <div key={ev.id} className="relative group">
                                    <div className="absolute -left-[37px] top-0 h-3 w-3 rounded-full border-2 border-white bg-slate-300 group-hover:bg-blue-500 transition-all shadow-sm z-10 box-content" />
                                    <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all group-hover:border-blue-100">
                                        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                                                    Sessão Regular
                                                </Badge>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" /> {ev.date}
                                                </span>
                                            </div>
                                            {moodInfo && MoodIcon && (
                                                <Badge variant="outline" className={`flex items-center gap-1 px-2 ${moodInfo.className}`}>
                                                    <MoodIcon className="h-3 w-3" /> {moodInfo.label}
                                                </Badge>
                                            )}
                                        </CardHeader>
                                        <CardContent className="p-4 pt-2 space-y-2">
                                            {ev.publicSummary && (
                                                <p className="text-sm text-slate-600 leading-relaxed">{ev.publicSummary}</p>
                                            )}
                                            {ev.privateNotes && (
                                                <div className="mt-3 pt-3 border-t border-slate-50">
                                                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Análise Técnica</p>
                                                    <p className="text-xs text-slate-500 italic">{ev.privateNotes}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
