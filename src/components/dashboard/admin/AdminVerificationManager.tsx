'use client'

import { useState, useEffect } from "react"
import { getPendingPsychologists, verifyPsychologist } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, ShieldCheck, UserCheck } from "lucide-react"
import { toast } from "sonner"

export function AdminVerificationManager() {
    const [pending, setPending] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [verifyingId, setVerifyingId] = useState<string | null>(null)

    useEffect(() => {
        loadPending()
    }, [])

    async function loadPending() {
        setIsLoading(true)
        try {
            const data = await getPendingPsychologists()
            setPending(data)
        } catch (error) {
            toast.error("Erro ao carregar psicólogos pendentes")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleVerify(id: string) {
        setVerifyingId(id)
        try {
            const result = await verifyPsychologist(id)
            if (result.success) {
                toast.success("Psicólogo verificado com sucesso!")
                setPending(prev => prev.filter(p => p.id !== id))
            } else {
                toast.error(result.error || "Erro ao verificar psicólogo")
            }
        } catch (error) {
            toast.error("Ocorreu um erro inesperado")
        } finally {
            setVerifyingId(null)
        }
    }

    if (isLoading) {
        return (
            <Card className="border-none shadow-sm">
                <CardContent className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                    <CardTitle>Verificação de Profissionais</CardTitle>
                </div>
                <CardDescription>
                    Analise e aprove os psicólogos que aguardam verificação para aparecerem na busca pública.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {pending.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed">
                        <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Não há profissionais pendentes de verificação.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pending.map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarImage src={p.avatarUrl} />
                                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold">
                                            {p.fullName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{p.fullName}</h4>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <span>{p.email}</span>
                                            <span>•</span>
                                            <span className="font-medium text-slate-700">CRP: {p.crp || 'Não informado'}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {p.specialties?.slice(0, 3).map((s: string) => (
                                                <Badge key={s} variant="secondary" className="text-[10px] py-0 px-1.5 bg-slate-100 text-slate-600">
                                                    {s}
                                                </Badge>
                                            ))}
                                            {p.specialties?.length > 3 && (
                                                <span className="text-[9px] text-slate-400 font-medium ml-1">+{p.specialties.length - 3} mais</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleVerify(p.id)}
                                    disabled={verifyingId === p.id}
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                    size="sm"
                                >
                                    {verifyingId === p.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4" />
                                    )}
                                    Verificar
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
