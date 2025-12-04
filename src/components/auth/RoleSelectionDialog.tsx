import Link from "next/link"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Award, Building } from "lucide-react"

interface RoleSelectionDialogProps {
    children: React.ReactNode
}

export function RoleSelectionDialog({ children }: RoleSelectionDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">Como você quer criar a sua conta?</DialogTitle>
                    <DialogDescription className="text-center">
                        Selecione a opção que deseja criar a sua conta:
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 md:grid-cols-3 pt-4">
                    <Link href="/cadastro/paciente" className="block">
                        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-2 hover:border-primary/50">
                            <CardHeader>
                                <User className="h-10 w-10 mb-2 text-primary" />
                                <CardTitle>Cliente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    Quero fazer sessões de terapias e ver conteúdos sobre saúde emocional
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/cadastro/profissional" className="block">
                        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-2 hover:border-primary/50">
                            <CardHeader>
                                <Award className="h-10 w-10 mb-2 text-primary" />
                                <CardTitle>Especialista</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    Quero atender pacientes online e fazer gestão da minha carreira
                                </p>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/cadastro/empresa" className="block">
                        <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer border-2 hover:border-primary/50">
                            <CardHeader>
                                <Building className="h-10 w-10 mb-2 text-primary" />
                                <CardTitle>Empresa</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground text-sm">
                                    Quero promover bem-estar emocional aos meus colaboradores
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    )
}
