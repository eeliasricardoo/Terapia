"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Mail, User, Phone, Lock, Save, Shield } from "lucide-react"
import { updateUserProfile } from "@/lib/actions/profile"
import type { Profile } from "@/lib/supabase/types"

interface ProfileFormProps {
    initialProfile: Profile
    userEmail: string
    roleDisplay: string
}

export function ProfileForm({ initialProfile, userEmail, roleDisplay }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [profile, setProfile] = useState(initialProfile)

    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    })

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const result = await updateUserProfile({
                full_name: profile.full_name || undefined,
                phone: profile.phone || undefined,
                avatar_url: profile.avatar_url || undefined
            })

            if (result.success) {
                alert("Perfil atualizado com sucesso!")
            } else {
                alert(`Erro ao atualizar perfil: ${result.error}`)
            }
        } catch (error) {
            alert("Erro ao atualizar perfil")
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordChange = () => {
        if (passwords.new !== passwords.confirm) {
            alert("A nova senha e a confirmação não coincidem.")
            return
        }
        if (!passwords.current || !passwords.new) {
            alert("Por favor, preencha todos os campos.")
            return
        }

        setIsLoading(true)
        // TODO: Implement password change with Supabase
        setTimeout(() => {
            setIsLoading(false)
            setPasswords({ current: "", new: "", confirm: "" })
            alert("Senha alterada com sucesso!")
        }, 1000)
    }

    // Get user initials for avatar fallback
    const getInitials = (name: string | null) => {
        if (!name) return "U"
        return name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full md:w-[600px] grid-cols-1 md:grid-cols-3 h-auto mb-8">
                <TabsTrigger value="general">Informações Gerais</TabsTrigger>
                <TabsTrigger value="plans">Meus Planos</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
                {/* User Avatar Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sua Foto</CardTitle>
                        <CardDescription>
                            Clique na foto para alterar. Recomendamos uma imagem quadrada.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <div className="relative group cursor-pointer">
                            <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm group-hover:opacity-90 transition-opacity">
                                <AvatarImage src={profile.avatar_url || undefined} />
                                <AvatarFallback className="text-xl">{getInitials(profile.full_name)}</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-medium text-lg">{profile.full_name || "Sem nome"}</h3>
                            <p className="text-sm text-muted-foreground">{roleDisplay}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Bio Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sobre Você</CardTitle>
                        <CardDescription>
                            Compartilhe um pouco sobre você para seus terapeutas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <textarea
                                id="bio"
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Conte um pouco sobre sua jornada, hobbies ou o que busca na terapia..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Info Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dados Pessoais</CardTitle>
                        <CardDescription>
                            Atualize seus detalhes de contato.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        value={profile.full_name || ""}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        value={profile.phone || ""}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    value={userEmail}
                                    disabled
                                    className="pl-9 bg-slate-50 text-muted-foreground"
                                />
                            </div>
                            <p className="text-[0.8rem] text-muted-foreground">
                                Para alterar seu email, entre em contato com o suporte.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t p-6">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave} disabled={isLoading}>
                            {isLoading ? (
                                <>Salvando...</>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>

            <TabsContent value="plans" className="space-y-6">
                <Card className="border-blue-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Ativo</span>
                    </div>
                    <CardHeader>
                        <CardTitle className="text-xl text-blue-900">Plano Corporativo</CardTitle>
                        <CardDescription>
                            Benefício fornecido por <strong>Tech Solutions Inc.</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
                                <p className="text-sm text-slate-500 mb-1">Créditos Disponíveis</p>
                                <p className="text-3xl font-bold text-slate-900">4 <span className="text-sm font-normal text-slate-400">/ mês</span></p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
                                <p className="text-sm text-slate-500 mb-1">Renovação</p>
                                <p className="text-lg font-semibold text-slate-900">01/11/2024</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
                                <p className="text-sm text-slate-500 mb-1">Cobertura</p>
                                <p className="text-lg font-semibold text-slate-900">100%</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3">Histórico de Uso (Este mês)</h4>
                            <div className="border rounded-md divide-y">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex justify-between items-center p-3 text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                                CP
                                            </div>
                                            <div>
                                                <p className="font-medium">Sessão com Dr. Carlos Pereira</p>
                                                <p className="text-xs text-muted-foreground">15 Out, 2024 • 14:00</p>
                                            </div>
                                        </div>
                                        <span className="font-mono text-slate-600">-1 crédito</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t p-6 flex justify-between items-center">
                        <p className="text-xs text-muted-foreground w-2/3">
                            Para dúvidas sobre seu benefício corporativo, entre em contato com o RH da sua empresa ou nosso suporte.
                        </p>
                        <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">Contato Suporte</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Métodos de Pagamento</CardTitle>
                        <CardDescription>Gerencie seus cartões para sessões extras.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-14 bg-slate-100 rounded flex items-center justify-center">
                                    <span className="font-bold text-slate-500 text-xs">RICO</span>
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Cartão de Crédito **** 8899</p>
                                    <p className="text-xs text-muted-foreground">Expira em 12/28</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">Remover</Button>
                        </div>
                        <Button variant="outline" className="w-full border-dashed">
                            + Adicionar novo cartão
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Senha</CardTitle>
                        <CardDescription>
                            Altere sua senha para manter sua conta segura.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Senha Atual</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="current-password"
                                    type="password"
                                    className="pl-9"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                />
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Nova Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="new-password"
                                    type="password"
                                    className="pl-9"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    className="pl-9"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t p-6">
                        <Button variant="outline" className="mr-4">Cancelar</Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handlePasswordChange} disabled={isLoading}>
                            Alterar Senha
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
