"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, FileText, ChevronRight, MessageCircle, AlertCircle } from "lucide-react"
import { getPatientPublicEvolutions, type PublicEvolution } from "@/lib/actions/evolutions"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function PatientProntuarioPage() {
    const [evolutions, setEvolutions] = useState<PublicEvolution[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadEvolutions() {
            try {
                const data = await getPatientPublicEvolutions()
                setEvolutions(data)
            } catch (error) {
                console.error("Error loading evolutions:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadEvolutions()
    }, [])

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meu Prontuário</h1>
                    <p className="text-muted-foreground">Acompanhe os resumos compartilhados das suas sessões.</p>
                </div>
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-slate-200">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-4 w-1/4 mb-2" />
                            <Skeleton className="h-6 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meu Prontuário</h1>
                <p className="text-muted-foreground">Aqui você encontra os resumos e orientações que seu psicólogo compartilhou com você.</p>
            </div>

            {evolutions.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <FileText className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">Nenhum registro ainda</h3>
                        <p className="text-slate-500 max-w-sm mt-1">
                            Seus resumos de sessão aparecerão aqui assim que seu psicólogo os disponibilizar.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {evolutions.map((evolution) => (
                        <Card key={evolution.id} className="border-slate-200 hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Calendar className="h-4 w-4" />
                                        {format(new Date(evolution.date), "dd 'de' MMMM', 'yyyy", { locale: ptBR })}
                                    </div>
                                    <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <User className="h-5 w-5 text-blue-600" />
                                        {evolution.psychologistName}
                                    </CardTitle>
                                </div>
                                {evolution.mood && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        Como você estava: {evolution.mood}
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                    <div className="flex items-start gap-3">
                                        <MessageCircle className="h-5 w-5 text-slate-400 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-slate-900">Resumo da Sessão</p>
                                            <p className="text-slate-700 leading-relaxed italic">
                                                {evolution.publicSummary || "Nenhum resumo compartilhado para esta sessão."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 gap-1">
                                        Ver detalhes <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 mt-8">
                <div className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-amber-100 flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-900">Sobre sua privacidade</h4>
                        <p className="text-sm text-amber-800 leading-relaxed mt-1">
                            Estes resumos são destinados apenas a você e ao seu psicólogo. De acordo com o Código de Ética Profissional do Psicólogo,
                            as informações técnicas detalhadas (notas privadas) são mantidas em sigilo e não são exibidas aqui para sua segurança e conforto.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
