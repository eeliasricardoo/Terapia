'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Sparkles, Loader2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MOODS, EMOTIONS } from '../constants'

interface DiaryFormProps {
  selectedMood: number | null
  setSelectedMood: (val: number) => void
  selectedEmotions: string[]
  toggleEmotion: (label: string) => void
  content: string
  setContent: (val: string) => void
  handleSave: () => void
  isPending: boolean
}

export function DiaryForm({
  selectedMood,
  setSelectedMood,
  selectedEmotions,
  toggleEmotion,
  content,
  setContent,
  handleSave,
  isPending,
}: DiaryFormProps) {
  const today = new Date()

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 overflow-hidden ring-1 ring-slate-200">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Como você está agora?
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-white border-slate-200 text-slate-500 font-medium"
          >
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
                className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 ${
                  selectedMood === mood.value
                    ? `border-blue-500 bg-blue-50/50 scale-105 shadow-md shadow-blue-100`
                    : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                  {mood.emoji}
                </span>
                <span
                  className={`text-[10px] font-bold text-center leading-tight transition-colors ${selectedMood === mood.value ? 'text-blue-700' : 'text-slate-500'}`}
                >
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
            2. O que você sentiu?{' '}
            <span className="text-slate-400 font-normal lowercase">(opcional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((emotion) => {
              const Icon = emotion.icon
              const isSelected = selectedEmotions.includes(emotion.label)
              return (
                <button
                  key={emotion.label}
                  onClick={() => toggleEmotion(emotion.label)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-sm font-semibold ${
                    isSelected
                      ? `bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200`
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
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
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" /> Salvar Entrada
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
