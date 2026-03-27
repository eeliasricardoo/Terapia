'use client'

import { BookOpen, Activity, Smile, Heart } from 'lucide-react'

interface DiaryHeaderProps {
  entriesLength: number
  avgMood: string
  commonEmotion: string
}

export function DiaryHeader({ entriesLength, avgMood, commonEmotion }: DiaryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Diário Emocional
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Acompanhe sua evolução e sentimentos ao longo do tempo.
        </p>
      </div>

      {entriesLength > 0 && (
        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl ring-1 ring-slate-100/10 shadow-sm">
            <Smile className="h-4 w-4 text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                Humor Médio
              </span>
              <span className="text-sm font-bold text-slate-900">{avgMood}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl ring-1 ring-slate-100/10 shadow-sm">
            <Heart className="h-4 w-4 text-pink-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                Predominante
              </span>
              <span className="text-sm font-bold text-slate-900 truncate max-w-[100px]">
                {commonEmotion}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
