import { User, Loader2 } from 'lucide-react'
import { VideoTile } from '@/components/video/VideoTile'
import { useParticipantIds, useLocalParticipant } from '@daily-co/daily-react'
import { cn } from '@/lib/utils'

export function VideoStage() {
  const localParticipant = useLocalParticipant()
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' })

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Main Stage (Usually Remote) */}
      <div className="flex-1 w-full flex items-center justify-center p-6">
        <div className="w-full max-w-6xl h-full flex items-center justify-center">
          {remoteParticipantIds.length > 0 ? (
            remoteParticipantIds.map((id) => (
              <div key={id} className="w-full h-full max-h-[85vh] aspect-video">
                <VideoTile sessionId={id} className="w-full h-full border-none shadow-2xl" />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 space-y-6 select-none animate-in fade-in zoom-in duration-700">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="h-40 w-40 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow-inner relative z-10 transition-transform hover:scale-105">
                  <User className="h-20 w-20 opacity-30 text-blue-400" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-slate-700 p-2 rounded-full shadow-lg z-20">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              </div>
              <div className="text-center space-y-2 max-w-sm">
                <p className="text-xl font-semibold text-slate-200">Aguardando o paciente...</p>
                <p className="text-sm text-slate-500">
                  A sessão começará assim que o outro participante entrar na sala.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Local User (Picture-in-Picture Style) */}
      <div
        className={cn(
          'absolute transition-all duration-500 z-30',
          remoteParticipantIds.length > 0
            ? 'top-8 right-8 w-60 aspect-video'
            : 'top-8 right-8 w-60 aspect-video shadow-2xl'
        )}
      >
        {localParticipant && (
          <VideoTile
            sessionId={localParticipant.session_id}
            isLocal
            className="w-full h-full rounded-2xl border-2 border-white/10 shadow-2xl bg-slate-900 group"
          />
        )}
      </div>
    </div>
  )
}
