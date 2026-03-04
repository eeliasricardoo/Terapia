"use client"

import { User, Phone, Mail, Save, Calendar, FileText, Briefcase, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
                phone: user.phone,
                birth_date: user.birth_date,
                document: user.document,
                gender: user.gender,
                profession: user.profession,
                address_line: user.address_line,
                city: user.city,
                state: user.state,
                zip_code: user.zip_code
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
                    Atualize seus detalhes básicos e de contato.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <Label htmlFor="document">CPF / Documento</Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="document"
                                value={user?.document || ''}
                                onChange={(e) => setUser(prev => prev ? { ...prev, document: e.target.value } : null)}
                                className="pl-9"
                                disabled={isLoading}
                                placeholder="000.000.000-00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="birth_date">Data de Nascimento</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="birth_date"
                                type="date"
                                value={user?.birth_date ? user.birth_date.substring(0, 10) : ''}
                                onChange={(e) => setUser(prev => prev ? { ...prev, birth_date: e.target.value } : null)}
                                className="pl-9"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">Gênero</Label>
                        <Select
                            value={user?.gender || undefined}
                            onValueChange={(value) => setUser(prev => prev ? { ...prev, gender: value } : null)}
                            disabled={isLoading}
                        >
                            <SelectTrigger id="gender">
                                <SelectValue placeholder="Selecione seu gênero" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Masculino">Masculino</SelectItem>
                                <SelectItem value="Feminino">Feminino</SelectItem>
                                <SelectItem value="Não-binário">Não-binário</SelectItem>
                                <SelectItem value="Prefiro não dizer">Prefiro não dizer</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profession">Profissão</Label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="profession"
                                value={user?.profession || ''}
                                onChange={(e) => setUser(prev => prev ? { ...prev, profession: e.target.value } : null)}
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
