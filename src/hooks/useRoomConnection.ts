"use client"

import { useState, useEffect } from "react"
import DailyIframe, { DailyCall } from "@daily-co/daily-js"

export interface AppointmentInfo {
    scheduledAt: string;
    durationMinutes: number;
    isPsychologist: boolean;
}

export function useRoomConnection(appointmentId: string) {
    const [roomUrl, setRoomUrl] = useState<string | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [appointmentInfo, setAppointmentInfo] = useState<AppointmentInfo | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [callObject, setCallObject] = useState<DailyCall | null>(null)

    // Fetch Token
    useEffect(() => {
        async function init() {
            try {
                const res = await fetch("/api/video/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ appointmentId })
                })

                if (!res.ok) {
                    const errorText = await res.text()
                    let errorMessage = errorText || "Falha ao obter token da sala"
                    try {
                        const errorJson = JSON.parse(errorText)
                        if (errorJson.error) {
                            errorMessage = errorJson.error
                        }
                    } catch (e) {
                        // Ignore parse error, use original text
                    }
                    throw new Error(errorMessage)
                }

                const data = await res.json()
                setRoomUrl(data.url)
                setToken(data.token)
                setAppointmentInfo({
                    scheduledAt: data.scheduledAt,
                    durationMinutes: data.durationMinutes,
                    isPsychologist: data.isPsychologist
                })
            } catch (err: any) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }
        init()
    }, [appointmentId])

    useEffect(() => {
        if (!roomUrl || !token) return

        let co = (DailyIframe as any).getCallInstance();

        if (!co) {
            co = DailyIframe.createCallObject({
                url: roomUrl,
                token: token,
                audioSource: true,
                videoSource: true,
            })
        }

        setCallObject(co)

        return () => {
            if (co) {
                co.destroy().catch((e: any) => console.error("Error destroying daily", e))
            }
        }
    }, [roomUrl, token])

    return {
        appointmentInfo,
        error,
        isLoading: isLoading || !roomUrl || !token,
        callObject
    }
}
