"use client"

import { createClient } from "@/lib/supabase/client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Mail, User, Phone, Lock, Save, Shield } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    // User Data State
    const [user, setUser] = useState<{
        id: string
        name: string
        email: string
        phone: string
        role: string
        image: string | undefined
        rawRole: string
    } | null>(null)

    const [bio, setBio] = useState("")
    const [crp, setCrp] = useState("")
    const [price, setPrice] = useState<number | "">("")
    const [specialties, setSpecialties] = useState("")
    const [videoUrl, setVideoUrl] = useState("")

    // Fetch User Data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser()

                if (!authUser) return

                // Fetch Profile
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', authUser.id)
                    .single()

                if (profileError && profileError.code !== 'PGRST116') {
                    console.error('Error fetching profile:', profileError)
                }

                const isPsychologist = profile?.role === 'PSYCHOLOGIST' || authUser.user_metadata?.role === 'PSYCHOLOGIST'

                setUser({
                    id: authUser.id,
                    name: profile?.full_name || authUser.user_metadata?.full_name || '',
                    email: authUser.email || '',
                    phone: profile?.phone || '',
                    role: isPsychologist ? "Psicólogo" : "Paciente",
                    rawRole: isPsychologist ? 'PSYCHOLOGIST' : 'PATIENT',
                    image: profile?.avatar_url || "/avatars/01.png"
                })

                // If Psychologist, fetch professional profile
                if (isPsychologist) {
                    const { data: psychProfile } = await supabase
                        .from('psychologist_profiles')
                        .select('bio, crp, price_per_session, specialties, video_presentation_url')
                        .eq('userId', authUser.id)
                        .single()

                    if (psychProfile) {
                        setBio(psychProfile.bio || "")
                        setCrp(psychProfile.crp || "")
                        setPrice(psychProfile.price_per_session || "")
                        setSpecialties(psychProfile.specialties?.join(", ") || "")
                        setVideoUrl(psychProfile.video_presentation_url || "")
                    }
                }
            } catch (error) {
                console.error('Error fetching user:', error)
                toast.error('Erro ao carregar perfil')
            }
        }

        fetchUser()
    }, [])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Arquivo inválido', { description: 'Por favor, selecione uma imagem.' })
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Arquivo muito grande', { description: 'A imagem deve ter no máximo 5MB.' })
            return
        }

        try {
            setIsLoading(true)

            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('user_id', user.id)

            if (updateError) throw updateError

            // Update Local State
            setUser(prev => prev ? { ...prev, image: publicUrl } : null)

            toast.success('Foto atualizada!', { description: 'Sua foto de perfil foi alterada com sucesso.' })

        } catch (error) {
            console.error('Error uploading image:', error)
            toast.error('Erro ao atualizar foto')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleSaveProfessionalProfile = async () => {
        if (!user || user.rawRole !== 'PSYCHOLOGIST') return

        try {
            setIsSaving(true)

            const specialtiesArray = specialties.split(',').map(s => s.trim()).filter(s => s !== '')

            const { error } = await supabase
                .from('psychologist_profiles')
                .update({
                    bio,
                    crp,
                    price_per_session: price === "" ? null : Number(price),
                    specialties: specialtiesArray.length > 0 ? specialtiesArray : null,
                    video_presentation_url: videoUrl || null
                })
                .eq('userId', user.id)

            if (error) throw error

            toast.success('Perfil profissional salvo!', { description: 'Suas informações foram atualizadas na plataforma.' })
        } catch (error) {
            console.error('Error saving professional profile:', error)
            toast.error('Erro ao salvar perfil profissional')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSaveProfile = async () => {
        if (!user) return

        try {
            setIsLoading(true)

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: user.name,
                    phone: user.phone
                })
                .eq('user_id', user.id)

            if (error) throw error

            toast.success('Perfil atualizado!', { description: 'Seus dados foram salvos com sucesso.' })
        } catch (error) {
            console.error('Error saving profile:', error)
            toast.error('Erro ao salvar perfil')
        } finally {
            setIsLoading(false)
        }
    }

    const [passwords, setPasswords] = useState({
        current: "",
        new: "",
        confirm: ""
    })

    const [passwordErrors, setPasswordErrors] = useState<string[]>([])

    const validatePassword = (password: string): string[] => {
        const errors: string[] = []

        if (password.length < 8) {
            errors.push("Senha deve ter pelo menos 8 caracteres")
        }
        if (!/[A-Z]/.test(password)) {
            errors.push("Senha deve conter pelo menos uma letra maiúscula")
        }
        if (!/[a-z]/.test(password)) {
            errors.push("Senha deve conter pelo menos uma letra minúscula")
        }
        if (!/[0-9]/.test(password)) {
            errors.push("Senha deve conter pelo menos um número")
        }
        if (!/[\W_]/.test(password)) {
            errors.push("Senha deve conter pelo menos um caractere especial")
        }

        return errors
    }

    const handlePasswordChange = () => {
        // Clear previous errors
        setPasswordErrors([])

        // Validate all fields are filled
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            toast.error('Preencha todos os campos', {
                description: 'Todos os campos de senha são obrigatórios.',
            })
            return
        }

        // Validate new password strength
        const errors = validatePassword(passwords.new)
        if (errors.length > 0) {
            setPasswordErrors(errors)
            toast.error('Senha não atende aos requisitos', {
                description: 'Verifique os requisitos abaixo.',
            })
            return
        }

        // Validate passwords match
        if (passwords.new !== passwords.confirm) {
            toast.error('As senhas não coincidem', {
                description: 'A nova senha e a confirmação devem ser iguais.',
            })
            return
        }

        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            setPasswords({ current: "", new: "", confirm: "" })
            setPasswordErrors([])
            toast.success('Senha alterada com sucesso!', {
                description: 'Sua senha foi atualizada.',
                duration: 3000,
            })
        }, 1000)
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Meu Perfil</h1>
                <p className="text-muted-foreground">Gerencie suas informações pessoais e segurança.</p>
            </div>

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
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                                <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm group-hover:opacity-90 transition-opacity">
                                    <AvatarImage src={user?.image || undefined} />
                                    <AvatarFallback className="text-xl">{user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}</AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-medium text-lg">{user?.name || "Carregando..."}</h3>
                                <p className="text-sm text-muted-foreground">{user?.role || ""}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Professional Profile Card (Only for Psychologist) */}
                    {user?.rawRole === 'PSYCHOLOGIST' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Perfil Profissional</CardTitle>
                                <CardDescription>
                                    Configure como você aparecerá para os pacientes na busca.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="crp">CRP</Label>
                                        <Input
                                            id="crp"
                                            value={crp}
                                            onChange={(e) => setCrp(e.target.value)}
                                            placeholder="Ex: 00/00000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Valor da Sessão (R$)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                            placeholder="Ex: 150"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="specialties">Especialidades (separadas por vírgula)</Label>
                                    <Input
                                        id="specialties"
                                        value={specialties}
                                        onChange={(e) => setSpecialties(e.target.value)}
                                        placeholder="Ex: Psicologia Clínica, TCC, ansiedade"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="videoUrl">URL do Vídeo de Apresentação</Label>
                                    <Input
                                        id="videoUrl"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        placeholder="Link do YouTube ou Vimeo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bio">Biografia</Label>
                                    <textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Conte um pouco sobre sua abordagem, experiência e como você pode ajudar o paciente..."
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {bio.length} caracteres
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end border-t p-6">
                                <Button
                                    disabled={isSaving}
                                    onClick={handleSaveProfessionalProfile}
                                >
                                    {isSaving ? "Salvando..." : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Salvar Perfil Profissional
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

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
                                {passwordErrors.length > 0 && (
                                    <div className="space-y-1 mt-2">
                                        {passwordErrors.map((error, index) => (
                                            <p key={index} className="text-xs text-red-600 flex items-center gap-1">
                                                <span className="text-red-600">•</span> {error}
                                            </p>
                                        ))}
                                    </div>
                                )}
                                {passwordErrors.length === 0 && passwords.new.length > 0 && (
                                    <p className="text-xs text-green-600">✓ Senha atende aos requisitos</p>
                                )}
                                {passwords.new.length === 0 && (
                                    <div className="text-xs text-muted-foreground space-y-1 mt-2">
                                        <p className="font-medium">Requisitos da senha:</p>
                                        <p>• Mínimo de 8 caracteres</p>
                                        <p>• Pelo menos uma letra maiúscula</p>
                                        <p>• Pelo menos uma letra minúscula</p>
                                        <p>• Pelo menos um número</p>
                                        <p>• Pelo menos um caractere especial</p>
                                    </div>
                                )}
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
        </div>
    )
}
