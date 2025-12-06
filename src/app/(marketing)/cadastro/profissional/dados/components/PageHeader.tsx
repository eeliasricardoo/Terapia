import { Progress } from "@/components/ui/progress"

export function PageHeader() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-3xl font-black tracking-tight">
                    Dados Profissionais
                </h1>
                <p className="text-muted-foreground mt-2">
                    Completa tu información profesional para comenzar.
                </p>
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Completitud del Perfil</span>
                    <span className="text-muted-foreground">75% Completo</span>
                </div>
                <Progress value={75} />
            </div>
        </div>
    )
}

