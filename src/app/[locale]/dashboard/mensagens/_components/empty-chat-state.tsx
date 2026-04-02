'use client'

import { MessageSquare, ShieldCheck } from 'lucide-react'

export function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-8 bg-slate-50/30 relative overflow-hidden">
      {/* Background decoration to match the platform's aesthetics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-100/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative group transition-transform duration-700 hover:scale-105">
        <div className="h-24 w-24 rounded-[2rem] bg-white flex items-center justify-center border border-slate-100 shadow-xl shadow-slate-200/50 relative z-10">
          <MessageSquare className="h-10 w-10 text-slate-900" />
        </div>
        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white border-4 border-slate-50 flex items-center justify-center shadow-md z-20">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      <div className="max-w-sm relative z-10 space-y-4">
        <h3 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
          Seu Chat Direto
        </h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">
          Selecione uma conversa ao lado para começar a trocar mensagens seguras com seu terapeuta
          ou paciente. Nossa plataforma garante total privacidade.
        </p>
      </div>

      <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-slate-300 mt-6 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
        <ShieldCheck className="h-3 w-3" />
        Mensagens Criptografadas
      </div>
    </div>
  )
}
