'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { auth } from '@/lib/supabase/auth'
import { toast } from 'sonner'

export function RegistrationFormSupabase() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        birthDate: '',
        document: '',
        terms: false,
    })

    function handleChange(field: string, value: string | boolean) {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        // Validações
        if (formData.password !== formData.confirmPassword) {
            toast.error('As senhas não coincidem')
            setLoading(false)
            return
        }

        if (!formData.terms) {
            toast.error('Você deve aceitar os termos de uso')
            setLoading(false)
            return
        }

        try {
            const { error } = await auth.signUp(formData.email, formData.password, {
                role: 'PATIENT',
                full_name: formData.name,
                avatar_url: undefined,
            })

            if (error) {
                if (error.message.includes('already registered')) {
                    toast.error('E-mail já cadastrado. Tente fazer login.')
                } else {
                    toast.error(error.message)
                }
            } else {
                toast.success('Conta criada com sucesso! Verifique seu email.')
                router.push('/login/paciente')
            }
        } catch (error) {
            toast.error('Erro ao criar conta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                    id="name"
                    placeholder="João Silva"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="document">CPF</Label>
                <Input
                    id="document"
                    placeholder="000.000.000-00"
                    value={formData.document}
                    onChange={(e) => handleChange('document', e.target.value)}
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                    disabled={loading}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="terms"
                    checked={formData.terms}
                    onCheckedChange={(checked) => handleChange('terms', checked as boolean)}
                    disabled={loading}
                />
                <Label htmlFor="terms" className="text-sm font-normal">
                    Aceito os termos de uso e política de privacidade
                </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
        </form>
    )
}
