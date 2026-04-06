'use client'
import { useTranslations, useLocale } from 'next-intl'
import { ptBR, es } from 'date-fns/locale'

import { format } from 'date-fns'
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
  const t = useTranslations('PatientDashboard.diary')
  const locale = useLocale()
  const dateLocale = locale === 'es' ? es : ptBR
  const today = new Date()

  return (
    <div className="space-y-6">
      {/* compact top bar with mood and date */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5 p-1 bg-white border border-slate-100 rounded-2xl shadow-sm">
            {MOODS.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                title={t(`moods.${mood.tKey}`)}
                className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                  selectedMood === mood.value
                    ? 'bg-slate-900 border-slate-900 shadow-md scale-110'
                    : 'bg-transparent hover:bg-slate-50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                }`}
              >
                <span className={selectedMood === mood.value ? 'grayscale-0' : ''}>
                  {mood.emoji}
                </span>
              </button>
            ))}
          </div>
          {selectedMood && (
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
              {t(`moods.${MOODS.find((m) => m.value === selectedMood)?.tKey}`)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400 px-3 py-1.5 bg-slate-100/50 rounded-full border border-slate-100/50">
          <Calendar className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {format(today, "EEEE, dd 'de' MMMM", { locale: dateLocale })}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 opacity-50" />

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((emotion) => {
              const Icon = emotion.icon
              const isSelected = selectedEmotions.includes(emotion.tKey)
              return (
                <button
                  key={emotion.tKey}
                  onClick={() => toggleEmotion(emotion.tKey)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all text-xs font-semibold leading-none ${
                    isSelected
                      ? `bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/20`
                      : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 text-slate-500'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  {t(`emotions.${emotion.tKey}`)}
                </button>
              )
            })}
          </div>

          <div className="relative pt-2">
            <Textarea
              placeholder={t('placeholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[220px] w-full border-none shadow-none bg-transparent focus:ring-0 text-slate-700 text-lg leading-relaxed p-0 placeholder:text-slate-300 resize-none font-medium"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            {content.length} {t('characters')}
          </div>

          <Button
            onClick={handleSave}
            disabled={isPending || !selectedMood || !content}
            className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800 h-12 px-8 font-bold text-xs uppercase tracking-widest gap-3 shadow-xl shadow-slate-900/20 transition-all hover:shadow-2xl active:scale-95 disabled:opacity-30"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="h-4 w-4" /> {t('saveButton')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
