import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Mic, MicOff, Video as VideoIcon, VideoOff, MessageSquare, Settings } from 'lucide-react'

interface RoomControlsProps {
  isMicOn: boolean
  isCamOn: boolean
  isChatOpen?: boolean
  onToggleMic: () => void
  onToggleCam: () => void
  onToggleChat?: () => void
}

export function RoomControls({
  isMicOn,
  isCamOn,
  isChatOpen,
  onToggleMic,
  onToggleCam,
  onToggleChat,
}: RoomControlsProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl flex items-center gap-1 shadow-sm max-w-fit mx-auto transition-all">
      {/* Mic Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-12 w-12 rounded-xl transition-all active:scale-95',
          isMicOn
            ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
        )}
        onClick={onToggleMic}
      >
        {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>

      {/* Camera Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-12 w-12 rounded-xl transition-all active:scale-95',
          isCamOn
            ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
        )}
        onClick={onToggleCam}
      >
        {isCamOn ? <VideoIcon className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>

      {/* Chat Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-12 w-12 rounded-xl transition-all active:scale-95',
          isChatOpen
            ? 'bg-zinc-100 text-zinc-950 hover:bg-white'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        )}
        onClick={onToggleChat}
      >
        <MessageSquare className="h-5 w-5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all active:scale-95"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  )
}
