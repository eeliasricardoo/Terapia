"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { bookSession } from "@/features/booking/actions";
import { useFormState } from "react-dom";

// Mock time slots
const TIME_SLOTS = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"
];

export function BookingCalendar({ therapistId }: { therapistId: string }) {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [time, setTime] = React.useState<string | null>(null);
    const [state, formAction] = useFormState(bookSession, null);
    const [isPending, startTransition] = React.useTransition();

    const handleBook = () => {
        if (!date || !time) return;

        // Combine date and time
        const [hours, minutes] = time.split(":").map(Number);
        const bookingDate = new Date(date);
        bookingDate.setHours(hours, minutes);

        const formData = new FormData();
        formData.append("therapistId", therapistId);
        formData.append("date", bookingDate.toISOString());

        startTransition(() => {
            formAction(formData);
        });
    };

    if (state?.success) {
        return (
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
                <h3 className="text-lg font-bold text-green-800 mb-2">Agendamento Confirmado!</h3>
                <p className="text-green-700">{state.message}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Agendar outro
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-2">
                <h3 className="font-semibold">Selecione uma data</h3>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border w-full flex justify-center"
                    locale={es}
                    disabled={(date) => date < new Date()}
                />
            </div>

            {date && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-semibold">Horários Disponíveis</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {TIME_SLOTS.map((slot) => (
                            <Button
                                key={slot}
                                variant={time === slot ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTime(slot)}
                                className={cn("w-full", time === slot && "bg-primary text-primary-foreground")}
                            >
                                {slot}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <div className="pt-4 border-t mt-4">
                <Button
                    className="w-full"
                    size="lg"
                    disabled={!date || !time || isPending}
                    onClick={handleBook}
                >
                    {isPending ? "Processando..." : "Confirmar e Pagar (ou usar Créditos)"}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-2">
                    Ao confirmar, você concorda com os termos de serviço.
                </p>
            </div>
        </div>
    );
}
