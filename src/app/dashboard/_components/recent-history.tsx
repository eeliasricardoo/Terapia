'use client'

import { Calendar as CalendarIcon, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { SessionSummaryDialog } from '@/components/dashboard/SessionSummaryDialog'

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
    <div className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 italic">Histórico Recente</h3>
        <Link href="/dashboard/sessoes">
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-0"
          >
            Ver tudo &rarr;
          </Button>
        </Link>
      </div>
      <div className="p-0">
        <div className="divide-y divide-slate-50">
          {history.map((session) => (
            <div
              key={session.id}
              className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                  <CalendarIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">
                    {session.psychologistName}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                    {session.date}
                  </p>
                </div>
              </div>
              <SessionSummaryDialog session={session}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 flex items-center justify-center text-slate-300 group-hover:text-slate-900"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </SessionSummaryDialog>
            </div>
          ))}
          {history.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-white">
              <p className="text-xs font-medium italic">Nenhuma sessão recente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
