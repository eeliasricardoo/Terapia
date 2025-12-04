import Link from "next/link"
import { Button } from "@/components/ui/button"
import { RoleSelectionDialog } from "@/components/auth/RoleSelectionDialog"

export function CTA() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                            Comece sua jornada hoje
                        </h2>
                        <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                            Cuide da sua saúde mental com profissionais qualificados e tecnologia de ponta.
                        </p>
                    </div>
                    <RoleSelectionDialog>
                        <Button size="lg">
                            Criar Conta Grátis
                        </Button>
                    </RoleSelectionDialog>
                </div>
            </div>
        </section>
    )
}
