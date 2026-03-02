"use client"

import { Calendar as CalendarIcon, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { SessionDetailsDialog } from "@/components/dashboard/SessionDetailsDialog"

export function NextSessionHero() {
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-2 border-none shadow-md overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10 hidden md:block">
                <CalendarIcon className="h-32 w-32 text-blue-600" />
            </div>
            <div className="flex flex-col md:flex-row h-full">
                <div className="p-8 flex-1">
                    <div className="inline-flex items-center rounded-full border border-blue-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-700 mb-4">
                        Próxima Sessão
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Terapia Individual</h2>
                    <p className="text-slate-500 mb-6 flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Hoje, 14:00 - 14:50
                    </p>

                    <div className="flex items-center gap-4 mb-8">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarImage src="/avatars/01.png" />
                            <AvatarFallback>SP</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium text-slate-900">Dra. Sofía Pérez</p>
                            <p className="text-xs text-slate-500">Psicóloga Clínica</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <SessionDetailsDialog>
                            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800">
                                Detalhes
                            </Button>
                        </SessionDetailsDialog>
                        <Button className="bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                            Entrar na Sala
                        </Button>
                    </div>
                </div>
                <div className="w-full md:w-1/3 bg-blue-50 relative min-h-[200px]">
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                        <p className="text-sm text-blue-800 italic">"O autoconhecimento é o começo de toda sabedoria."</p>
                    </div>
                </div>
            </div>
        </Card>
    )
}
