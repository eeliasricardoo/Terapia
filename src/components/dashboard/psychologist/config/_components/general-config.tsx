'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign, Check, Loader2 } from 'lucide-react'

interface GeneralConfigProps {
  sessionPrice: string
  setSessionPrice: (val: string) => void
  sessionDuration: string
  setSessionDuration: (val: string) => void
  averagePlatformPrice: string | null
  isSaving: boolean
  onSave: () => void
}

export function GeneralConfig({
  sessionPrice,
  setSessionPrice,
  sessionDuration,
  setSessionDuration,
  averagePlatformPrice,
  isSaving,
  onSave,
}: GeneralConfigProps) {
  return (
    <Card className="border border-slate-200 shadow-sm bg-white">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          Configuração Base
        </CardTitle>
        <CardDescription>
          Este é o valor padrão que será exibido no seu perfil para agendamentos avulsos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-slate-600">
              Valor da Sessão (R$)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                R$
              </span>
              <Input
                id="price"
                value={sessionPrice}
                onChange={(e) => setSessionPrice(e.target.value)}
                className="pl-10 text-lg font-semibold border-slate-200 bg-slate-50 focus:bg-white"
              />
            </div>
            {averagePlatformPrice && (
              <p className="text-xs text-slate-400">
                O valor médio na plataforma é R${' '}
                {Number(averagePlatformPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-slate-600">
              Duração (Minutos)
            </Label>
            <Select value={sessionDuration} onValueChange={setSessionDuration}>
              <SelectTrigger id="duration" className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="50">50 minutos (Padrão)</SelectItem>
                <SelectItem value="60">60 minutos</SelectItem>
                <SelectItem value="90">90 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6 flex justify-end">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-slate-900 text-white shadow-sm hover:bg-slate-800"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardFooter>
    </Card>
  )
}
