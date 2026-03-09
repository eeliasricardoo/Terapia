'use client'

import { useState } from 'react'
import { suspendPsychologistAccess } from '@/lib/actions/admin'
import { ShieldAlert, ShieldCheck, Mail, Calendar, Ban, Eye } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type Psychologist = {
  id: string
  userId: string
  fullName: string
  email: string
  crp: string | null
  specialties: string[]
  isVerified: boolean
  suspensionReason?: string | null
  createdAt: string
  avatarUrl?: string | null
}

export function PsychologistList({
  psychologists: initialPsychologists,
}: {
  psychologists: Psychologist[]
}) {
  const [psychologists, setPsychologists] = useState(initialPsychologists)
  const [searchTerm, setSearchTerm] = useState('')

  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Suspension State
  const [suspendReason, setSuspendReason] = useState('')
  const [sendEmailNotification, setSendEmailNotification] = useState(true)
  const [emailMessage, setEmailMessage] = useState('')
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false)
  const [selectedPsy, setSelectedPsy] = useState<Psychologist | null>(null)

  // View Reason State
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false)
  const [viewReasonData, setViewReasonData] = useState<Psychologist | null>(null)

  const filtered = psychologists.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.crp && p.crp.includes(searchTerm))
  )

  const handleSuspend = async () => {
    if (!selectedPsy) return
    if (!suspendReason.trim()) {
      toast.error('Informe o motivo interno da suspensão para prosseguir.')
      return
    }

    setLoadingId(selectedPsy.id)
    const result = await suspendPsychologistAccess(
      selectedPsy.id,
      suspendReason,
      sendEmailNotification,
      emailMessage
    )

    if (result.success) {
      toast.success(`O acesso de ${selectedPsy.fullName} foi suspenso com sucesso.`)
      setPsychologists((prev) =>
        prev.map((p) =>
          p.id === selectedPsy.id ? { ...p, isVerified: false, suspensionReason: suspendReason } : p
        )
      )
      setIsSuspendDialogOpen(false)
      setSuspendReason('')
      setEmailMessage('')
      setSendEmailNotification(true)
    } else {
      toast.error(result.error || 'Ocorreu um erro ao suspender a conta.')
    }
    setLoadingId(null)
  }

  const openSuspendDialog = (p: Psychologist) => {
    setSelectedPsy(p)
    setIsSuspendDialogOpen(true)
  }

  const openReasonDialog = (p: Psychologist) => {
    setViewReasonData(p)
    setIsReasonDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Buscar por nome, email ou CRP"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-md px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        />
        <div className="text-sm text-neutral-500 font-medium">
          Total: {filtered.length} registrados
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                >
                  Profissional
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                >
                  CRP
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                >
                  Entrada
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200">
                        {p.avatarUrl ? (
                          <img className="h-full w-full object-cover" src={p.avatarUrl} alt="" />
                        ) : (
                          <span className="text-lg text-neutral-400 font-semibold">
                            {p.fullName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900">{p.fullName}</div>
                        <div className="text-sm text-neutral-500 flex items-center mt-0.5">
                          <Mail className="w-3.5 h-3.5 mr-1" /> {p.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900 font-medium">{p.crp || '---'}</div>
                  </td>
                  <td className="px-6 py-4">
                    {p.isVerified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        Aprovado
                      </span>
                    ) : p.suspensionReason ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                          <Ban className="w-3.5 h-3.5 mr-1" />
                          Suspenso
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 py-0 text-xs font-medium text-neutral-500 hover:text-neutral-700 bg-white"
                          onClick={() => openReasonDialog(p)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          Motivo
                        </Button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 whitespace-nowrap">
                        <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                        Aguardando Aprovação
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {p.isVerified && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                        onClick={() => openSuspendDialog(p)}
                        disabled={loadingId === p.id}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Suspender
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-neutral-500 font-medium"
                  >
                    Nenhum psicólogo encontrado na busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend Action Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Suspender Acesso de {selectedPsy?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-neutral-500">
              O psicólogo não poderá mais receber novos agendamentos e precisará ser revalidado.
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-1">
                  Motivo Interno <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-neutral-500 mb-2">
                  Este motivo ficará registrado apenas para administradores.
                </p>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full border border-neutral-300 rounded-md shadow-sm text-sm p-3 min-h-[80px] focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  placeholder="Descreva o motivo que o levou a revogar este acesso..."
                />
              </div>

              <div className="border-t border-neutral-100 pt-4">
                <label className="flex items-center space-x-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={sendEmailNotification}
                    onChange={(e) => setSendEmailNotification(e.target.checked)}
                    className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-neutral-900">
                    Notificar profissional por E-mail
                  </span>
                </label>

                {sendEmailNotification && (
                  <div className="pl-6 transition-all animate-in fade-in duration-300">
                    <label className="block text-sm font-semibold text-neutral-900 mb-1">
                      Mensagem para o Psicólogo (Opcional)
                    </label>
                    <p className="text-xs text-neutral-500 mb-2">
                      Se vazio, o e-mail enviará o motivo interno acima.
                    </p>
                    <textarea
                      value={emailMessage}
                      onChange={(e) => setEmailMessage(e.target.value)}
                      className="w-full border border-neutral-300 rounded-md shadow-sm text-sm p-3 min-h-[80px] focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      placeholder="Mensagem amigável que será enviada no corpo do e-mail..."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuspendDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={!suspendReason.trim() || loadingId === selectedPsy?.id}
            >
              {loadingId === selectedPsy?.id ? 'Aguarde...' : 'Confirmar Suspensão'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Reason Dialog */}
      <Dialog open={isReasonDialogOpen} onOpenChange={setIsReasonDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Suspensão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-sm text-red-900">
              <span className="block font-semibold mb-2">
                Profissional: {viewReasonData?.fullName}
              </span>
              <p className="whitespace-pre-wrap leading-relaxed">
                {viewReasonData?.suspensionReason || 'Nenhum motivo registrado pelo administrador.'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReasonDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
