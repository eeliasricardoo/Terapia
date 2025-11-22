"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

interface Appointment {
    id: string;
    date: Date;
    status: string;
    therapist?: {
        user: {
            name: string | null;
        };
    };
    user?: {
        name: string | null;
    };
}

interface AppointmentListProps {
    appointments: Appointment[];
    role: "PATIENT" | "THERAPIST";
}

export function AppointmentList({ appointments, role }: AppointmentListProps) {
    if (appointments.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <Calendar className="h-10 w-10 mb-2 opacity-20" />
                    <p>Nenhuma consulta agendada.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((apt) => (
                <Card key={apt.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 bg-muted/30">
                        <div className="flex justify-between items-start">
                            <Badge
                                variant={apt.status === "CONFIRMED" ? "default" : "secondary"}
                                className={apt.status === "CONFIRMED" ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                                {apt.status === "CONFIRMED" ? "Confirmado" : apt.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                                #{apt.id.slice(-4)}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium capitalize">
                                    {format(new Date(apt.date), "EEEE, d 'de' MMMM", { locale: es })}
                                </p>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {format(new Date(apt.date), "HH:mm", { locale: es })}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t justify-between">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {role === "PATIENT"
                                        ? `Esp. ${apt.therapist?.user.name}`
                                        : `Pac. ${apt.user?.name}`}
                                </span>
                            </div>

                            {apt.status === "CONFIRMED" && (
                                <Button asChild size="sm" variant="outline" className="h-8 text-xs border-primary/20 hover:bg-primary/5 hover:text-primary">
                                    <Link href={`/room/${apt.id}`} target="_blank">
                                        Entrar na Sala
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
