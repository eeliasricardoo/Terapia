"use client"

import { User, Phone, Mail, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { updateUserProfile } from "../actions"
import { UserProfile } from "../_hooks/use-profile-data"

interface PersonalInfoCardProps {
    user: UserProfile | null
    setUser: (updater: (prev: UserProfile | null) => UserProfile | null) => void
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
}

export function PersonalInfoCard({ user, setUser, isLoading, setIsLoading }: PersonalInfoCardProps) {
    const handleSaveProfile = async () => {
        if (!user) return

        try {
            setIsLoading(true)

            const result = await updateUserProfile({
                name: user.name,
                phone: user.phone
            })

            if (result.error) {
                toast.error('Erro ao salvar perfil', { description: result.error })
                return
            }

            toast.success('Perfil atualizado!', { description: 'Seus dados foram salvos com sucesso.' })
        } catch (error) {
            console.error('Error saving profile:', error)
            toast.error('Erro ao salvar perfil')
        } finally {
            setIsLoading(false)
        }
    }

    return (
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
                                value={user?.name || ''}
                                onChange={(e) => setUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                                className="pl-9"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="phone"
                                value={user?.phone || ''}
                                onChange={(e) => setUser(prev => prev ? { ...prev, phone: e.target.value } : null)}
                                className="pl-9"
                                disabled={isLoading}
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
                            value={user?.email || ''}
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
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSaveProfile} disabled={isLoading}>
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
    )
}
