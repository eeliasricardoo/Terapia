"use client"

import { useTransmission } from "./_hooks/use-transmission"
import { TransmissionHeader } from "./_components/transmission-header"
import { VideoStage } from "./_components/video-stage"
import { TransmissionControls } from "./_components/transmission-controls"
import { SessionChat } from "./_components/session-chat"

export default function TransmissionPage() {
    const {
        isMicOn, toggleMic,
        isVideoOn, toggleVideo,
        isChatOpen, toggleChat,
        elapsedTime, formatTime,
        viewMode, setViewMode
    } = useTransmission()

    return (
        <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden text-zinc-100">
            <TransmissionHeader
                elapsedTime={elapsedTime}
                formatTime={formatTime}
                isChatOpen={isChatOpen}
                toggleChat={toggleChat}
            />

            <main className="flex-1 flex overflow-hidden relative">
                <VideoStage
                    isMicOn={isMicOn}
                    isVideoOn={isVideoOn}
                    viewMode={viewMode}
                    isChatOpen={isChatOpen}
                />

                <TransmissionControls
                    isMicOn={isMicOn}
                    toggleMic={toggleMic}
                    isVideoOn={isVideoOn}
                    toggleVideo={toggleVideo}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isChatOpen={isChatOpen}
                    toggleChat={toggleChat}
                />

                <SessionChat
                    isChatOpen={isChatOpen}
                    toggleChat={toggleChat}
                />
            </main>
        </div>
    )
}
