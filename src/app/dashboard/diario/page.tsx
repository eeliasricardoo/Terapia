"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Smile, Meh, Frown, Heart, Zap, Cloud } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const MOODS = [
    { emoji: "😢", label: "Muito triste", value: 1, color: "bg-red-100 hover:bg-red-200 text-red-700" },
    { emoji: "😕", label: "Triste", value: 2, color: "bg-orange-100 hover:bg-orange-200 text-orange-700" },
    { emoji: "😐", label: "Neutro", value: 3, color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-700" },
    { emoji: "🙂", label: "Bem", value: 4, color: "bg-lime-100 hover:bg-lime-200 text-lime-700" },
    { emoji: "😄", label: "Muito bem", value: 5, color: "bg-green-100 hover:bg-green-200 text-green-700" },
]

const EMOTIONS = [
    { icon: Heart, label: "Amor", color: "bg-pink-100 text-pink-700" },
    { icon: Zap, label: "Ansiedade", color: "bg-yellow-100 text-yellow-700" },
    { icon: Cloud, label: "Calma", color: "bg-blue-100 text-blue-700" },
    { icon: Smile, label: "Alegria", color: "bg-green-100 text-green-700" },
    { icon: Frown, label: "Tristeza", color: "bg-gray-100 text-gray-700" },
    { icon: Meh, label: "Tédio", color: "bg-slate-100 text-slate-700" },
]

// Mock data for previous entries
const PREVIOUS_ENTRIES = [
    {
        id: 1,
        date: new Date(2026, 1, 9),
        mood: 4,
        emotions: ["Alegria", "Calma"],
        content: "Hoje foi um dia produtivo. Consegui finalizar o projeto que estava pendente e me sinto aliviado.",
    },
    {
        id: 2,
        date: new Date(2026, 1, 8),
        mood: 3,
        emotions: ["Ansiedade", "Tédio"],
        content: "Dia comum, nada de especial aconteceu. Me senti um pouco ansioso com as tarefas da semana.",
    },
    {
        id: 3,
        date: new Date(2026, 1, 7),
        mood: 5,
        emotions: ["Alegria", "Amor"],
        content: "Passei o dia com a família. Foi muito bom relaxar e aproveitar o tempo juntos.",
    },
]

export default function DiarioPage() {
    const [selectedMood, setSelectedMood] = useState<number | null>(null)
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
    const [content, setContent] = useState("")
    const [entries, setEntries] = useState(PREVIOUS_ENTRIES)
    const today = new Date()

    const toggleEmotion = (emotion: string) => {
        setSelectedEmotions(prev =>
            prev.includes(emotion)
                ? prev.filter(e => e !== emotion)
                : [...prev, emotion]
        )
    }

    const handleSave = () => {
        if (!selectedMood || !content.trim()) {
            toast.error('Preencha todos os campos', {
                description: 'Selecione um humor e escreva algo sobre seu dia.',
            })
            return
        }

        // Create new entry
        const newEntry = {
            id: Date.now(),
            date: today,
            mood: selectedMood,
            emotions: selectedEmotions,
            content: content.trim(),
        }

        // Add to beginning of entries list
        setEntries(prev => [newEntry, ...prev])

        toast.success('Entrada salva com sucesso!', {
            description: 'Seu registro foi adicionado ao diário.',
            duration: 3000,
        })

        // Reset form
        setSelectedMood(null)
        setSelectedEmotions([])
        setContent("")
    }

    const getMoodEmoji = (value: number) => {
        return MOODS.find(m => m.value === value)?.emoji || "😐"
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Diário Emocional</h1>
                <p className="text-muted-foreground mt-1">
                    Registre seus sentimentos e acompanhe sua jornada emocional
                </p>
            </div>

            {/* New Entry Card */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">Nova Entrada</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Calendar className="h-4 w-4" />
                                {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Mood Selection */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Como você está se sentindo hoje?</h3>
                        <div className="grid grid-cols-5 gap-3">
                            {MOODS.map((mood) => (
                                <button
                                    key={mood.value}
                                    onClick={() => setSelectedMood(mood.value)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${selectedMood === mood.value
                                        ? `${mood.color} border-current shadow-md scale-105`
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="text-3xl mb-2">{mood.emoji}</span>
                                    <span className="text-xs font-medium text-center">{mood.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Emotions Selection */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Que emoções você sentiu? (opcional)</h3>
                        <div className="flex flex-wrap gap-2">
                            {EMOTIONS.map((emotion) => {
                                const Icon = emotion.icon
                                const isSelected = selectedEmotions.includes(emotion.label)
                                return (
                                    <button
                                        key={emotion.label}
                                        onClick={() => toggleEmotion(emotion.label)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${isSelected
                                            ? `${emotion.color} border-current shadow-sm`
                                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="text-sm font-medium">{emotion.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Text Entry */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3">Escreva sobre seu dia</h3>
                        <Textarea
                            placeholder="Como foi seu dia? O que aconteceu? Como você se sentiu?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[150px] resize-none"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            {content.length} caracteres
                        </p>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button
                            onClick={handleSave}
                            size="lg"
                            className="px-8"
                        >
                            Salvar Entrada
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Previous Entries */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Entradas Anteriores</h2>
                <div className="space-y-4">
                    {entries.map((entry) => (
                        <Card key={entry.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{getMoodEmoji(entry.mood)}</span>
                                        <div>
                                            <p className="font-semibold text-slate-900">
                                                {format(entry.date, "dd 'de' MMMM", { locale: ptBR })}
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {format(entry.date, "EEEE", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {entry.emotions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {entry.emotions.map((emotion) => (
                                            <Badge key={emotion} variant="secondary" className="text-xs">
                                                {emotion}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {entry.content}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
