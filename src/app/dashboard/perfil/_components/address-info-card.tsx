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
    <Card>
      <CardHeader>
        <CardTitle>Endereço</CardTitle>
        <CardDescription>Informações de localização para faturamento e prontuário.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address_line">Logradouro (Endereço e Número)</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="address_line"
              value={user?.address_line || ''}
              onChange={(e) =>
                setUser((prev) => (prev ? { ...prev, address_line: e.target.value } : null))
              }
              className="pl-9"
              disabled={isLoading}
              placeholder="Ex: Rua das Flores, 123 - Apto 10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="zip_code">CEP</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="zip_code"
                value={user?.zip_code || ''}
                onChange={(e) =>
                  setUser((prev) => (prev ? { ...prev, zip_code: e.target.value } : null))
                }
                className="pl-9"
                disabled={isLoading}
                placeholder="00000-000"
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={user?.city || ''}
              onChange={(e) => setUser((prev) => (prev ? { ...prev, city: e.target.value } : null))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="state">Estado (UF)</Label>
            <Input
              id="state"
              value={user?.state || ''}
              onChange={(e) =>
                setUser((prev) => (prev ? { ...prev, state: e.target.value } : null))
              }
              disabled={isLoading}
              placeholder="Ex: SP"
              maxLength={2}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t p-6">
        <Button onClick={handleSaveAddress} disabled={isLoading}>
          {isLoading ? (
            <>Salvando...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Endereço
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
