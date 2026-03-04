'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { toast } from 'sonner'
import { saveQuickMood, getTodayMood } from '@/lib/actions/diary'
import { Loader2 } from 'lucide-react'

const MOODS = [
  { emoji: '😢', label: 'Muito triste', value: 1 },
  { emoji: '😕', label: 'Triste', value: 2 },
  { emoji: '😐', label: 'Neutro', value: 3 },
  { emoji: '🙂', label: 'Bem', value: 4 },
  { emoji: '😄', label: 'Muito bem', value: 5 },
]

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function loadMood() {
      const todayEntry = await getTodayMood()
      if (todayEntry) {
        setSelectedMood(todayEntry.mood)
      }
      setIsLoading(false)
    }
    loadMood()
  }, [])

  const handleMoodSelect = async (value: number, emoji: string) => {
    const previousMood = selectedMood
    setSelectedMood(value)
    setIsSaving(true)

    const result = await saveQuickMood(value)

    if (result.success) {
      const moodLabel = MOODS.find((m) => m.value === value)?.label || ''
      toast.success('Humor registrado!', {
        description: `Você está se sentindo: ${moodLabel} ${emoji}`,
        duration: 3000,
      })
    } else {
      setSelectedMood(previousMood)
      toast.error('Erro ao salvar', {
        description: 'Não foi possível registrar seu humor no momento.',
      })
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <Card className="border-none shadow-md bg-white min-h-[200px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-md bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Como você está hoje?</CardTitle>
        <CardDescription>Registre seu humor diário</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 relative">
          {isSaving && (
            <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-xl">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            </div>
          )}
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value, mood.emoji)}
              disabled={isSaving}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center text-2xl transition-all ${
                selectedMood === mood.value
                  ? 'bg-blue-100 border-2 border-blue-500 scale-110 shadow-md'
                  : 'hover:bg-slate-100 border-2 border-transparent hover:scale-105'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={mood.label}
            >
              <span className="text-3xl">{mood.emoji}</span>
              <span className="text-[9px] mt-1 text-slate-600 font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
        {selectedMood && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-blue-800">
              ✓ Humor registrado! Acesse o{' '}
              <Link
                href="/dashboard/diario"
                className="font-semibold underline hover:text-blue-900"
              >
                Diário Emocional
              </Link>{' '}
              para adicionar mais detalhes.
            </p>
          </div>
        )}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-900 mb-4">Seu progresso</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Sessões este mês</span>
              <span className="font-bold text-slate-900">3/4</span>
            </div>
            <Progress value={75} className="h-2 bg-slate-100" indicatorClassName="bg-blue-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
