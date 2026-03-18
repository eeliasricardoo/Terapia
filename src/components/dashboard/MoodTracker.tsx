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

interface MoodTrackerProps {
  monthlyProgress: {
    completedSessions: number
    totalSessions: number
  }
}

export function MoodTracker({ monthlyProgress }: MoodTrackerProps) {
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
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h4 className="text-xl font-black text-slate-900">Como você está agora?</h4>
              <p className="text-sm font-medium text-slate-500">
                Um registro rápido do seu bem-estar.
              </p>
            </div>
            <div
              className="flex gap-2 relative"
              role="group"
              aria-label="Selecione como você está se sentindo"
            >
              {isSaving && (
                <div
                  className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-xl"
                  aria-hidden="true"
                >
                  <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                </div>
              )}
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value, mood.emoji)}
                  disabled={isSaving}
                  aria-label={mood.label}
                  aria-pressed={selectedMood === mood.value}
                  className={`h-12 w-12 rounded-full flex items-center justify-center text-xl transition-all focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
                    selectedMood === mood.value
                      ? 'bg-slate-900 scale-110 shadow-lg'
                      : 'hover:bg-slate-100'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={mood.label}
                >
                  <span
                    className={
                      selectedMood === mood.value
                        ? 'grayscale-0'
                        : 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                    }
                  >
                    {mood.emoji}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-900 italic">Sua jornada este mês</span>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {monthlyProgress.completedSessions} de {monthlyProgress.totalSessions} SESSÕES
              </span>
            </div>
            <Progress
              value={(monthlyProgress.completedSessions / monthlyProgress.totalSessions) * 100}
              className="h-1.5 bg-slate-100"
              indicatorClassName="bg-slate-900"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
