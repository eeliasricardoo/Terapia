"use client"

import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Calendar, Clock, Heart, Zap, Cloud, Smile, Frown, Meh,
    Loader2, Trash2, BookOpen, TrendingUp, Sparkles, Activity, Plus
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
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
                toast.error(result.error || "Erro ao salvar. Tente novamente.")
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
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-100 ring-4 ring-white">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Diário Emocional
                        </h1>
                    </div>
                    <p className="text-slate-500 ml-1.5 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        Uma ferramenta para autoconhecimento e acompanhamento da sua jornada.
                    </p>
                </div>

                {entries.length > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Smile className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Humor Médio</p>
                                <p className="text-lg font-bold text-slate-900">{avgMood}</p>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Heart className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Predominante</p>
                                <p className="text-lg font-bold text-slate-900 truncate max-w-[80px]">{commonEmotion}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Form */}
                <div className="lg:col-span-7 space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden ring-1 ring-slate-200">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-blue-500" />
                                    Como você está agora?
                                </CardTitle>
                                <Badge variant="secondary" className="bg-white border-slate-200 text-slate-500 font-medium">
                                    <Calendar className="h-3 w-3 mr-1.5" />
                                    {format(today, "dd 'de' MMM", { locale: ptBR })}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            {/* Mood Selection */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                    1. Escolha seu humor
                                </label>
                                <div className="grid grid-cols-5 gap-3">
                                    {MOODS.map((mood) => (
                                        <button
                                            key={mood.value}
                                            onClick={() => setSelectedMood(mood.value)}
                                            className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 ${selectedMood === mood.value
                                                ? `border-blue-500 bg-blue-50/50 scale-105 shadow-md shadow-blue-100`
                                                : "border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50"
                                                }`}
                                        >
                                            <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">{mood.emoji}</span>
                                            <span className={`text-[10px] font-bold text-center leading-tight transition-colors ${selectedMood === mood.value ? 'text-blue-700' : 'text-slate-500'}`}>
                                                {mood.label}
                                            </span>
                                            {selectedMood === mood.value && (
                                                <div className="absolute top-1 right-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white animate-in zoom-in" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Emotions */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                    2. O que você sentiu? <span className="text-slate-400 font-normal lowercase">(opcional)</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {EMOTIONS.map((emotion) => {
                                        const Icon = emotion.icon
                                        const isSelected = selectedEmotions.includes(emotion.label)
                                        return (
                                            <button
                                                key={emotion.label}
                                                onClick={() => toggleEmotion(emotion.label)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-semibold ${isSelected
                                                    ? `bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200`
                                                    : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                                                    }`}
                                            >
                                                <Icon className={`h-4 w-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                                                {emotion.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Textarea */}
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                    3. Descreva seu momento
                                </label>
                                <div className="relative group">
                                    <Textarea
                                        placeholder="Sinta-se à vontade para escrever o que vier à mente..."
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="min-h-[180px] rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-base leading-relaxed p-4"
                                    />
                                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                        <p className="text-[10px] font-bold text-slate-400 bg-white/80 px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                                            {content.length} caracteres
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={handleSave}
                                    disabled={isPending}
                                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-xl font-bold gap-2 shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                                >
                                    {isPending ? (
                                        <><Loader2 className="h-5 w-5 animate-spin" /> Salvando...</>
                                    ) : (
                                        <><Plus className="h-5 w-5" /> Salvar Entrada</>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-5 flex flex-col h-full gap-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 px-1">
                        <Clock className="h-5 w-5 text-blue-500" />
                        Suas reflexões
                    </h3>

                    <ScrollArea className="h-[700px] pr-4 -mr-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                <p className="text-sm font-medium">Carregando sua jornada...</p>
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 gap-4 text-slate-400 px-6 text-center">
                                <div className="h-20 w-20 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                                    <BookOpen className="h-10 w-10 text-slate-200" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-600 mb-1">Inicie seu diário</p>
                                    <p className="text-sm leading-relaxed">As reflexões diárias ajudam você e seu terapeuta a acompanharem seu progresso emocional.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {entries.map((entry) => {
                                    const moodInfo = MOODS.find(m => m.value === entry.mood)
                                    return (
                                        <Card
                                            key={entry.id}
                                            className="group border-none shadow-md shadow-slate-200/40 bg-white hover:bg-slate-50 transition-all ring-1 ring-slate-100"
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex flex-col items-center gap-1 mt-1">
                                                        <span className="text-3xl filter saturate-[0.8] group-hover:saturate-100 transition-all">{moodInfo?.emoji || "😐"}</span>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-tighter mb-0.5">
                                                                    {entry.dayOfWeek}
                                                                </span>
                                                                <span className="text-sm font-bold text-slate-900">
                                                                    {entry.dateLabel}
                                                                </span>
                                                            </div>

                                                            <button
                                                                onClick={() => handleDelete(entry.id)}
                                                                disabled={deletingId === entry.id}
                                                                className="h-8 w-8 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                                                            >
                                                                {deletingId === entry.id
                                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                                    : <Trash2 className="h-4 w-4" />
                                                                }
                                                            </button>
                                                        </div>

                                                        {entry.emotions.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                                {entry.emotions.map((em) => (
                                                                    <Badge key={em} variant="secondary" className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0 h-5 border-none">
                                                                        {em}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                                                            {entry.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
}
