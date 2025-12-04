import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Video, Shield } from "lucide-react"

export function Features() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
            <div className="container px-4 md:px-6">
                <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
                    <Card>
                        <CardHeader>
                            <Brain className="h-10 w-10 mb-2 text-primary" />
                            <CardTitle>Matching Inteligente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Encontre o terapeuta ideal para você através do nosso questionário de preferências.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Video className="h-10 w-10 mb-2 text-primary" />
                            <CardTitle>Vídeo Seguro</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Sessões de vídeo criptografadas e de alta qualidade, sem precisar instalar nada.
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Shield className="h-10 w-10 mb-2 text-primary" />
                            <CardTitle>Privacidade Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Seus dados e conversas são protegidos com os mais altos padrões de segurança.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
