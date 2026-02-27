"use client"

import { useState, useEffect, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Stethoscope, Save, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { getAnamnesis, updateAnamnesis, type AnamnesisData } from "@/lib/actions/patients"

interface AnamnesisTabProps {
    patientId: string
}

export function AnamnesisTab({ patientId }: AnamnesisTabProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaved, setIsSaved] = useState(false)
    const [isPending, startTransition] = useTransition()

    const [form, setForm] = useState<AnamnesisData>({
        mainComplaint: "",
        familyHistory: "",
        medication: "",
        diagnosticHypothesis: "",
    })

    // Load anamnesis when patient changes
    useEffect(() => {
        if (!patientId) return

        setIsLoading(true)
        setIsSaved(false)

        getAnamnesis(patientId)
            .then((data) => {
                if (data) {
                    setForm({
                        mainComplaint: data.mainComplaint || "",
                        familyHistory: data.familyHistory || "",
                        medication: data.medication || "",
                        diagnosticHypothesis: data.diagnosticHypothesis || "",
                    })
                } else {
                    // No anamnesis yet, reset form
                    setForm({
                        mainComplaint: "",
                        familyHistory: "",
                        medication: "",
                        diagnosticHypothesis: "",
                    })
                }
            })
            .finally(() => setIsLoading(false))
    }, [patientId])

    const handleChange = (field: keyof AnamnesisData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
        setIsSaved(false)
    }

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateAnamnesis(patientId, form)
            if (result.success) {
                setIsSaved(true)
                toast.success("Anamnese atualizada com sucesso!")
            } else {
                toast.error(result.error || "Erro ao salvar a anamnese.")
            }
        })
    }

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-blue-600" />
                    Anamnese &amp; Histórico
                </CardTitle>
                <CardDescription>
                    {isLoading
                        ? "Carregando informações..."
                        : "Informações clínicas do paciente. Apenas visíveis para o psicólogo."
                    }
                </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <p className="text-sm">Carregando anamnese...</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Queixa Principal</label>
                            <Textarea
                                className="bg-slate-50 border-slate-200 focus:bg-white min-h-[80px] resize-none"
                                placeholder="Descreva a queixa principal do paciente..."
                                value={form.mainComplaint}
                                onChange={(e) => handleChange("mainComplaint", e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Histórico Familiar</label>
                                <Textarea
                                    className="bg-slate-50 border-slate-200 focus:bg-white min-h-[100px] resize-none"
                                    placeholder="Histórico de doenças na família..."
                                    value={form.familyHistory}
                                    onChange={(e) => handleChange("familyHistory", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Medicamentos em Uso</label>
                                <Textarea
                                    className="bg-slate-50 border-slate-200 focus:bg-white min-h-[100px] resize-none"
                                    placeholder="Medicamentos atuais e dosagens..."
                                    value={form.medication}
                                    onChange={(e) => handleChange("medication", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Hipótese Diagnóstica</label>
                            <Input
                                className="bg-slate-50 border-slate-200 focus:bg-white"
                                placeholder="Ex: TAG (Transtorno de Ansiedade Generalizada) - F41.1"
                                value={form.diagnosticHypothesis}
                                onChange={(e) => handleChange("diagnosticHypothesis", e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={handleSave}
                                disabled={isPending}
                                className={`gap-2 transition-all ${isSaved
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : "bg-slate-900 hover:bg-slate-800 text-white"
                                    }`}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Salvando...
                                    </>
                                ) : isSaved ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Salvo!
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Salvar Anamnese
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
