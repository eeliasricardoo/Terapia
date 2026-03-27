'use client'

import { Paperclip, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface MessageInputProps {
  value: string
  onChange: (val: string) => void
  onSend: () => void
  isSending: boolean
}

export function MessageInput({ value, onChange, onSend, isSending }: MessageInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (value.trim()) {
        e.preventDefault()
        onSend()
      }
    }
  }

  return (
    <div className="flex items-center gap-4 max-w-5xl mx-auto">
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 text-slate-300 hover:text-slate-900 hover:bg-slate-100/50 transition-all shrink-0 rounded-2xl"
      >
        <Paperclip className="h-5 w-5" />
      </Button>
      <div className="flex-1 relative flex items-center">
        <textarea
          placeholder="Escreva sua mensagem segura..."
          className="w-full bg-white border border-slate-100 rounded-3xl py-3.5 pl-5 pr-14 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-200 transition-all text-[13px] font-medium resize-none max-h-32 scrollbar-none placeholder:text-slate-300 shadow-sm"
          value={value}
          rows={1}
          onChange={(e) => {
            onChange(e.target.value)
            // Auto resize
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />
        <Button
          size="icon"
          className={cn(
            'absolute right-1.5 h-10 w-10 rounded-2xl transition-all duration-500 active:scale-95',
            value.trim()
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
              : 'bg-slate-50 text-slate-300 border border-slate-100'
          )}
          onClick={onSend}
          disabled={!value.trim() || isSending}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send
              className={cn(
                'h-4 w-4 transition-transform duration-500',
                value.trim() && 'translate-x-0.5 -translate-y-0.5'
              )}
            />
          )}
        </Button>
      </div>
    </div>
  )
}
