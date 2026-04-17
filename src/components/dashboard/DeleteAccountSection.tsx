'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Trash2, AlertTriangle, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { deleteAccount } from '@/lib/actions/account'
import { useRouter } from '@/i18n/routing'

const CONFIRMATION_TEXT = 'EXCLUIR MINHA CONTA'

export function DeleteAccountSection() {
  const [confirmationInput, setConfirmationInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  const isConfirmed = confirmationInput === CONFIRMATION_TEXT

  const handleDelete = async () => {
    if (!isConfirmed) return

    setIsDeleting(true)
    try {
      const result = await deleteAccount({ confirmation: confirmationInput })

      if (result.success) {
        toast.success('Conta excluída com sucesso', {
          description: 'Seus dados pessoais foram removidos. Redirecionando...',
        })
        // Give time for toast, then redirect
        setTimeout(() => {
          router.push('/')
          window.location.href = '/'
        }, 2000)
      } else {
        toast.error('Erro ao excluir conta', {
          description: result.error || 'Tente novamente mais tarde.',
        })
      }
    } catch {
      toast.error('Erro inesperado', {
        description: 'Não foi possível processar a exclusão. Tente novamente.',
      })
    } finally {
      setIsDeleting(false)
      setDialogOpen(false)
      setConfirmationInput('')
    }
  }

  return (
    <Card className="border border-red-200 shadow-sm bg-red-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-red-700">
          <ShieldAlert className="h-5 w-5" />
          Zona de Perigo
        </CardTitle>
        <CardDescription className="text-red-600/80">
          Ações irreversíveis que afetam permanentemente sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/80 border border-red-100 rounded-xl p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">
                Excluir minha conta permanentemente
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Esta ação é <strong>irreversível</strong>. Todos os seus dados pessoais, mensagens,
                diário emocional e configurações serão permanentemente excluídos. Registros clínicos
                (prontuários) serão anonimizados conforme exigência legal (Resolução CFP 001/2009).
              </p>
            </div>
          </div>

          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir minha conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Confirmar exclusão de conta
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4 text-left">
                  <p>Esta ação é permanente e não pode ser desfeita. Serão removidos:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Seus dados pessoais (nome, CPF, telefone, endereço)</li>
                    <li>Mensagens e conversas</li>
                    <li>Diário emocional</li>
                    <li>Notificações e configurações</li>
                    <li>Sessões futuras agendadas (serão canceladas)</li>
                  </ul>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                    <strong>Nota legal:</strong> Registros clínicos (evoluções e anamnese) serão
                    anonimizados, não deletados, conforme Resolução CFP 001/2009 e LGPD Art. 16,
                    inciso II.
                  </div>
                  <div className="space-y-2 pt-2">
                    <Label
                      htmlFor="delete-confirmation"
                      className="text-sm font-bold text-slate-700"
                    >
                      Digite <span className="text-red-600 font-mono">{CONFIRMATION_TEXT}</span>{' '}
                      para confirmar:
                    </Label>
                    <Input
                      id="delete-confirmation"
                      value={confirmationInput}
                      onChange={(e) => setConfirmationInput(e.target.value)}
                      placeholder={CONFIRMATION_TEXT}
                      className="font-mono text-sm border-slate-300"
                      autoComplete="off"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmationInput('')} className="font-bold">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={!isConfirmed || isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
                >
                  {isDeleting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Excluindo...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Excluir permanentemente
                    </span>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
