"use client";

import { db } from "@/lib/db";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Star, MapPin, Clock } from "lucide-react";
// import { motion } from "framer-motion"; // Not used in the final implementation, but mentioned in comments

// Note: Since we are using "use client" for framer-motion, we need to pass data as props or fetch in a client component.
// However, to keep it simple and server-side rendered for SEO, we will make a Client Component wrapper for the list.

// For now, let's just add a simple CSS animation class "animate-in fade-in slide-in-from-bottom-4" which is built-in to Tailwind/Shadcn utils
// instead of converting the whole page to client side just for framer motion, which would lose SEO benefits of server components.

// Wait, the user explicitly asked for animations. Let's use the built-in tailwind animate-in classes which are very performant and don't require client side JS for the whole page.

export const dynamic = "force-dynamic";

export default async function SearchPage() {
    const therapists = await db.therapistProfile.findMany({
        include: {
            user: true,
            specialties: true,
        },
    });

    const specialties = await db.specialty.findMany();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div>
                        <h3 className="font-semibold mb-4 text-lg">Especialidades</h3>
                        <div className="flex flex-wrap gap-2">
                            {specialties.map((s: any) => (
                                <Badge key={s.id} variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">
                                    {s.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4 text-lg">Precio por sesión</h3>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                <span className="text-sm group-hover:text-primary transition-colors">Hasta $100</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                <span className="text-sm group-hover:text-primary transition-colors">$100 - $200</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                <span className="text-sm group-hover:text-primary transition-colors">Más de $200</span>
                            </label>
                        </div>
                    </div>
                </aside>

                {/* Main Grid */}
                <main className="flex-1">
                    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
                        <h1 className="text-3xl font-bold text-foreground">Encuentra tu especialista</h1>
                        <p className="text-muted-foreground mt-2">
                            {therapists.length} profesionales disponibles para ayudarte hoy.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {therapists.map((therapist: any, index: number) => (
                            <Card
                                key={therapist.id}
                                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <CardHeader className="p-0">
                                    <div className="h-32 bg-gradient-to-r from-primary/10 to-secondary/10 relative group">
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="absolute -bottom-10 left-6 h-20 w-20 rounded-full border-4 border-background bg-muted flex items-center justify-center overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
                                            {/* Placeholder Avatar */}
                                            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                                                {therapist.user.name?.[0]}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-12 pb-4 px-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{therapist.user.name}</h3>
                                            <p className="text-sm text-primary font-medium">{therapist.title}</p>
                                        </div>
                                        <div className="flex items-center text-amber-500 text-sm font-bold bg-amber-500/10 px-2 py-1 rounded-full">
                                            <Star className="h-3 w-3 fill-current mr-1" />
                                            4.9
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-4">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4 mr-2 text-primary/50" />
                                            Online
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4 mr-2 text-primary/50" />
                                            50 min sesión
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-1">
                                        {therapist.specialties.slice(0, 3).map((s: any) => (
                                            <span key={s.id} className="text-xs bg-secondary/50 text-secondary-foreground px-2 py-1 rounded-md border border-transparent hover:border-secondary-foreground/20 transition-colors">
                                                {s.name}
                                            </span>
                                        ))}
                                        {therapist.specialties.length > 3 && (
                                            <span className="text-xs text-muted-foreground px-2 py-1">
                                                +{therapist.specialties.length - 3} más
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="px-6 pb-6 pt-0 flex items-center justify-between border-t bg-muted/20 mt-auto">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Sesión desde</span>
                                        <span className="font-bold text-lg text-primary">
                                            ${Number(therapist.hourlyRate).toFixed(0)}
                                        </span>
                                    </div>
                                    <Button asChild size="sm" className="rounded-full shadow-sm hover:shadow-md transition-all">
                                        <Link href={`/especialistas/${therapist.id}`}>Ver Perfil</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
}
