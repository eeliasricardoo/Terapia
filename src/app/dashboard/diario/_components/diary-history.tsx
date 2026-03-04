'use client'

import { Clock, BookOpen, Loader2, Trash2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MOODS } from '../constants'
import { type DiaryEntryData } from '@/lib/actions/diary'

interface DiaryHistoryProps {
  entries: DiaryEntryData[]
  isLoading: boolean
  deletingId: string | null
  handleDelete: (id: string) => void
}

export function DiaryHistory({ entries, isLoading, deletingId, handleDelete }: DiaryHistoryProps) {
  return (
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
              <p className="text-sm leading-relaxed">
                As reflexões diárias ajudam você e seu terapeuta a acompanharem seu progresso
                emocional.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => {
              const moodInfo = MOODS.find((m) => m.value === entry.mood)
              return (
                <Card
                  key={entry.id}
                  className="group border-none shadow-md shadow-slate-200/40 bg-white hover:bg-slate-50 transition-all ring-1 ring-slate-100"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 mt-1">
                        <span className="text-3xl filter saturate-[0.8] group-hover:saturate-100 transition-all">
                          {moodInfo?.emoji || '😐'}
                        </span>
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
                            {deletingId === entry.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {entry.emotions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {entry.emotions.map((em) => (
                              <Badge
                                key={em}
                                variant="secondary"
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0 h-5 border-none"
                              >
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
  )
}
