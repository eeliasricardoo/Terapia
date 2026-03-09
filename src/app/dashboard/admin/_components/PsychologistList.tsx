'use client'

import { useState } from 'react'
import { verifyPsychologist, rejectPsychologist } from '@/lib/actions/admin'
import { ShieldAlert, ShieldCheck, Mail, Calendar, Stethoscope } from 'lucide-react'

type Psychologist = {
  id: string
  userId: string
  fullName: string
  email: string
  crp: string | null
  specialties: string[]
  isVerified: boolean
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

  const filtered = psychologists.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.crp && p.crp.includes(searchTerm))
  )

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
          Total: {filtered.length} psicólogos
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    {p.isVerified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        Aprovado
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                        Aguardando
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                    </div>
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
    </div>
  )
}
