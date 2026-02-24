"use client"

import { useState, useCallback } from "react"
import { useDaily, useAppMessage } from "@daily-co/daily-react"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export function RoomChat() {
    const daily = useDaily()
    const [messages, setMessages] = useState<{ sender: string, text: string, time: string }[]>([])
    const [newMessage, setNewMessage] = useState("")

    const handleAppMessage = useCallback((e: any) => {
        if (e && e.data && e.data.message) {
            const senderName = e.fromId && daily ? daily.participants()[e.fromId]?.user_name || 'Participante' : 'Participante';
            setMessages((prev) => [...prev, {
                sender: senderName,
                text: e.data.message,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
        }
    }, [daily])

    const sendAppMessage = useAppMessage({
        onAppMessage: handleAppMessage,
    })

    const handleSendMessage = () => {
        if (!newMessage.trim()) return
        sendAppMessage({ message: newMessage })
        setMessages((prev) => [...prev, {
            sender: 'Você',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }])
        setNewMessage("")
    }

    return (
        <div className="m-0 flex-1 flex flex-col overflow-hidden h-full">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col h-full items-center justify-center text-slate-400 grayscale opacity-70">
                        <MessageSquare className="h-10 w-10 mb-2" />
                        <p className="text-sm">Nenhuma mensagem no chat.</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={cn("text-sm p-3 rounded-lg max-w-[85%]", msg.sender === 'Você' ? "bg-blue-100 text-blue-900 self-end ml-auto" : "bg-slate-100 text-slate-900 self-start mr-auto")}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-xs opacity-75">{msg.sender}</span>
                                <span className="text-[10px] opacity-50 ml-2">{msg.time}</span>
                            </div>
                            <p>{msg.text}</p>
                        </div>
                    ))
                )}
            </div>
            <div className="p-4 bg-white border-t border-slate-100 flex gap-2 shrink-0">
                <input
                    type="text"
                    placeholder="Digite uma mensagem..."
                    className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} size="icon" className="rounded-full shrink-0">
                    <MessageSquare className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
