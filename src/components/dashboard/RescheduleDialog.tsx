"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

interface RescheduleDialogProps {
    children: React.ReactNode
    session: {
        id: number
        doctor: string
        date: string
        time: string
    }
}

export function RescheduleDialog({ children, session }: RescheduleDialogProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reagendar Sessão</DialogTitle>
                    <DialogDescription>
                        Escolha uma nova data e horário para sua sessão com {session.doctor}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Nova Data</label>
                        <div className="border rounded-md p-2 flex justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Novo Horário</label>
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um horário" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="09:00">09:00 - 09:50</SelectItem>
                                <SelectItem value="10:00">10:00 - 10:50</SelectItem>
                                <SelectItem value="14:00">14:00 - 14:50</SelectItem>
                                <SelectItem value="15:00">15:00 - 15:50</SelectItem>
                                <SelectItem value="16:00">16:00 - 16:50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={() => setOpen(false)}>Confirmar Reagendamento</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
