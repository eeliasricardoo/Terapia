
"use client"

import { useDevices } from "@daily-co/daily-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Mic, Video, Volume2 } from "lucide-react"

export function DeviceSettings() {
    const {
        cameras,
        setCamera,
        currentCam,
        microphones,
        setMicrophone,
        currentMic,
        speakers,
        setSpeaker,
        currentSpeaker,
    } = useDevices()

    return (
        <div className="space-y-4 w-full">
            <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-600">
                    <Video className="h-4 w-4" /> Câmera
                </Label>
                <Select
                    value={currentCam?.device.deviceId}
                    onValueChange={(val) => setCamera(val)}
                >
                    <SelectTrigger className="bg-white border-slate-200">
                        <SelectValue placeholder="Selecione a câmera" />
                    </SelectTrigger>
                    <SelectContent>
                        {cameras.map((cam) => (
                            <SelectItem key={cam.device.deviceId} value={cam.device.deviceId}>
                                {cam.device.label || `Camera ${cam.device.deviceId.slice(0, 5)}...`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label className="flex items-center gap-2 text-slate-600">
                    <Mic className="h-4 w-4" /> Microfone
                </Label>
                <Select
                    value={currentMic?.device.deviceId}
                    onValueChange={(val) => setMicrophone(val)}
                >
                    <SelectTrigger className="bg-white border-slate-200">
                        <SelectValue placeholder="Selecione o microfone" />
                    </SelectTrigger>
                    <SelectContent>
                        {microphones.map((mic) => (
                            <SelectItem key={mic.device.deviceId} value={mic.device.deviceId}>
                                {mic.device.label || `Mic ${mic.device.deviceId.slice(0, 5)}...`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {speakers.length > 0 && (
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-slate-600">
                        <Volume2 className="h-4 w-4" /> Saída de Áudio
                    </Label>
                    <Select
                        value={currentSpeaker?.device.deviceId}
                        onValueChange={(val) => setSpeaker(val)}
                    >
                        <SelectTrigger className="bg-white border-slate-200">
                            <SelectValue placeholder="Selecione a saída de áudio" />
                        </SelectTrigger>
                        <SelectContent>
                            {speakers.map((spk) => (
                                <SelectItem key={spk.device.deviceId} value={spk.device.deviceId}>
                                    {spk.device.label || `Speaker ${spk.device.deviceId.slice(0, 5)}...`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}
