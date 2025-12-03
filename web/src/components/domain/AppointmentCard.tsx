import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentCardProps {
    date: string;
    time: string;
    personName: string;
    personRole: "Psicólogo" | "Paciente";
    status: "confirmed" | "pending" | "completed" | "canceled";
    imageUrl?: string;
    videoLink?: string;
    onCancel?: () => void;
}

export function AppointmentCard({
    date,
    time,
    personName,
    personRole,
    status,
    imageUrl,
    videoLink,
    onCancel,
}: AppointmentCardProps) {
    const statusConfig = {
        confirmed: { label: "Confirmado", variant: "default" as const, color: "bg-green-500" },
        pending: { label: "Pendente", variant: "secondary" as const, color: "bg-yellow-500" },
        completed: { label: "Concluído", variant: "outline" as const, color: "bg-blue-500" },
        canceled: { label: "Cancelado", variant: "destructive" as const, color: "bg-red-500" },
    };

    const config = statusConfig[status];

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{date}</span>
                    <span className="mx-1">•</span>
                    <Clock className="h-4 w-4" />
                    <span>{time}</span>
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={imageUrl} alt={personName} />
                        <AvatarFallback>{personName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{personRole}</p>
                        <h4 className="text-lg font-bold font-heading">{personName}</h4>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-4 pt-2">
                {status === "confirmed" && videoLink ? (
                    <Button className="w-full gap-2" asChild>
                        <a href={videoLink} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4" />
                            Entrar na Sala
                        </a>
                    </Button>
                ) : (
                    <Button variant="outline" className="w-full" disabled>
                        Ver Detalhes
                    </Button>
                )}
                {status !== "canceled" && status !== "completed" && (
                    <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
