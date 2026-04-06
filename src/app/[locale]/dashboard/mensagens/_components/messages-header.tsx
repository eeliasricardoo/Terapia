'use client'

import { MessageSquare, ShieldCheck, Zap } from 'lucide-react'

export function MessagesHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Mensagens</h1>
        <p className="text-sm font-medium text-slate-500">
          Troque mensagens seguras com seu terapeuta ou paciente em tempo real.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl ring-1 ring-slate-100/10 shadow-sm border border-slate-50">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">
              Segurança
            </span>
            <span className="text-sm font-semibold text-slate-900">Criptografado</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl ring-1 ring-slate-100/10 shadow-sm border border-slate-50">
          <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">
              Status
            </span>
            <span className="text-sm font-semibold text-slate-900">Em tempo real</span>
          </div>
        </div>
      </div>
    </div>
  )
}
