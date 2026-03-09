'use client'

import { useState } from 'react'
import { suspendPsychologistAccess } from '@/lib/actions/admin'
import { ShieldAlert, ShieldCheck, Mail, Calendar, Ban } from 'lucide-react'
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
  const [suspendReason, setSuspendReason] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPsy, setSelectedPsy] = useState<Psychologist | null>(null)

  const filtered = psychologists.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.crp && p.crp.includes(searchTerm))
  )

  const handleSuspend = async () => {
    if (!selectedPsy) return
    if (!suspendReason.trim()) {
      toast.error('Informe o motivo da suspensão para prosseguir.')
      return
    }

    setLoadingId(selectedPsy.id)
    const result = await suspendPsychologistAccess(selectedPsy.id, suspendReason)

    if (result.success) {
      toast.success(`O acesso de ${selectedPsy.fullName} foi suspenso com sucesso.`)
      setPsychologists((prev) =>
        prev.map((p) =>
          p.id === selectedPsy.id ? { ...p, isVerified: false, suspensionReason: suspendReason } : p
        )
      )
      setIsDialogOpen(false)
      setSuspendReason('')
    } else {
      toast.error(result.error || 'Ocorreu um erro ao suspender a conta.')
    }
    setLoadingId(null)
  }

  const openSuspendDialog = (p: Psychologist) => {
    setSelectedPsy(p)
    setIsDialogOpen(true)
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
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                          <Ban className="w-3.5 h-3.5 mr-1" />
                          Suspenso
                        </span>
                        <div className="text-xs text-red-600/80 text-left max-w-[200px] break-words whitespace-normal leading-tight">
                          <span className="font-semibold block">Motivo:</span>
                          {p.suspensionReason}
                        </div>
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

      {/* Suspend Dialog controlled state */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspender Acesso de {selectedPsy?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-neutral-500">
              Ao suspender, o psicólogo não poderá mais receber novos agendamentos públicos e você
              será exigido a revalidá-lo. Um e-mail será enviado com o motivo abaix.
            </p>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Motivo da Suspensão
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="w-full border border-neutral-300 rounded-md shadow-sm text-sm p-3 min-h-[100px] focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                placeholder="Descreva o motivo que o levou a revogar este acesso..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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
    </div>
  )
}
