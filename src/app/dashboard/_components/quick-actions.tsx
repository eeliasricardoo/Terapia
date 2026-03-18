'use client'

import { FileText, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function QuickActions() {
  return (
    <div className="space-y-4">
      <Link href="/dashboard/diario" className="block">
        <div className="group bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all"
              aria-hidden="true"
            >
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                Diário
              </h3>
              <p className="text-xs font-medium text-slate-500">Suas notas pessoais</p>
            </div>
          </div>
          <ArrowRight
            className="h-4 w-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all"
            aria-hidden="true"
          />
        </div>
      </Link>

      <Link href="/dashboard/bem-estar" className="block">
        <div className="group bg-slate-900 p-6 rounded-[2rem] shadow-lg shadow-slate-200 hover:translate-y-[-2px] transition-all flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm"
              aria-hidden="true"
            >
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-bold text-white">Bem-estar</h3>
              <p className="text-xs font-medium text-slate-300">Conteúdos exclusivos</p>
            </div>
          </div>
          <ArrowRight
            className="h-4 w-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all"
            aria-hidden="true"
          />
        </div>
      </Link>
    </div>
  )
}
