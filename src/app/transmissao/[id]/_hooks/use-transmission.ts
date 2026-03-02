"use client"

import { useState, useEffect, useCallback } from "react"

export function useTransmission() {
    const [isMicOn, setIsMicOn] = useState(true)
    const [isVideoOn, setIsVideoOn] = useState(true)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [viewMode, setViewMode] = useState<'grid' | 'speaker'>('grid')

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1)
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = useCallback((seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }, [])

    const toggleMic = () => setIsMicOn(prev => !prev)
    const toggleVideo = () => setIsVideoOn(prev => !prev)
    const toggleChat = () => setIsChatOpen(prev => !prev)

    return {
        isMicOn, toggleMic,
        isVideoOn, toggleVideo,
        isChatOpen, setIsChatOpen, toggleChat,
        elapsedTime, formatTime,
        viewMode, setViewMode
    }
}
