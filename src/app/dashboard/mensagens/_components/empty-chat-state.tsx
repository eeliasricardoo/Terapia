'use client'

import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyChatState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-6 bg-muted/10 relative overflow-hidden">
      {/* Background decoration to match the platform's aesthetics */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 shadow-sm">
          <MessageSquare className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border-2 border-muted flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      <div className="max-w-xs relative z-10">
        <h3 className="text-2xl font-heading font-bold text-foreground mb-3">Seu Chat Direto</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Selecione uma conversa ao lado para começar a trocar mensagens seguras com seu terapeuta
          ou paciente.
        </p>
      </div>

      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-muted-foreground/50 mt-4">
        <div className="h-px w-8 bg-border" />
        Mensagens Criptografadas
        <div className="h-px w-8 bg-border" />
      </div>
    </div>
  )
}
