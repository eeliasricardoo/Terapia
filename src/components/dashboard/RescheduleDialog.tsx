"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { addDays, format, startOfToday, startOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RescheduleDialogProps {
    children: React.ReactNode
    session: {
        id: number
        doctor: string
        role: string
        image: string
        date: string
        time: string
    }
}

// Mock times
const TIMES = [
    "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30"
]

export function RescheduleDialog({ children, session }: RescheduleDialogProps) {
    const [open, setOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [startIndex, setStartIndex] = useState(0)

    const today = startOfToday()
    const startDate = startOfWeek(today, { weekStartsOn: 0 }) // Sunday
    const visibleDates = Array.from({ length: 7 }).map((_, i) => addDays(startDate, startIndex + i))

    const handlePrevDate = () => {
        if (startIndex > 0) {
            setStartIndex((prev) => Math.max(0, prev - 7))
        }
    }

    const handleNextDate = () => {
        setStartIndex((prev) => prev + 7)
    }

    const formatDate = (date: Date, formatStr: string) => {
        return format(date, formatStr, { locale: ptBR })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden gap-0">
                <div className="flex flex-col md:flex-row h-[600px] md:h-[550px]">
                    {/* Left Side - Profile Info */}
                    <div className="w-full md:w-1/3 bg-slate-50 p-6 flex flex-col border-r">
                        <div className="flex items-start gap-4 mb-4">
                            <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                                <AvatarImage src={session.image} />
                                <AvatarFallback>{session.doctor.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-bold text-lg leading-tight">{session.doctor}</h3>
                                <p className="text-sm text-muted-foreground">{session.role}</p>
                                <p className="text-xs text-muted-foreground mt-1">CRP: 04/51372</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            <Badge variant="secondary" className="font-normal text-xs">Autoestima</Badge>
                            <Badge variant="secondary" className="font-normal text-xs">Ansiedade</Badge>
                            <Badge variant="secondary" className="font-normal text-xs">TCC</Badge>
                        </div>

                        <div className="mt-auto space-y-4">
                            <div className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold">4.9</span>
                                <span className="text-muted-foreground">(204 comentários)</span>
                            </div>

                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm text-muted-foreground">Sessão 50 min</span>
                                    <div className="text-right">
                                        <span className="text-xs text-muted-foreground line-through block">R$ 150</span>
                                        <span className="text-xl font-bold text-green-600">R$ 0</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Calendar & Time */}
                    <div className="flex-1 p-6 flex flex-col bg-white">
                        {/* Date Carousel */}
                        <div className="flex items-center justify-between mb-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handlePrevDate}
                                disabled={startIndex === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1 justify-center px-1">
                                {visibleDates.map((date) => {
                                    const isSelected = selectedDate && format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                                    return (
                                        <button
                                            key={date.toISOString()}
                                            onClick={() => setSelectedDate(date)}
                                            className={`flex flex-col items-center justify-center min-w-[60px] p-2 rounded-lg border transition-all ${isSelected
                                                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                                : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-200'
                                                }`}
                                        >
                                            <span className="text-[10px] font-medium uppercase text-muted-foreground/80">
                                                {formatDate(date, 'EEE').replace('.', '')}
                                            </span>
                                            <span className="text-xl font-bold">{format(date, 'dd')}</span>
                                            <span className="text-[10px] uppercase text-muted-foreground/80">
                                                {formatDate(date, 'MMM').replace('.', '')}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleNextDate}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Banner */}
                        <div className="bg-primary text-primary-foreground text-center py-2 rounded-md text-sm font-medium mb-6 shadow-sm">
                            Próximo horário: hoje, 14:00
                        </div>

                        {/* Time Slots */}
                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {TIMES.map((time) => (
                                    <Button
                                        key={time}
                                        variant={selectedTime === time ? "default" : "outline"}
                                        className={`w-full ${selectedTime === time ? 'bg-primary text-primary-foreground' : 'hover:border-primary hover:text-primary'}`}
                                        onClick={() => setSelectedTime(time)}
                                    >
                                        {time}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="mt-6 flex justify-end items-center gap-4 pt-4 border-t">
                            <span className="text-sm text-muted-foreground hidden sm:inline-block">
                                {selectedDate && selectedTime
                                    ? `Selecionado: ${format(selectedDate, 'dd/MM')} às ${selectedTime}`
                                    : 'Selecione um horário'}
                            </span>
                            <Button disabled={!selectedTime || !selectedDate} onClick={() => setOpen(false)} className="w-full sm:w-auto">
                                Confirmar Reagendamento
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
