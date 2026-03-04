'use client'

import { BookOpen, Activity, Smile, Heart } from 'lucide-react'

interface DiaryHeaderProps {
  entriesLength: number
  avgMood: string
  commonEmotion: string
}

export function DiaryHeader({ entriesLength, avgMood, commonEmotion }: DiaryHeaderProps) {
  return (
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

      {entriesLength > 0 && (
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smile className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                Humor Médio
              </p>
              <p className="text-lg font-bold text-slate-900">{avgMood}</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                Predominante
              </p>
              <p className="text-lg font-bold text-slate-900 truncate max-w-[80px]">
                {commonEmotion}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
