"use client"

import { useState } from "react"
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"
import { PsychologistOnboardingWizard } from "@/components/onboarding/psychologist/PsychologistOnboardingWizard"
import { User, Stethoscope, ArrowRight } from "lucide-react"

export default function OnboardingPage() {
    const [selectedRole, setSelectedRole] = useState<'PATIENT' | 'PSYCHOLOGIST' | null>(null)

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center">
            <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">

                {!selectedRole ? (
                    <div className="w-full max-w-4xl animate-in fade-in zoom-in duration-500">
                        <div className="text-center mb-12 space-y-4">
                            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Como você deseja usar a plataforma?</h1>
                            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                                Personalizaremos sua experiência com base no seu perfil.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Patient Card */}
                            <button
                                onClick={() => setSelectedRole('PATIENT')}
                                className="group relative overflow-hidden rounded-3xl bg-white p-8 text-left shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl border border-slate-100 hover:border-blue-200"
                            >
                                <div className="absolute top-0 right-0 p-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors"></div>

                                <div className="relative z-10">
                                    <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <User className="h-8 w-8" />
                                    </div>

                                    <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        Sou Paciente
                                    </h2>
                                    <p className="text-slate-500 mb-8 leading-relaxed">
                                        Busco apoio emocional, autoconhecimento ou tratamento com profissionais qualificados.
                                    </p>

                                    <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                                        Continuar como paciente <ArrowRight className="ml-2 h-5 w-5" />
                                    </div>
                                </div>
                            </button>

                            {/* Psychologist Card */}
                            <button
                                onClick={() => setSelectedRole('PSYCHOLOGIST')}
                                className="group relative overflow-hidden rounded-3xl bg-white p-8 text-left shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl border border-slate-100 hover:border-green-200"
                            >
                                <div className="absolute top-0 right-0 p-32 bg-green-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-green-100/50 transition-colors"></div>

                                <div className="relative z-10">
                                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                        <Stethoscope className="h-8 w-8" />
                                    </div>

                                    <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-green-600 transition-colors">
                                        Sou Psicólogo(a)
                                    </h2>
                                    <p className="text-slate-500 mb-8 leading-relaxed">
                                        Quero oferecer meus serviços, gerenciar minha agenda e expandir meu alcance.
                                    </p>

                                    <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                                        Continuar como profissional <ArrowRight className="ml-2 h-5 w-5" />
                                    </div>
                                </div>
                            </button>
                        </div>

                        <p className="text-center text-sm text-slate-400 mt-12">
                            Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
                        </p>
                    </div>
                ) : (
                    <div className="w-full animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="mb-4">
                            <button
                                onClick={() => setSelectedRole(null)}
                                className="text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center"
                            >
                                ← Voltar para seleção
                            </button>
                        </div>
                        {selectedRole === 'PATIENT' ? (
                            <OnboardingWizard />
                        ) : (
                            <PsychologistOnboardingWizard />
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
