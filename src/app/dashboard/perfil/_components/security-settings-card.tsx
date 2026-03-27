'use client'

import { useState } from 'react'
import { Lock, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
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

import { updatePassword } from '@/lib/actions/auth'

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
    if (password.length < 8) errors.push('Senha deve ter pelo menos 8 caracteres')
    if (!/[A-Z]/.test(password)) errors.push('Senha deve conter pelo menos uma letra maiúscula')
    if (!/[a-z]/.test(password)) errors.push('Senha deve conter pelo menos uma letra minúscula')
    if (!/[0-9]/.test(password)) errors.push('Senha deve conter pelo menos um número')
    if (!/[\W_]/.test(password)) errors.push('Senha deve conter pelo menos um caractere especial')
    return errors
  }

  const handleCancel = () => {
    setPasswords({ current: '', new: '', confirm: '' })
    setPasswordErrors([])
  }

  const handlePasswordChange = async () => {
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
    try {
      const result = await updatePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new,
      })

      if (result.success) {
        setPasswords({ current: '', new: '', confirm: '' })
        setPasswordErrors([])
        toast.success('Senha alterada com sucesso!', {
          description: 'Sua senha foi atualizada.',
          duration: 3000,
        })
      } else {
        toast.error('Erro ao alterar senha', {
          description: result.error,
        })
      }
    } catch (err) {
      toast.error('Ocorreu um erro inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden animate-in fade-in duration-700">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none" />

      <div className="relative space-y-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-200 text-white shrink-0">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Segurança da Conta</h2>
            <p className="text-slate-500 font-medium text-sm">
              Altere sua senha periodicamente para manter sua conta segura.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
          <div className="space-y-8">
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                Senha Atual
              </Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <Input
                  type="password"
                  className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all font-medium"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                />
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Nova Senha
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <Input
                    type="password"
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all font-medium"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Confirmar Nova Senha
                </Label>
                <div className="relative group">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                  <Input
                    type="password"
                    className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all font-medium"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex flex-col justify-between">
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
                Requisitos de Segurança
              </h4>

              <div className="space-y-3">
                {[
                  { label: '8+ caracteres', met: passwords.new.length >= 8 },
                  { label: 'Letra maiúscula', met: /[A-Z]/.test(passwords.new) },
                  { label: 'Letra minúscula', met: /[a-z]/.test(passwords.new) },
                  { label: 'Pelo menos um número', met: /[0-9]/.test(passwords.new) },
                  { label: 'Caractere especial', met: /[\W_]/.test(passwords.new) },
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-5 w-5 rounded-full flex items-center justify-center border-2 transition-all',
                        req.met
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-200 bg-white'
                      )}
                    >
                      {req.met && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                    <span
                      className={cn(
                        'text-xs font-medium transition-colors',
                        req.met ? 'text-slate-900' : 'text-slate-400'
                      )}
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 flex items-center justify-end gap-4">
              <Button
                variant="ghost"
                className="rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 font-bold px-6"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold px-8 shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-20"
                onClick={handlePasswordChange}
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Atualizar Senha'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
