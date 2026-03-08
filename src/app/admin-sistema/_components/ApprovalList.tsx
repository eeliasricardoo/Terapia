'use client'

import { useState } from 'react'
import { verifyPsychologist } from '@/lib/actions/admin'
import { Check, X, ShieldAlert, FileText, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'

type PendingPsychologist = {
  id: string
  userId: string
  fullName: string
  email: string
  crp: string | null
  specialties: string[]
  createdAt: string
  avatarUrl?: string | null
}

export function ApprovalList({ initialPending }: { initialPending: PendingPsychologist[] }) {
  const [pending, setPending] = useState(initialPending)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleApprove = async (id: string, name: string) => {
    setLoadingId(id)
    const result = await verifyPsychologist(id)

    if (result.success) {
      toast.success(`Psicólogo ${name} aprovado com sucesso!`)
      setPending((prev) => prev.filter((p) => p.id !== id))
    } else {
      toast.error(result.error || 'Ocorreu um erro ao aprovar.')
    }
    setLoadingId(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pending.map((p) => (
        <div
          key={p.id}
          className="border border-neutral-200 rounded-lg p-5 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center border border-neutral-200">
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={p.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl text-neutral-400 font-semibold">
                      {p.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">{p.fullName}</h3>
                  <p className="text-xs text-neutral-500 font-medium">{p.email}</p>
                </div>
              </div>
              <span title="Aguardando aprovação">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm py-2 border-b border-neutral-100">
                <span className="text-neutral-500 flex items-center">
                  <FileText className="w-4 h-4 mr-2" /> CRP
                </span>
                <span className="font-semibold text-neutral-800">{p.crp || 'Não informado'}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-neutral-100">
                <span className="text-neutral-500 flex items-center">
                  <CalendarDays className="w-4 h-4 mr-2" /> Data Conta
                </span>
                <span className="font-medium text-neutral-800">
                  {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {p.specialties.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs text-neutral-400 font-medium uppercase tracking-wide block mb-2">
                    Especialidades
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {p.specialties.slice(0, 3).map((spec) => (
                      <span
                        key={spec}
                        className="px-2 py-1 text-xs font-semibold rounded-md bg-neutral-100 text-neutral-700"
                      >
                        {spec}
                      </span>
                    ))}
                    {p.specialties.length > 3 && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-md bg-neutral-100 text-neutral-700">
                        +{p.specialties.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleApprove(p.id, p.fullName)}
              disabled={loadingId === p.id}
              className="px-4 py-2 border border-transparent font-medium rounded-lg text-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary w-full flex items-center justify-center transition disabled:opacity-50"
            >
              {loadingId === p.id ? (
                'Aprovando...'
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Aprovar
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
