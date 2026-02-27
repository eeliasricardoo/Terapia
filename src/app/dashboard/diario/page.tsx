"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Calendar, Clock, Heart, Zap, Cloud, Smile, Frown, Meh,
    Loader2, Trash2, BookOpen, TrendingUp, Sparkles
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { getDiaryEntries, saveDiaryEntry, deleteDiaryEntry, type DiaryEntryData } from "@/lib/actions/diary"

const MOODS = [
    { emoji: "😢", label: "Muito triste", value: 1, activeClass: "bg-red-50 border-red-300 text-red-700 shadow-red-100 shadow-sm" },
    { emoji: "😕", label: "Triste", value: 2, activeClass: "bg-orange-50 border-orange-300 text-orange-700 shadow-orange-100 shadow-sm" },
    { emoji: "😐", label: "Neutro", value: 3, activeClass: "bg-yellow-50 border-yellow-300 text-yellow-700 shadow-yellow-100 shadow-sm" },
    { emoji: "🙂", label: "Bem", value: 4, activeClass: "bg-lime-50 border-lime-300 text-lime-700 shadow-lime-100 shadow-sm" },
    { emoji: "😄", label: "Muito bem", value: 5, activeClass: "bg-green-50 border-green-300 text-green-700 shadow-green-100 shadow-sm" },
]

const EMOTIONS = [
    { icon: Heart, label: "Amor", activeClass: "bg-pink-50 border-pink-300 text-pink-700" },
    { icon: Zap, label: "Ansiedade", activeClass: "bg-amber-50 border-amber-300 text-amber-700" },
    { icon: Cloud, label: "Calma", activeClass: "bg-sky-50 border-sky-300 text-sky-700" },
    { icon: Smile, label: "Alegria", activeClass: "bg-emerald-50 border-emerald-300 text-emerald-700" },
    { icon: Frown, label: "Tristeza", activeClass: "bg-slate-100 border-slate-300 text-slate-700" },
    { icon: Meh, label: "Tédio", activeClass: "bg-violet-50 border-violet-300 text-violet-700" },
    { icon: Sparkles, label: "Gratidão", activeClass: "bg-yellow-50 border-yellow-300 text-yellow-700" },
    { icon: TrendingUp, label: "Motivação", activeClass: "bg-blue-50 border-blue-300 text-blue-700" },
]

const MOOD_COLORS: Record<number, string> = {
    1: "bg-red-50 border-red-100",
    2: "bg-orange-50 border-orange-100",
    3: "bg-yellow-50 border-yellow-100",
    4: "bg-lime-50 border-lime-100",
    5: "bg-emerald-50 border-emerald-100",
}

export default function DiarioPage() {
    const [selectedMood, setSelectedMood] = useState<number | null>(null)
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
    const [content, setContent] = useState("")
    const [entries, setEntries] = useState<DiaryEntryData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const today = new Date()

    useEffect(() => {
        getDiaryEntries()
            .then(setEntries)
            .finally(() => setIsLoading(false))
    }, [])

    const toggleEmotion = (label: string) => {
        setSelectedEmotions(prev =>
            prev.includes(label) ? prev.filter(e => e !== label) : [...prev, label]
        )
    }

    const handleSave = () => {
        if (!selectedMood || !content.trim()) {
            toast.error("Preencha todos os campos", {
                description: "Selecione um humor e escreva algo sobre seu dia.",
            })
            return
        }
        startTransition(async () => {
            const result = await saveDiaryEntry({ mood: selectedMood, emotions: selectedEmotions, content: content.trim() })
            if (result.success) {
                toast.success("Entrada salva com sucesso!")
                const updated = await getDiaryEntries()
                setEntries(updated)
                setSelectedMood(null)
                setSelectedEmotions([])
                setContent("")
            } else {
                toast.error("Erro ao salvar. Tente novamente.")
            }
        })
    }

    const handleDelete = (id: string) => {
        setDeletingId(id)
        startTransition(async () => {
            const result = await deleteDiaryEntry(id)
            if (result.success) {
                setEntries(prev => prev.filter(e => e.id !== id))
                toast.success("Entrada removida.")
            } else {
                toast.error("Erro ao remover entrada.")
            }
            setDeletingId(null)
        })
    }

    const getMoodEmoji = (value: number) => MOODS.find(m => m.value === value)?.emoji || "😐"
    const getMoodLabel = (value: number) => MOODS.find(m => m.value === value)?.label || "Neutro"

    // Stats
    const avgMood = entries.length
        ? (entries.reduce((acc, e) => acc + e.mood, 0) / entries.length).toFixed(1)
        : "—"
    const commonEmotion = (() => {
        const freq: Record<string, number> = {}
        entries.forEach(e => e.emotions.forEach(em => { freq[em] = (freq[em] || 0) + 1 }))
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]
        return top ? top[0] : "—"
    })()

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        Diário Emocional
                    </h1>
                    <p className="text-slate-500 mt-1.5 ml-[52px]">
                        Registre seus sentimentos e acompanhe sua jornada emocional.
                    </p>
                </div>
            </div>

            {/* Stats bar */}
            {entries.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Entradas</p>
                        <p className="text-2xl font-bold text-slate-900">{entries.length}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Humor Médio</p>
                        <p className="text-2xl font-bold text-slate-900">{avgMood} <span className="text-lg">/ 5</span></p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">Emoção Frequente</p>
                        <p className="text-lg font-bold text-slate-900">{commonEmotion}</p>
                    </div>
                </div>
            )}

            {/* New Entry Card */}
            <Card className="border border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-violet-500" />
                            Nova Entrada
                        </CardTitle>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    {/* Mood Selection */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Como você está se sentindo hoje?
                        </h3>
                        <div className="grid grid-cols-5 gap-3">
                            {MOODS.map((mood) => (
                                <button
                                    key={mood.value}
                                    onClick={() => setSelectedMood(mood.value)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedMood === mood.value
                                            ? `${mood.activeClass} scale-105`
                                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white"
                                        }`}
                                >
                                    <span className="text-3xl mb-2">{mood.emoji}</span>
                                    <span className="text-[11px] font-medium text-center leading-tight">{mood.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Emotions */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Que emoções você sentiu? <span className="font-normal">(opcional)</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {EMOTIONS.map((emotion) => {
                                const Icon = emotion.icon
                                const isSelected = selectedEmotions.includes(emotion.label)
                                return (
                                    <button
                                        key={emotion.label}
                                        onClick={() => toggleEmotion(emotion.label)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${isSelected
                                                ? `${emotion.activeClass} shadow-sm`
                                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-600"
                                            }`}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {emotion.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Text */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                            Escreva sobre seu dia
                        </h3>
                        <Textarea
                            placeholder="Como foi seu dia? O que aconteceu? Como você se sentiu? Este espaço é seu..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[140px] resize-none text-sm leading-relaxed"
                        />
                        <p className="text-xs text-slate-400 mt-2 text-right">{content.length} caracteres</p>
                    </div>

                    <div className="flex justify-end pt-1">
                        <Button
                            onClick={handleSave}
                            disabled={isPending}
                            className="bg-violet-600 hover:bg-violet-700 text-white px-8 gap-2 shadow-sm shadow-violet-200"
                        >
                            {isPending ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                            ) : (
                                <><BookOpen className="h-4 w-4" /> Salvar Entrada</>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Entries History */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-slate-400" />
                    Histórico
                </h2>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <p className="text-sm">Carregando entradas...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 gap-4 text-slate-400">
                        <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
                            <BookOpen className="h-7 w-7" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-slate-600">Nenhuma entrada ainda</p>
                            <p className="text-sm mt-1">Use o formulário acima para criar sua primeira entrada.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {entries.map((entry) => {
                            const moodInfo = MOODS.find(m => m.value === entry.mood)
                            const cardColor = MOOD_COLORS[entry.mood] || "bg-white border-slate-100"
                            return (
                                <Card
                                    key={entry.id}
                                    className={`border shadow-sm hover:shadow-md transition-all ${cardColor}`}
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1 min-w-0">
                                                <span className="text-3xl flex-shrink-0 mt-0.5">{moodInfo?.emoji || "😐"}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <p className="font-semibold text-slate-900 text-sm">{entry.dateLabel}</p>
                                                        <span className="text-slate-300">•</span>
                                                        <p className="text-xs text-slate-500 capitalize">{entry.dayOfWeek}</p>
                                                        <Badge variant="outline" className="text-[10px] h-5 px-2 capitalize">
                                                            {getMoodLabel(entry.mood)}
                                                        </Badge>
                                                    </div>
                                                    {entry.emotions.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                                            {entry.emotions.map((em) => (
                                                                <Badge key={em} variant="secondary" className="text-[11px] h-5 px-2 bg-white/70">
                                                                    {em}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-slate-700 leading-relaxed">{entry.content}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(entry.id)}
                                                disabled={deletingId === entry.id}
                                                className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                            >
                                                {deletingId === entry.id
                                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    : <Trash2 className="h-3.5 w-3.5" />
                                                }
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
