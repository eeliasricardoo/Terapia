'use client'

import { MapPin, Building2, Building, Hash, Save } from 'lucide-react'
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
import { toast } from 'sonner'
import { updateUserProfile } from '../actions'
import { UserProfile } from '../_hooks/use-profile-data'

interface AddressInfoCardProps {
  user: UserProfile | null
  setUser: (updater: (prev: UserProfile | null) => UserProfile | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function AddressInfoCard({ user, setUser, isLoading, setIsLoading }: AddressInfoCardProps) {
  const handleSaveAddress = async () => {
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
        toast.error('Erro ao salvar endereço', { description: result.error })
        return
      }

      toast.success('Endereço atualizado!', {
        description: 'Seus dados de endereço foram salvos com sucesso.',
      })
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Erro ao salvar endereço')
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
            <MapPin className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Endereço</h2>
            <p className="text-slate-500 font-medium text-sm">
              Informações de localização para faturamento e prontuário.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
              Logradouro (Endereço e Número)
            </Label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
              <Input
                value={user?.address_line || ''}
                onChange={(e) =>
                  setUser((prev) => (prev ? { ...prev, address_line: e.target.value } : null))
                }
                className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all font-medium"
                disabled={isLoading}
                placeholder="Ex: Rua das Flores, 123 - Apto 10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                CEP
              </Label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <Input
                  value={user?.zip_code || ''}
                  onChange={(e) =>
                    setUser((prev) => (prev ? { ...prev, zip_code: e.target.value } : null))
                  }
                  className="pl-12 h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all font-medium"
                  disabled={isLoading}
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                Cidade
              </Label>
              <Input
                value={user?.city || ''}
                onChange={(e) =>
                  setUser((prev) => (prev ? { ...prev, city: e.target.value } : null))
                }
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all font-medium px-6"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">
                Estado (UF)
              </Label>
              <Input
                value={user?.state || ''}
                onChange={(e) =>
                  setUser((prev) => (prev ? { ...prev, state: e.target.value } : null))
                }
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-slate-900/5 focus:border-slate-200 transition-all font-medium px-6 text-center"
                disabled={isLoading}
                placeholder="Ex: SP"
                maxLength={2}
              />
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <Button
            onClick={handleSaveAddress}
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
                Salvar Endereço
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
