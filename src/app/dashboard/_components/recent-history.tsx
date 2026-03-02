"use client"

import { Calendar as CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SessionSummaryDialog } from "@/components/dashboard/SessionSummaryDialog"

const HISTORY = [
    { id: 1, doctor: "Dr. Carlos Pereira", date: "08 de Outubro de 2025" },
    { id: 2, doctor: "Dr. Carlos Pereira", date: "01 de Outubro de 2025" },
    { id: 3, doctor: "Dr. Carlos Pereira", date: "24 de Setembro de 2025" },
]

export function RecentHistory() {
    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-3 border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg">Histórico Recente</CardTitle>
                    <CardDescription>Suas últimas atividades na plataforma</CardDescription>
                </div>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium">
                    Ver Tudo
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y">
                    {HISTORY.map((session) => (
                        <div key={session.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                                <div className="h-10 w-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                    <CalendarIcon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-slate-900 truncate">Sessão com {session.doctor}</p>
                                    <p className="text-sm text-muted-foreground truncate">{session.date}</p>
                                </div>
                            </div>
                            <SessionSummaryDialog session={session}>
                                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium">
                                    Ver Resumo
                                </Button>
                            </SessionSummaryDialog>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t text-center">
                    <Button variant="link" className="text-blue-600" asChild>
                        <Link href="/dashboard/sessoes">Ver todo o histórico</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
