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
        Sua Jornada
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
          <div className="relative ml-4 pl-8 border-l-2 border-slate-100 space-y-10 pb-10">
            {entries.map((entry) => {
              const moodInfo = MOODS.find((m) => m.value === entry.mood)
              return (
                <div key={entry.id} className="relative">
                  {/* Timeline Dot (Mood Emoji) */}
                  <div className="absolute -left-[21px] top-0 h-10 w-10 rounded-full border-4 border-slate-50 bg-white flex items-center justify-center shadow-sm text-xl z-10 transition-transform hover:scale-110">
                    {moodInfo?.emoji || '😐'}
                  </div>

                  <Card className="group border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] bg-white hover:bg-slate-50/50 transition-all ring-1 ring-slate-100/80 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 py-0.5 bg-blue-50 rounded-full">
                                {entry.dayOfWeek}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                • {entry.dateLabel.split(' ')[0]} {entry.dateLabel.split(' ')[1]}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
                              {moodInfo?.label}
                            </span>
                          </div>

                          <button
                            onClick={() => handleDelete(entry.id)}
                            disabled={deletingId === entry.id}
                            className="h-8 w-8 rounded-xl bg-slate-50 text-slate-300 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                            title="Remover reflexão"
                          >
                            {deletingId === entry.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {entry.emotions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {entry.emotions.map((em) => (
                              <Badge
                                key={em}
                                variant="secondary"
                                className="bg-slate-50 hover:bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-0.5 h-6 border border-slate-100/50 rounded-lg shadow-none"
                              >
                                {em}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="relative">
                          {/* Subtle left border for text */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 rounded-full opacity-50" />
                          <p className="text-sm text-slate-600 leading-relaxed pl-4 font-medium italic">
                            &quot;{entry.content}&quot;
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
