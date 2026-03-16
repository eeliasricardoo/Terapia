'use client'

import { useState } from 'react'
import { Lock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export function SecuritySettingsCard() {
  const [isLoading, setIsLoading] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const validatePassword = (password: string): string[] => {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Senha deve ter pelo menos 8 caracteres')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra minúscula')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Senha deve conter pelo menos um número')
    }
    if (!/[\W_]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial')
    }

    return errors
  }

  const handlePasswordChange = () => {
    setPasswordErrors([])

    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error('Preencha todos os campos', {
        description: 'Todos os campos de senha são obrigatórios.',
      })
      return
    }

    const errors = validatePassword(passwords.new)
    if (errors.length > 0) {
      setPasswordErrors(errors)
      toast.error('Senha não atende aos requisitos', {
        description: 'Verifique os requisitos abaixo.',
      })
      return
    }

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
      setPasswords({ current: '', new: '', confirm: '' })
      setPasswordErrors([])
      toast.success('Senha alterada com sucesso!', {
        description: 'Sua senha foi atualizada.',
        duration: 3000,
      })
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Senha</CardTitle>
        <CardDescription>Altere sua senha para manter sua conta segura.</CardDescription>
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
        <Button variant="outline" className="mr-4">
          Cancelar
        </Button>
        <Button onClick={handlePasswordChange} disabled={isLoading}>
          {isLoading ? 'Alterando...' : 'Alterar Senha'}
        </Button>
      </CardFooter>
    </Card>
  )
}
