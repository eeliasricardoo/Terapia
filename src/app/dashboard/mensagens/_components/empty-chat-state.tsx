"use client"

import { Send } from "lucide-react"

export function EmptyChatState() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-4 bg-slate-50/30">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-100 animate-bounce">
                <Send className="h-10 w-10 text-white" />
            </div>
            <div className="max-w-xs">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Seu Chat Direto</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Selecione uma conversa para trocar mensagens realistas e seguras com seu terapeuta ou paciente.
                </p>
            </div>
        </div>
    )
}
