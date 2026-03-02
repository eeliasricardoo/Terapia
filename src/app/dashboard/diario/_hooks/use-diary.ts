"use client"

import { useState, useEffect, useTransition } from "react"
import { toast } from "sonner"
import { getDiaryEntries, saveDiaryEntry, deleteDiaryEntry, type DiaryEntryData } from "@/lib/actions/diary"

export function useDiary() {
    const [selectedMood, setSelectedMood] = useState<number | null>(null)
    const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
    const [content, setContent] = useState("")
    const [entries, setEntries] = useState<DiaryEntryData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, startTransition] = useTransition()
    const [deletingId, setDeletingId] = useState<string | null>(null)

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

    const avgMood = entries.length
        ? (entries.reduce((acc, e) => acc + e.mood, 0) / entries.length).toFixed(1)
        : "—"

    const commonEmotion = (() => {
        const freq: Record<string, number> = {}
        entries.forEach(e => e.emotions.forEach(em => { freq[em] = (freq[em] || 0) + 1 }))
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]
        return top ? top[0] : "—"
    })()

    return {
        selectedMood, setSelectedMood,
        selectedEmotions, setSelectedEmotions, toggleEmotion,
        content, setContent,
        entries, isLoading, isPending, DeletingId: deletingId,
        handleSave, handleDelete,
        stats: { avgMood, commonEmotion }
    }
}
