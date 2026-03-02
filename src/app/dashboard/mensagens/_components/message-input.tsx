"use client"

import { Paperclip, Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MessageInputProps {
    value: string
    onChange: (val: string) => void
    onSend: () => void
    isSending: boolean
}

export function MessageInput({
    value,
    onChange,
    onSend,
    isSending
}: MessageInputProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            onSend()
        }
    }

    return (
        <div className="p-4 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                </div>
                <div className="flex-1 relative">
                    <Input
                        placeholder="Digite sua mensagem profissional..."
                        className="h-12 flex-1 border-slate-200 rounded-2xl pr-12 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isSending}
                    />
                    <Button
                        size="icon"
                        className={`absolute right-1 top-1 h-10 w-10 rounded-xl transition-all ${value.trim() ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-400'}`}
                        onClick={onSend}
                        disabled={!value.trim() || isSending}
                    >
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
