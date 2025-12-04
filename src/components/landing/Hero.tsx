"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog"

export function Hero() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                            Saúde Mental para Todos
                        </h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                            A plataforma completa para pacientes, psicólogos e empresas.
                            Encontre o profissional ideal ou gerencie sua carreira.
                        </p>
                    </div>
                    <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
                        <Button asChild size="lg">
                            <Link href="/busca">Encontrar Psicólogo</Link>
                        </Button>
                        <RoleSelectionDialog mode="register">
                            <Button variant="outline" size="lg">
                                Criar Conta
                            </Button>
                        </RoleSelectionDialog>
                    </div>
                </div>
            </div>
        </section>
    )
}
