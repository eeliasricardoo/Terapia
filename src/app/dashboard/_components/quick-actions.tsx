'use client'

import { FileText, ArrowRight } from 'lucide-react'
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
              className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all"
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
    </div>
  )
}
