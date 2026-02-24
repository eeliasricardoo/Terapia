"use client"

import { User } from "lucide-react"
import { VideoTile } from "@/components/video/VideoTile"
import { useParticipantIds, useLocalParticipant } from "@daily-co/daily-react"

export function VideoStage() {
    const localParticipant = useLocalParticipant()
    const remoteParticipantIds = useParticipantIds({ filter: "remote" })

    return (
        <>
            {/* Main Stage (Usually Remote) */}
            <div className="flex-1 w-full flex items-center justify-center p-4">
                <div className="w-full max-w-5xl flex items-center justify-center h-full">
                    {remoteParticipantIds.length > 0 ? (
                        remoteParticipantIds.map((id) => (
                            <div key={id} className="w-full h-full max-h-[calc(100vh-200px)] aspect-video">
                                <VideoTile
                                    sessionId={id}
                                    className="w-full h-full rounded-2xl border border-slate-800 shadow-2xl"
                                />
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 space-y-4 animate-pulse">
                            <div className="h-32 w-32 rounded-full bg-slate-800 flex items-center justify-center">
                                <User className="h-16 w-16 opacity-50" />
                            </div>
                            <p>Aguardando o outro participante entrar...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Local User (Picture-in-Picture Style) */}
            <div className="absolute top-4 right-4 w-48 aspect-video shadow-2xl z-20">
                {localParticipant && (
                    <VideoTile
                        sessionId={localParticipant.session_id}
                        isLocal
                        className="w-full h-full rounded-xl border-2 border-slate-700 bg-slate-800"
                    />
                )}
            </div>
        </>
    )
}
