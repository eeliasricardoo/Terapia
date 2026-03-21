'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  User,
  Calendar,
  History,
  Edit2,
  Check,
  X,
  Phone,
  ExternalLink,
  ClipboardList,
  Loader2,
  FileText,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getPatientInfoByAppointment, getPatientSessionHistory } from '@/lib/actions/patients'

interface RoomRecordProps {
  appointmentId?: string
}

export function RoomRecord({ appointmentId }: RoomRecordProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [patientData, setPatientData] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      if (!appointmentId || appointmentId === 'test' || appointmentId.startsWith('mock_')) {
        // Mock data for dev
        setPatientData({
          name: 'Ana Beatriz Silva',
          age: '32 anos',
          sex: 'Feminino',
          phone: '(11) 98765-4321',
          birthDate: '15/05/1993',
          complaint:
            'Dificuldade em manter o sono e picos de ansiedade durante o dia após mudanças no trabalho.',
        })
        setHistory([
          { scheduledAt: '12 Out, 2025', status: 'COMPLETED' },
          { scheduledAt: '05 Out, 2025', status: 'COMPLETED' },
        ])
        setIsLoading(false)
        return
      }

      try {
        const info = await getPatientInfoByAppointment(appointmentId)
        if (info) {
          setPatientData(info)
          const sessionHistory = await getPatientSessionHistory(info.id)
          setHistory(sessionHistory)
        }
      } catch (error) {
        console.error('Error loading patient record:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [appointmentId])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-zinc-400 gap-4 bg-white h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-950">
          Sincronizando Prontuário...
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto h-full">
      {/* Patient Identification Card */}
      <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 font-bold text-xl uppercase shadow-sm">
              {patientData?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900 leading-tight tracking-tight">
                {patientData?.name}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-wide">
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> {patientData?.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" /> {patientData?.birthDate || '32 ANOS'}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl border-zinc-200 text-zinc-400 hover:text-zinc-900 transition-all shadow-sm"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white border border-zinc-100 rounded-xl shadow-sm group hover:border-zinc-300 transition-all">
            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              Última Sessão
            </p>
            <p className="text-xs font-bold text-zinc-700 group-hover:text-zinc-950">
              {history[0]?.scheduledAt || 'Primeira sessão'}
            </p>
          </div>
          <div className="p-3 bg-white border border-zinc-100 rounded-xl shadow-sm group hover:border-zinc-300 transition-all">
            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
              Frequência
            </p>
            <p className="text-xs font-bold text-zinc-700 group-hover:text-zinc-950">Semanal</p>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="p-6 space-y-8 pb-12 bg-white">
        {/* Anamnesis / Complaint */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-zinc-950">
              <ClipboardList className="h-4 w-4 opacity-40" />
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest">
                Queixa & Prontuário
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[9px] font-bold uppercase text-zinc-400 hover:text-zinc-900"
            >
              Editar
            </Button>
          </div>
          <div className="p-5 bg-zinc-50/50 border border-zinc-100 rounded-2xl shadow-sm text-sm text-zinc-600 leading-relaxed italic border-l-4 border-l-zinc-900">
            &quot;
            {patientData?.complaint ||
              'Paciente relata estresse crônico associado a demandas de trabalho e dificuldades de sono. Apresenta sintomas moderados de ansiedade generalizada.'}
            &quot;
          </div>
        </section>

        {/* Historical Timeline */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1 text-zinc-950">
            <History className="h-4 w-4 opacity-40" />
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest">
              Histórico Recente
            </h3>
          </div>
          <div className="space-y-2.5">
            {history.length === 0 ? (
              <div className="p-8 border border-dashed border-zinc-100 rounded-2xl flex flex-col items-center justify-center text-zinc-300">
                <p className="text-[10px] uppercase font-bold tracking-widest">
                  Sem sessões anteriores
                </p>
              </div>
            ) : (
              history.slice(0, 3).map((session, i) => (
                <div
                  key={i}
                  className="group flex items-center justify-between p-4 bg-white border border-zinc-100 rounded-2xl hover:bg-zinc-50 hover:border-zinc-300 transition-all cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-zinc-200 group-hover:bg-zinc-950 transition-colors" />
                    <div>
                      <span className="text-xs font-bold text-zinc-600 group-hover:text-zinc-950 transition-colors">
                        {session.scheduledAt}
                      </span>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight mt-0.5">
                        Sessão Individual
                      </p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-500 text-[9px] font-bold uppercase tracking-tight group-hover:bg-zinc-200 group-hover:text-zinc-600 transition-colors">
                    {session.status === 'COMPLETED' ? 'Realizada' : 'Concluída'}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="pt-4 flex flex-col items-center gap-4">
          <Separator className="bg-zinc-100 w-12" />
          <button className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-950 transition-all flex items-center gap-2 px-4 py-2 hover:bg-zinc-50 rounded-xl">
            <FileText className="h-3.5 w-3.5" />
            Ver ficha completa do paciente
          </button>
        </section>
      </div>
    </div>
  )
}
