import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock } from "lucide-react";

interface PsychologistCardProps {
    name: string;
    specialty: string;
    rating: number;
    reviewCount: number;
    price: number;
    location?: string;
    nextAvailable?: string;
    imageUrl?: string;
    onSchedule?: () => void;
}

export function PsychologistCard({
    name,
    specialty,
    rating,
    reviewCount,
    price,
    location = "Online",
    nextAvailable,
    imageUrl,
    onSchedule,
}: PsychologistCardProps) {
    return (
        <Card className="w-full max-w-sm overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="p-0">
                <div className="relative h-32 bg-primary/10">
                    <div className="absolute -bottom-12 left-6">
                        <Avatar className="h-24 w-24 border-4 border-background">
                            <AvatarImage src={imageUrl} alt={name} />
                            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-14 pb-4 px-6 space-y-4">
                <div>
                    <h3 className="text-xl font-bold font-heading">{name}</h3>
                    <p className="text-sm text-muted-foreground">{specialty}</p>
                </div>

                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-medium">{rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{location}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                        <p className="text-xs text-muted-foreground">Valor da sessão</p>
                        <p className="text-lg font-bold text-primary">
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(price)}
                        </p>
                    </div>
                    {nextAvailable && (
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Próxima vaga</p>
                            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                                <Clock className="h-3 w-3" />
                                <span>{nextAvailable}</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-0">
                <Button className="w-full" onClick={onSchedule}>
                    Agendar Consulta
                </Button>
            </CardFooter>
        </Card>
    );
}
