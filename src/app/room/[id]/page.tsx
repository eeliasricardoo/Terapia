"use client";

import { JitsiMeeting } from "@jitsi/react-sdk";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface RoomPageProps {
    params: {
        id: string;
    };
}

export default function RoomPage({ params }: RoomPageProps) {
    const router = useRouter();
    const roomName = `terapia-session-${params.id}`;

    return (
        <div className="h-[calc(100vh-4rem)] w-full bg-black flex flex-col">
            <JitsiMeeting
                domain="meet.jit.si"
                roomName={roomName}
                configOverwrite={{
                    startWithAudioMuted: true,
                    disableModeratorIndicator: true,
                    startScreenSharing: true,
                    enableEmailInStats: false,
                }}
                interfaceConfigOverwrite={{
                    DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                    TOOLBAR_BUTTONS: [
                        "microphone",
                        "camera",
                        "closedcaptions",
                        "desktop",
                        "fullscreen",
                        "fodeviceselection",
                        "hangup",
                        "profile",
                        "chat",
                        "recording",
                        "livestreaming",
                        "etherpad",
                        "sharedvideo",
                        "settings",
                        "raisehand",
                        "videoquality",
                        "filmstrip",
                        "invite",
                        "feedback",
                        "stats",
                        "shortcuts",
                        "tileview",
                        "videobackgroundblur",
                        "download",
                        "help",
                        "mute-everyone",
                        "security",
                    ],
                }}
                userInfo={{
                    displayName: "Usuário Terapia", // In a real app, pass the user's name here
                    email: "user@example.com" // Required by type definition
                }}
                onApiReady={(externalApi) => {
                    // here you can attach custom event listeners to the Jitsi Meet External API
                    // you can also store it locally to execute commands
                }}
                getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = "100%";
                }}
                spinner={() => (
                    <div className="flex items-center justify-center h-full text-white">
                        <Loader2 className="h-10 w-10 animate-spin mr-2" />
                        Carregando sala segura...
                    </div>
                )}
                onReadyToClose={() => {
                    router.push("/dashboard");
                }}
            />
        </div>
    );
}
