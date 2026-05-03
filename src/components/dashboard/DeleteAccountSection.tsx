'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { deleteUserAccount } from '@/lib/actions/account'
import { toast } from 'sonner'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DeleteAccountSection() {
  const [confirmed, setConfirmed] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleDelete() {
    setIsPending(true)
    try {
      const result = await deleteUserAccount({ confirm: confirmed })
      if (result?.success) {
        toast.success('Conta excluída com sucesso.')
      } else {
        toast.error(result?.error || 'Erro ao excluir conta.')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro inesperado ao excluir conta.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Card className="border-rose-100 bg-rose-50/30">
      <CardHeader>
        <CardTitle className="text-rose-900 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Zona de Perigo: Excluir Conta
        </CardTitle>
        <CardDescription className="text-rose-700/70">
          A exclusão da conta é permanente e removerá todos os seus dados pessoais, históricos de
          sessões e prontuários, conforme as diretrizes da LGPD.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="bg-rose-600 hover:bg-rose-700 font-bold px-8 rounded-xl shadow-lg shadow-rose-200"
            >
              Excluir Minha Conta Permanentemente
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[450px] rounded-3xl border-rose-100">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-black text-rose-900 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
                Você tem certeza absoluta?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 py-2">
                Esta ação <strong className="text-rose-600">não pode ser desfeita</strong>. Se você
                tiver sessões agendadas, precisará cancelá-las antes de prosseguir. Todos os seus
                dados clínicos e mensagens serão apagados permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex items-start space-x-3 p-4 bg-white rounded-2xl border border-rose-100 my-4 shadow-inner">
              <Checkbox
                id="confirm"
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                className="mt-1 border-rose-200 data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
              />
              <Label
                htmlFor="confirm"
                className="text-sm font-medium leading-tight text-slate-700 cursor-pointer"
              >
                Compreendo que esta ação é definitiva e que meus dados serão removidos
                permanentemente conforme a LGPD.
              </Label>
            </div>

            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="rounded-2xl border-slate-200 font-bold h-12">
                Cancelar
              </AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={!confirmed || isPending}
                onClick={handleDelete}
                className="rounded-2xl font-bold h-12 bg-rose-600 hover:bg-rose-700 px-6 shadow-lg shadow-rose-200"
              >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sim, Excluir Minha Conta
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
