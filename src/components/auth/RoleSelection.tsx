import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Award, Building } from "lucide-react"

export function RoleSelection() {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            <Link href="/cadastro/paciente" className="block">
                <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader>
                        <User className="h-10 w-10 mb-2 text-primary" />
                        <CardTitle>Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Quero fazer sessões de terapias e ver conteúdos sobre saúde emocional
                        </p>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/cadastro/profissional" className="block">
                <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader>
                        <Award className="h-10 w-10 mb-2 text-primary" />
                        <CardTitle>Especialista</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Quero atender pacientes online e fazer gestão da minha carreira
                        </p>
                    </CardContent>
                </Card>
            </Link>

            <Link href="/cadastro/empresa" className="block">
                <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader>
                        <Building className="h-10 w-10 mb-2 text-primary" />
                        <CardTitle>Empresa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Quero promover bem-estar emocional aos meus colaboradores
                        </p>
                    </CardContent>
                </Card>
            </Link>
        </div>
    )
}
