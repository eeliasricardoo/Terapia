"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Smile, MessageSquare } from "lucide-react"
import { RoomChat } from "@/components/video/RoomChat"
import { RoomRecord } from "@/components/video/RoomRecord"
import { cn } from "@/lib/utils"

interface RoomSidebarProps {
    isPsychologist?: boolean;
}

export function RoomSidebar({ isPsychologist }: RoomSidebarProps) {
    return (
        <div className="flex-1 bg-white border-l border-slate-200 flex flex-col min-w-[350px] max-w-[450px]">
            <Tabs defaultValue={isPsychologist ? "record" : "chat"} className="flex-1 flex flex-col">
                <div className="px-4 pt-4 pb-2 border-b border-slate-100 bg-slate-50/50">
                    <TabsList className={cn("grid w-full", isPsychologist ? "grid-cols-3" : "grid-cols-1")}>
                        {isPsychologist && (
                            <>
                                <TabsTrigger value="record" className="text-xs">
                                    <FileText className="h-3.5 w-3.5 mr-2" />
                                    Prontuário
                                </TabsTrigger>
                                <TabsTrigger value="notes" className="text-xs">
                                    <Smile className="h-3.5 w-3.5 mr-2" />
                                    Evolução
                                </TabsTrigger>
                            </>
                        )}
                        <TabsTrigger value="chat" className="text-xs">
                            <MessageSquare className="h-3.5 w-3.5 mr-2" />
                            Chat
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 flex flex-col bg-slate-50/30 overflow-hidden relative">
                    {isPsychologist && (
                        <RoomRecord />
                    )}

                    <TabsContent value="chat" className="m-0 flex-1 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden">
                        <RoomChat />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
