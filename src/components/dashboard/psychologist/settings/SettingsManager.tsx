"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Shield, Smartphone, Globe, Mail } from "lucide-react"
import { toast } from "sonner"

export function SettingsManager() {
    const [emailNotif, setEmailNotif] = useState(true)
    const [pushNotif, setPushNotif] = useState(true)
    const [whatsappNotif, setWhatsappNotif] = useState(false)
    const [twoFactor, setTwoFactor] = useState(false)

    const handleSave = () => {
        toast.success("Preferências salvas com sucesso!")
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ajustes & Preferências</h2>
                <p className="text-slate-500">Gerencie notificações, segurança e integrações da sua conta.</p>
            </div>

            <div className="grid gap-6">
                {/* --- NOTIFICATIONS --- */}
                <Card className="border border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Bell className="h-5 w-5 text-blue-600" />
                            Notificações
                        </CardTitle>
                        <CardDescription>Escolha como você quer ser avisado sobre novas sessões e mensagens.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Notificações por Email</Label>
                                <p className="text-sm text-slate-500">Receba resumos diários e alertas de agendamento.</p>
                            </div>
                            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Notificações Push</Label>
                                <p className="text-sm text-slate-500">Alertas no navegador quando estiver online.</p>
                            </div>
                            <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Alertas via WhatsApp</Label>
                                <p className="text-sm text-slate-500">Receba lembretes de consulta 15 min antes.</p>
                            </div>
                            <Switch checked={whatsappNotif} onCheckedChange={setWhatsappNotif} />
                        </div>
                    </CardContent>
                </Card>

                {/* --- SECURITY --- */}
                <Card className="border border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Segurança
                        </CardTitle>
                        <CardDescription>Proteja sua conta e dados dos pacientes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Autenticação de Dois Fatores (2FA)</Label>
                                <p className="text-sm text-slate-500">Adicione uma camada extra de segurança ao login.</p>
                            </div>
                            <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                        </div>
                        <div className="border-t border-slate-100 pt-6">
                            <Button variant="outline" className="text-slate-600">Alterar Senha de Acesso</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* --- INTEGRATIONS --- */}
                <Card className="border border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Globe className="h-5 w-5 text-blue-600" />
                            Integrações
                        </CardTitle>
                        <CardDescription>Conecte-se com serviços externos.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21.5 12H12.5V16.5H17.8C17.6 17.8 16.2 19.5 12.5 19.5C9.4 19.5 6.8 17 6.8 13.5C6.8 10 9.4 7.5 12.5 7.5C14.3 7.5 15.5 8.3 16.2 9L19 6.2C17.3 4.6 15.1 3.5 12.5 3.5C7.2 3.5 3 7.8 3 13.5C3 19.2 7.2 23.5 12.5 23.5C18 23.5 22 19.5 22 13.5V12H21.5Z" fill="#4285F4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Google Calendar</p>
                                    <p className="text-xs text-slate-500">Sincronize sua agenda automaticamente.</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => toast.info('Integração em breve!')}>Conectar</Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} className="bg-slate-900 text-white shadow-sm px-8">Salvar Preferências</Button>
                </div>
            </div>
        </div>
    )
}
