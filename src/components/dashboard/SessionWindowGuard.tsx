'use client'

import React, { useEffect, useState } from 'react'
import { isWithinSessionWindow } from '@/lib/actions/sessions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Timer, VideoOff } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface SessionWindowGuardProps {
  scheduledAt: string
  durationMinutes: number
  children: React.ReactNode
}

export function SessionWindowGuard({
  scheduledAt,
  durationMinutes,
  children,
}: SessionWindowGuardProps) {
  const [status, setStatus] = useState<{
    allowed: boolean
    reason?: 'too_early' | 'too_late' | 'not_scheduled'
  } | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')

  const checkWindow = React.useCallback(() => {
    const res = isWithinSessionWindow(new Date(scheduledAt), durationMinutes)
    setStatus(res)

    if (res.reason === 'too_early') {
      const now = new Date()
      const start = new Date(scheduledAt)
      const windowStart = new Date(start.getTime() - 10 * 60 * 1000)
      const diff = windowStart.getTime() - now.getTime()

      if (diff > 0) {
        const mins = Math.floor(diff / 60000)
        const secs = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${mins}m ${secs}s`)
      }
    }
  }, [scheduledAt, durationMinutes])

  useEffect(() => {
    checkWindow()
    const interval = setInterval(checkWindow, 1000)
    return () => clearInterval(interval)
  }, [checkWindow])

  if (status === null) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-slate-500 font-medium">Verificando acesso à sessão...</p>
      </div>
    )
  }

  if (status.allowed) {
    return <>{children}</>
  }

  return (
    <div className="flex items-center justify-center p-4 min-h-[500px] animate-in fade-in zoom-in duration-500">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Timer className="h-32 w-32 -mr-8 -mt-8" />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            {status.reason === 'too_early' ? (
              <div className="h-20 w-20 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6">
                <Timer className="h-10 w-10 text-indigo-300" />
              </div>
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-red-500/20 flex items-center justify-center mb-6">
                <VideoOff className="h-10 w-10 text-red-300" />
              </div>
            )}
            <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-indigo-200/70 text-sm">Controle de Segurança de Sessão</p>
          </div>
        </div>

        <div className="p-8 text-center bg-white">
          {status.reason === 'too_early' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-slate-600 font-medium leading-relaxed">
                  A sala de vídeo estará disponível{' '}
                  <span className="text-slate-900 font-bold">10 minutos antes</span> da sessão
                  iniciar.
                </p>
                <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Inicia em {timeLeft}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 text-left">
                <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                  <span>Horário Agendado</span>
                  <span>Duração</span>
                </div>
                <div className="flex justify-between items-center text-slate-900 font-bold">
                  <span>{format(new Date(scheduledAt), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
                  <span>{durationMinutes} min</span>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                className="w-full h-12 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
              >
                <Link href="/dashboard/sessoes">Voltar para Minhas Sessões</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-slate-600 font-medium leading-relaxed">
                Esta sessão já foi <span className="text-red-600 font-bold">encerrada</span> ou o
                link de acesso expirou.
              </p>

              <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100 text-left">
                <p className="text-xs text-red-500 font-bold mb-1">Status</p>
                <p className="text-red-700 font-bold">Acesso Expirado</p>
              </div>

              <div className="grid gap-3">
                <Button
                  asChild
                  className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  <Link href="/busca">Agendar Nova Sessão</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full text-slate-500 font-medium">
                  <Link href="/dashboard/sessoes">Ir para Histórico</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
