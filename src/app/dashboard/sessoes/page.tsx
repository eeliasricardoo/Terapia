import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, FileText, Download } from "lucide-react"
import { ReceiptDialog } from "@/components/dashboard/ReceiptDialog"
import { RescheduleDialog } from "@/components/dashboard/RescheduleDialog"

// TODO: Replace with real session data when sessions table is created
// Mock data for sessions
const SESSIONS = [
    {
        id: 1,
        doctor: "Dra. Ana María Rojas",
        role: "Psicóloga Clínica",
        date: "12 de Dezembro, 2025",
        time: "14:00 - 14:50",
        status: "upcoming",
        image: "/avatars/01.png",
    },
    {
        id: 2,
        doctor: "Dra. Ana María Rojas",
        role: "Psicóloga Clínica",
        date: "05 de Dezembro, 2025",
        time: "14:00 - 14:50",
        status: "completed",
        image: "/avatars/01.png",
    },
    {
        id: 3,
        doctor: "Dr. Carlos Fuentes",
        role: "Terapia de Casal",
        date: "28 de Novembro, 2025",
        time: "10:00 - 10:50",
        status: "completed",
        image: "/avatars/02.png",
    },
]

export default function SessionsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Minhas Sessões</h1>
                <p className="text-muted-foreground">Gerencie seus agendamentos e histórico de consultas.</p>
            </div>

            <div className="space-y-4">
                {SESSIONS.map((session) => (
                    <Card key={session.id}>
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                {/* Date Box */}
                                <div className="flex-shrink-0 w-full md:w-auto flex md:flex-col items-center justify-center bg-slate-50 rounded-lg border p-4 min-w-[100px] gap-2 md:gap-0">
                                    <Calendar className="h-5 w-5 text-muted-foreground mb-1 md:block hidden" />
                                    <span className="text-2xl font-bold text-primary">{session.date.split(' ')[0]}</span>
                                    <span className="text-xs font-medium uppercase text-muted-foreground">{session.date.split(' ')[2].substring(0, 3)}</span>
                                </div>

                                {/* Session Info */}
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-lg">{session.doctor}</h3>
                                        {session.status === 'upcoming' && (
                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">Agendada</Badge>
                                        )}
                                        {session.status === 'completed' && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Realizada</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{session.role}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" /> {session.time}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Video className="h-4 w-4" /> Online
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                    {session.status === 'upcoming' ? (
                                        <>
                                            <RescheduleDialog session={session}>
                                                <Button variant="outline" className="w-full md:w-auto">Reagendar</Button>
                                            </RescheduleDialog>
                                            <Button className="w-full md:w-auto gap-2">
                                                <Video className="h-4 w-4" />
                                                Entrar
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <ReceiptDialog session={session}>
                                                <Button variant="ghost" size="sm" className="w-full md:w-auto text-muted-foreground">
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Recibo
                                                </Button>
                                            </ReceiptDialog>
                                            <Button variant="outline" size="sm" className="w-full md:w-auto">
                                                Agendar Novamente
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
