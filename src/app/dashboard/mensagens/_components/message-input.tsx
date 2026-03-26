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
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 max-w-5xl mx-auto">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-muted-foreground hover:text-primary transition-colors shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <div className="flex-1 relative">
          <Input
            placeholder="Escreva sua mensagem segura..."
            className="h-12 flex-1 bg-muted/20 border-border/50 rounded-2xl pr-12 focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending}
          />
          <Button
            size="icon"
            className={cn(
              'absolute right-1 top-1 h-10 w-10 rounded-xl transition-all duration-300',
              value.trim()
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                : 'bg-muted text-muted-foreground opacity-50'
            )}
            onClick={onSend}
            disabled={!value.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 fill-current" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
