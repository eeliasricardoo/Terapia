'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, User, FileText, CheckCircle2, Loader2, Info } from 'lucide-react'
import { getSessionSummary } from '@/lib/actions/sessions'

interface SessionSummaryDialogProps {
  session: {
    id: string | number
    psychologistName: string
    date: string
  }
  children: React.ReactNode
}

export function SessionSummaryDialog({ session, children }: SessionSummaryDialogProps) {
  const [open, setOpen] = useState(false)
  const [summary, setSummary] = useState<{
    durationMinutes: number
    psychologistName: string
    specialty: string
    publicSummary: string | null
    mood: string | null
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && !summary) {
      setIsLoading(true)
      getSessionSummary(String(session.id))
        .then((res) => {
          if (res.success && res.data) {
            setSummary(res.data)
          }
        })
        .finally(() => setIsLoading(false))
    }
  }, [open, session.id, summary])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" aria-describedby="session-summary-description">
        <DialogHeader>
          <DialogTitle className="text-2xl">Resumo da Sessão</DialogTitle>
          <p id="session-summary-description" className="sr-only">
            Resumo completo da sessão realizada
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-muted-foreground">Carregando resumo...</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Session Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {summary?.psychologistName || session.psychologistName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {summary?.specialty || 'Psicologia'}
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Concluída
              </Badge>
            </div>

            <Separator />

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Data:</span>
                <span className="font-medium">{session.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Duração:</span>
                <span className="font-medium">{summary?.durationMinutes || 50} minutos</span>
              </div>
            </div>

            <Separator />

            {/* Session Notes */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Anotações da Sessão</h3>
              </div>
              {summary?.publicSummary ? (
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {summary.publicSummary}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <Info className="h-5 w-5 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    Nenhuma anotação registrada para esta sessão.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    O profissional pode adicionar anotações após a sessão.
                  </p>
                </div>
              )}
            </div>

            {summary?.mood && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-lg">Estado Emocional Registrado</h3>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {summary.mood}
                  </Badge>
                </div>
              </>
            )}

            {/* Footer Note */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-800">
                💡 <strong>Lembrete:</strong> Estas anotações são confidenciais e fazem parte do seu
                histórico terapêutico.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
