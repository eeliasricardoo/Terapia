"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { SPECIALTIES, APPROACHES } from "./constants"
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"

// We will simulate saving profile data for now
// In real app, this would be a server action

export function PsychologistOnboardingWizard() {
    const [step, setStep] = useState(1)
    const router = useRouter()
    const { user } = useAuth()

    const [formData, setFormData] = useState({
        crp: "",
        fullName: user?.name || "",
        specialties: [] as string[],
        approaches: [] as string[],
        bio: "",
        price: "",
        videoUrl: "",
        availability: {
            days: [] as string[],
            start: "08:00",
            end: "18:00",
        },
    })

    // Helper to update simple fields
    const updateField = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // Helper to toggle array items
    const toggleItem = (field: 'specialties' | 'approaches', value: string) => {
        setFormData((prev) => {
            const current = prev[field]
            const exists = current.includes(value)

            if (exists) {
                return { ...prev, [field]: current.filter((item) => item !== value) }
            } else {
                // Limit number of selections if needed (e.g., max 5 specialties)
                if (field === 'specialties' && current.length >= 5) return prev
                return { ...prev, [field]: [...current, value] }
            }
        })
    }

    const nextStep = () => {
        if (step < 5) {
            setStep(step + 1)
        } else {
            // Submit form
            handleSubmit()
        }
    }

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const handleSubmit = async () => {
        // TODO: Call server action to save psychologist profile
        console.log("Submitting psychologist profile:", formData)

        // Simulate loading
        setTimeout(() => {
            router.push("/dashboard") // Redirect to psychologist dashboard
        }, 1500)
    }

    // Render Step Content based on current step
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullname">Nome Completo (como aparecerá no perfil)</Label>
                                <Input
                                    id="fullname"
                                    placeholder="Ex: Dra. Ana Silva"
                                    value={formData.fullName}
                                    onChange={(e) => updateField("fullName", e.target.value)}
                                    className="h-12 text-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="crp">Número do CRP</Label>
                                <Input
                                    id="crp"
                                    placeholder="Ex: 06/12345"
                                    value={formData.crp}
                                    onChange={(e) => updateField("crp", e.target.value)}
                                    className="h-12 text-lg font-mono tracking-wider"
                                />
                                <p className="text-xs text-muted-foreground">Necessário para verificação profissional.</p>
                            </div>
                        </div>
                    </div>
                )
            case 2:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <Label className="text-base">Quais são suas principais especialidades? (Máx. 5)</Label>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                {SPECIALTIES.map((spec) => (
                                    <button
                                        key={spec.id}
                                        onClick={() => toggleItem("specialties", spec.label)}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:bg-slate-50",
                                            formData.specialties.includes(spec.label)
                                                ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                                                : "border-slate-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            formData.specialties.includes(spec.label) ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                                        )}>
                                            <spec.icon className="h-5 w-5" />
                                        </div>
                                        <span className={cn(
                                            "text-sm font-medium",
                                            formData.specialties.includes(spec.label) ? "text-blue-900" : "text-slate-600"
                                        )}>{spec.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            case 3:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <Label className="text-base">Qual sua abordagem terapêutica principal?</Label>
                            <div className="grid grid-cols-1 gap-3 mt-4">
                                {APPROACHES.map((approach) => (
                                    <button
                                        key={approach.id}
                                        onClick={() => toggleItem("approaches", approach.label)}
                                        className={cn(
                                            "flex flex-col items-start p-4 rounded-xl border text-left transition-all hover:bg-slate-50",
                                            formData.approaches.includes(approach.label)
                                                ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                                                : "border-slate-200"
                                        )}
                                    >
                                        <span className={cn(
                                            "font-semibold text-base mb-1",
                                            formData.approaches.includes(approach.label) ? "text-blue-900" : "text-slate-900"
                                        )}>{approach.label}</span>
                                        <span className="text-sm text-slate-500">{approach.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            case 4:
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="bio">Conte um pouco sobre você e sua forma de trabalho</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Olá! Sou psicólogo clínico com 10 anos de experiência..."
                                    value={formData.bio}
                                    onChange={(e) => updateField("bio", e.target.value)}
                                    className="min-h-[150px] text-base leading-relaxed resize-none p-4"
                                />
                                <p className="text-xs text-muted-foreground text-right">{formData.bio.length}/500 caracteres</p>
                            </div>

                            <div className="space-y-2 pt-4">
                                <Label htmlFor="video">Link para vídeo de apresentação (Opcional)</Label>
                                <Input
                                    id="video"
                                    placeholder="Ex: Youtube, Vimeo..."
                                    value={formData.videoUrl}
                                    onChange={(e) => updateField("videoUrl", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )
            case 5:
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center space-y-2 mb-8">
                            <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Tudo pronto!</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                Defina o valor da sua sessão para finalizar o cadastro e começar a receber pacientes.
                            </p>
                        </div>

                        <div className="max-w-xs mx-auto space-y-4">
                            <Label htmlFor="price" className="text-center block text-lg font-medium">Valor por sessão (50min)</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-lg">R$</span>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="0,00"
                                    value={formData.price}
                                    onChange={(e) => updateField("price", e.target.value)}
                                    className="h-16 pl-12 text-2xl font-bold text-center"
                                />
                            </div>
                            <p className="text-xs text-center text-muted-foreground">
                                A plataforma cobra uma taxa de 15% por sessão realizada.
                            </p>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    const getStepTitle = () => {
        switch (step) {
            case 1: return "Vamos começar pelo básico"
            case 2: return "Suas especialidades"
            case 3: return "Sua abordagem"
            case 4: return "Sua apresentação"
            case 5: return "Finalizando"
            default: return ""
        }
    }

    const getStepDescription = () => {
        switch (step) {
            case 1: return "Precisamos validar suas credenciais profissionais."
            case 2: return "O que você mais gosta de atender?"
            case 3: return "Como você conduz suas sessões?"
            case 4: return "Essa é a primeira coisa que os pacientes vão ler."
            case 5: return "Defina o valor do seu trabalho."
            default: return ""
        }
    }

    return (
        <Card className="mx-auto max-w-2xl w-full border-slate-200 shadow-lg">
            <CardHeader className="text-center pb-2 pt-8">
                <div className="mb-6 flex justify-center">
                    {/* Simple Step Indicator */}
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div key={s} className={cn(
                                "h-2 w-12 rounded-full transition-all duration-500",
                                step >= s ? "bg-blue-600" : "bg-slate-100"
                            )} />
                        ))}
                    </div>
                </div>
                <CardTitle className="text-3xl font-bold text-slate-900">
                    {getStepTitle()}
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                    {getStepDescription()}
                </CardDescription>
            </CardHeader>

            <CardContent className="p-8">
                <div className="min-h-[300px]">
                    {renderStepContent()}
                </div>

                <div className="flex justify-between mt-12 pt-6 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={step === 1}
                        className="text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>

                    <Button
                        onClick={nextStep}
                        className={cn(
                            "px-8 h-12 text-base font-semibold shadow-md transition-all",
                            step === 5
                                ? "bg-green-600 hover:bg-green-700 shadow-green-600/20"
                                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
                        )}
                        disabled={
                            (step === 1 && (!formData.fullName || !formData.crp)) ||
                            (step === 2 && formData.specialties.length === 0) ||
                            (step === 3 && formData.approaches.length === 0) ||
                            (step === 4 && formData.bio.length < 10) ||
                            (step === 5 && !formData.price)
                        }
                    >
                        {step === 5 ? "Começar a Atender" : "Continuar"}
                        {step !== 5 && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
