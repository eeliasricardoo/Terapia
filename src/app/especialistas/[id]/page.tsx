import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Clock, ShieldCheck, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingCalendar } from "@/components/booking/booking-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const dynamic = "force-dynamic";

export default async function TherapistProfilePage({ params }: { params: { id: string } }) {
    const therapist = await db.therapistProfile.findUnique({
        where: { id: params.id },
        include: {
            user: true,
            specialties: true,
        },
    });

    if (!therapist) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-muted/10 pb-12">
            {/* Header / Cover */}
            <div className="bg-primary/10 h-48 md:h-64 w-full relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20"></div>
            </div>

            <div className="container mx-auto px-4 -mt-20 relative z-10">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="md:col-span-1">
                        <Card className="overflow-hidden shadow-lg border-border/50 sticky top-24">
                            <CardContent className="p-6 flex flex-col items-center text-center pt-12 relative">
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden shadow-md">
                                    <div className="w-full h-full bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary">
                                        {therapist.user.name?.[0]}
                                    </div>
                                </div>

                                <h1 className="text-2xl font-bold mt-4">{therapist.user.name}</h1>
                                <p className="text-primary font-medium">{therapist.title}</p>

                                <div className="flex items-center gap-1 mt-2 text-amber-500 font-bold">
                                    <Star className="h-5 w-5 fill-current" />
                                    <span>4.9</span>
                                    <span className="text-muted-foreground font-normal text-sm">(120 reseñas)</span>
                                </div>

                                <div className="w-full border-t my-6"></div>

                                <div className="w-full space-y-4 text-left">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground text-sm">Registro Profesional</span>
                                        <span className="font-medium text-sm">{therapist.licenseNumber}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground text-sm">Experiencia</span>
                                        <span className="font-medium text-sm">10+ años</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground text-sm">Valor sesión</span>
                                        <span className="font-bold text-lg text-primary">${Number(therapist.hourlyRate).toFixed(0)}</span>
                                    </div>
                                </div>

                                <div className="w-full mt-6">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button className="w-full rounded-full" size="lg">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Agendar Sesión
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80" align="center">
                                            <BookingCalendar therapistId={therapist.id} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Details */}
                    <div className="md:col-span-2 space-y-8 mt-8 md:mt-20">

                        {/* About */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Sobre mí</h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                {therapist.bio}
                            </p>
                        </section>

                        {/* Specialties */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Especialidades</h2>
                            <div className="flex flex-wrap gap-2">
                                {therapist.specialties.map((s: any) => (
                                    <Badge key={s.id} variant="secondary" className="px-3 py-1 text-sm">
                                        {s.name}
                                    </Badge>
                                ))}
                            </div>
                        </section>

                        {/* Methodology / Approach (Static for now) */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Enfoque Terapéutico</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-background border flex gap-3">
                                    <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                                    <div>
                                        <h3 className="font-bold">Espacio Seguro</h3>
                                        <p className="text-sm text-muted-foreground">Confidencialidad garantizada y ambiente libre de juicios.</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-background border flex gap-3">
                                    <Clock className="h-6 w-6 text-primary shrink-0" />
                                    <div>
                                        <h3 className="font-bold">Sesiones de 50 min</h3>
                                        <p className="text-sm text-muted-foreground">Tiempo dedicado exclusivamente a tu bienestar.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
}
