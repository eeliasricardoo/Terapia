'use client'

import { User, Phone, Mail, Save, Calendar, FileText, Briefcase, UserCircle } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { updateUserProfile } from '../actions'
import { UserProfile } from '../_hooks/use-profile-data'

interface PersonalInfoCardProps {
  user: UserProfile | null
  setUser: (updater: (prev: UserProfile | null) => UserProfile | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function PersonalInfoCard({
  user,
  setUser,
  isLoading,
  setIsLoading,
}: PersonalInfoCardProps) {
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
        zip_code: user.zip_code,
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
    <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden animate-in fade-in duration-700">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl pointer-events-none" />

      <div className="relative space-y-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl shadow-slate-900/20 text-white shrink-0">
            <UserCircle className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dados Pessoais</h2>
            <p className="text-slate-500 font-medium text-sm">
              Mantenha suas informações básicas sempre atualizadas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              Nome Completo
            </Label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
              <Input
                value={user?.name || ''}
                onChange={(e) =>
                  setUser((prev) => (prev ? { ...prev, name: e.target.value } : null))
                }
                className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all font-medium"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              CPF / Documento
            </Label>
            <div className="relative group">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
              <Input
                value={user?.document || ''}
                onChange={(e) =>
                  setUser((prev) => (prev ? { ...prev, document: e.target.value } : null))
                }
                className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all font-medium"
                disabled={isLoading}
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              Data de Nascimento
            </Label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
              <Input
                type="date"
                value={user?.birth_date ? user.birth_date.substring(0, 10) : ''}
                onChange={(e) =>
                  setUser((prev) => (prev ? { ...prev, birth_date: e.target.value } : null))
                }
                className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all font-medium"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              Gênero
            </Label>
            <Select
              value={user?.gender || undefined}
              onValueChange={(value) =>
                setUser((prev) => (prev ? { ...prev, gender: value } : null))
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all font-medium pl-6">
                <SelectValue placeholder="Selecione seu gênero" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
                <SelectItem value="Não-binário">Não-binário</SelectItem>
                <SelectItem value="Prefiro não dizer">Prefiro não dizer</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              Profissão
            </Label>
            <div className="relative group">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
              <Input
                value={user?.profession || ''}
                onChange={(e) =>
                  setUser((prev) => (prev ? { ...prev, profession: e.target.value } : null))
                }
                className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all font-medium"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              Telefone / WhatsApp
            </Label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
              <Input
                placeholder="(00) 00000-0000"
                value={user?.phone || ''}
                onChange={(e) =>
                  setUser((prev) => (prev ? { ...prev, phone: e.target.value } : null))
                }
                className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all font-medium"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="md:col-span-2 pt-4">
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                Email{' '}
                <span className="text-[10px] lowercase italic font-normal">(não alterável)</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-200" />
                <Input
                  value={user?.email || ''}
                  disabled
                  className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50 text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <Button
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="rounded-2xl bg-slate-900 text-white hover:bg-slate-800 h-14 px-12 font-bold shadow-2xl shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-20 flex items-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
