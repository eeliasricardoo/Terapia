"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const focusAreas = [
    "Ansiedade",
    "Depressão",
    "Relacionamentos",
    "Carreira",
    "Autoestima",
    "Estresse",
    "Luto",
    "Terapia de Casal",
    "Família",
    "Sexualidade",
]

export function OnboardingWizard() {
    const [step, setStep] = useState(1)
    const [selectedAreas, setSelectedAreas] = useState<string[]>([])
    const [preferences, setPreferences] = useState({
        gender: "",
        age: "",
        style: "",
    })

    const toggleArea = (area: string) => {
        setSelectedAreas((prev) =>
            prev.includes(area)
                ? prev.filter((a) => a !== area)
                : [...prev, area]
        )
    }

    const updatePreference = (key: keyof typeof preferences, value: string) => {
        setPreferences((prev) => ({ ...prev, [key]: value }))
    }

    const nextStep = () => {
        if (step < 4) {
            setStep(step + 1)
        } else {
            console.log("Finished", { selectedAreas, preferences })
        }
    }

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const getStepTitle = () => {
        switch (step) {
            case 1: return "Em quais áreas você gostaria de focar?"
            case 2: return "Tem alguma preferência para o seu especialista?"
            default: return "Passo " + step
        }
    }

    const getStepDescription = () => {
        switch (step) {
            case 1: return "Selecione todas que se aplicam. Isso nos ajudará a encontrar o especialista adequado para ti."
            case 2: return "Essas preferências são opcionais, mas ajudam a refinar o match."
            default: return ""
        }
    }

    return (
        <Card className="mx-auto max-w-2xl w-full">
            <CardHeader>
                <div className="mb-4">
                    <span className="text-sm text-muted-foreground">Passo {step} de 4</span>
                    <Progress value={(step / 4) * 100} className="h-2 mt-2" />
                </div>
                <CardTitle className="text-3xl text-center font-bold">
                    {getStepTitle()}
                </CardTitle>
                <CardDescription className="text-center text-lg mt-2">
                    {getStepDescription()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {step === 1 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-8">
                        {focusAreas.map((area) => (
                            <button
                                key={area}
                                onClick={() => toggleArea(area)}
                                className={cn(
                                    "px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 border",
                                    selectedAreas.includes(area)
                                        ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
                                        : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                {area}
                            </button>
                        ))}
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 my-8">
                        <div className="space-y-3">
                            <h3 className="font-medium text-lg">Gênero</h3>
                            <div className="flex gap-3">
                                {["Homem", "Mulher", "Tanto faz"].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => updatePreference("gender", option)}
                                        className={cn(
                                            "flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border",
                                            preferences.gender === option
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-medium text-lg">Faixa Etária</h3>
                            <div className="flex gap-3">
                                {["Mais jovem", "Mais experiente", "Tanto faz"].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => updatePreference("age", option)}
                                        className={cn(
                                            "flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border",
                                            preferences.age === option
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-medium text-lg">Abordagem</h3>
                            <div className="flex gap-3">
                                {["Mais ouvinte", "Mais falante", "Tanto faz"].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => updatePreference("style", option)}
                                        className={cn(
                                            "flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border",
                                            preferences.style === option
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-background border-input hover:bg-accent hover:text-accent-foreground"
                                        )}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={step === 1}
                        className="text-muted-foreground"
                    >
                        Anterior
                    </Button>
                    <Button onClick={nextStep} className="px-8">
                        {step === 4 ? "Finalizar" : "Seguinte"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
