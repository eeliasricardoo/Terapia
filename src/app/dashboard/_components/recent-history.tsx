'use client'

import { Calendar as CalendarIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SessionSummaryDialog } from '@/components/dashboard/SessionSummaryDialog'

const HISTORY = [
  { id: 1, doctor: 'Dr. Carlos Pereira', date: '08 de Outubro de 2025' },
  { id: 2, doctor: 'Dr. Carlos Pereira', date: '01 de Outubro de 2025' },
  { id: 3, doctor: 'Dr. Carlos Pereira', date: '24 de Setembro de 2025' },
]

interface Props {
  history: {
    id: string
    psychologistName: string
    date: string
    status: string
  }[]
}

export function RecentHistory({ history }: Props) {
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-slate-50">
        <div>
          <CardTitle className="text-lg font-semibold text-slate-900">Histórico Recente</CardTitle>
          <CardDescription>Suas últimas atividades na plataforma</CardDescription>
        </div>
        <Link href="/dashboard/sessoes">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs font-semibold"
          >
            Ver Tudo
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-50">
          {history.map((session) => (
            <div
              key={session.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    Sessão com {session.psychologistName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-slate-500 truncate">{session.date}</p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-tight ${
                        session.status === 'completed'
                          ? 'bg-green-50 text-green-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {session.status === 'completed' ? 'Concluída' : session.status}
                    </span>
                  </div>
                </div>
              </div>
              <SessionSummaryDialog session={session}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 text-xs font-medium h-8 w-8 rounded-full p-0"
                >
                  &rarr;
                </Button>
              </SessionSummaryDialog>
            </div>
          ))}
          {history.length === 0 && (
            <div className="p-12 text-center text-slate-500 bg-white">
              <p className="text-sm">Nenhuma sessão recente encontrada.</p>
            </div>
          )}
        </div>
        {history.length > 0 && (
          <div className="p-3 border-t border-slate-50 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-slate-500 hover:text-slate-900 text-xs font-medium"
              asChild
            >
              <Link href="/dashboard/sessoes">Exibir histórico completo</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
