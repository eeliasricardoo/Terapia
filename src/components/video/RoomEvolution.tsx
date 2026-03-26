'use client'

import { useState, useEffect, useRef } from 'react'
import { logger } from '@/lib/utils/logger'
import {
  FileText,
  PenLine,
  History,
  Save,
  Loader2,
  CheckCircle2,
  Edit2,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { createSessionEvolution } from '@/lib/actions/evolutions'

type PatientMood = 'bem' | 'neutro' | 'mal' | 'crise' | null

interface RoomEvolutionProps {
  appointmentId?: string
}

export function RoomEvolution({ appointmentId }: RoomEvolutionProps) {
  const [mood, setMood] = useState<PatientMood>(null)
  const [summary, setSummary] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isFinalized, setIsFinalized] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Auto-recovery from localStorage for crash resilience
  useEffect(() => {
    if (!appointmentId || isFinalized) return
    const draftKey = `draft-evolution-${appointmentId}`
    const saved = localStorage.getItem(draftKey)
    if (saved) {
      try {
        const { mood: sMood, summary: sSummary, analysis: sAnalysis } = JSON.parse(saved)
        if (sMood) setMood(sMood)
        if (sSummary) setSummary(sSummary)
        if (sAnalysis) setAnalysis(sAnalysis)
        toast.info('Rascunho recuperado automaticamente.')
      } catch (e) {
        logger.error('Error recovering draft:', e)
      }
    }
  }, [appointmentId, isFinalized])

  // Auto-save draft on changes
  useEffect(() => {
    if (!appointmentId || isFinalized) return
    const draftKey = `draft-evolution-${appointmentId}`
    const timer = setTimeout(() => {
      localStorage.setItem(draftKey, JSON.stringify({ mood, summary, analysis }))
    }, 2000)
    return () => clearTimeout(timer)
  }, [appointmentId, isFinalized, mood, summary, analysis])

  const handleSave = async () => {
    if (!summary.trim() && !analysis.trim()) {
      toast.error('Preencha ao menos um campo da evolução.')
      return
    }

    setIsSaving(true)

    // Handle 'test' rooms or mock rooms
    if (!appointmentId || appointmentId === 'test' || appointmentId.startsWith('mock_')) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsSaving(false)
      setIsFinalized(true)
      setLastSaved(new Date())
      toast.success('Registro salvo (Modo de Teste)', {
        description: 'Em produção, este dado seria enviado ao banco de dados.',
      })
      return
    }

    try {
      const result = await createSessionEvolution({
        appointmentId,
        mood,
        publicSummary: summary,
        privateNotes: analysis,
      })

      if (result.success) {
        setIsFinalized(true)
        setLastSaved(new Date())
        if (appointmentId) localStorage.removeItem(`draft-evolution-${appointmentId}`)
        toast.success('Registro de sessão salvo!', {
          description: 'As informações foram sincronizadas com o prontuário permanente.',
        })
      } else {
        toast.error(result.error || 'Erro ao salvar registro')
      }
    } catch (error) {
      toast.error('Erro de conexão ao salvar registro')
    } finally {
      setIsSaving(false)
    }
  }

  const moods = [
    {
      id: 'bem',
      label: 'Bem',
      icon: Smile,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      id: 'neutro',
      label: 'Neutro',
      icon: Meh,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      id: 'mal',
      label: 'Mal',
      icon: Frown,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
    },
    {
      id: 'crise',
      label: 'Crise',
      icon: AlertCircle,
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
  ]

  return (
    <div className="p-6 m-0 flex-1 flex flex-col space-y-6 bg-white overflow-y-auto">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div className="flex items-center gap-2 text-zinc-500">
          <FileText className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">Registro de Sessão</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded border border-zinc-100 uppercase tracking-tight">
            {new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          {isFinalized && (
            <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-tight">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Finalizada
            </span>
          )}
        </div>
      </div>

      {/* Mood Selector */}
      <section className="space-y-3">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
          COMO O PACIENTE CHEGOU HOJE?
        </label>
        <div className="grid grid-cols-4 gap-2">
          {moods.map((m) => {
            const Icon = m.icon
            const isSelected = mood === m.id
            return (
              <button
                key={m.id}
                disabled={isFinalized}
                onClick={() => setMood(m.id as PatientMood)}
                className={cn(
                  'flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all active:scale-95',
                  isSelected
                    ? `${m.bg} ${m.border} ${m.color} shadow-sm`
                    : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-200'
                )}
              >
                <Icon className={cn('h-5 w-5', isSelected ? m.color : 'opacity-40')} />
                <span className="text-[10px] font-bold">{m.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Form Fields */}
      <div className="flex-1 space-y-5">
        <section className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">
            RESUMO DA SESSÃO (PÚBLICO NO PRONTUÁRIO)
          </label>
          <div
            className={cn(
              'rounded-xl transition-all border',
              isFinalized
                ? 'bg-zinc-50 border-zinc-100 p-4'
                : 'bg-white border-zinc-100 focus-within:border-zinc-300 shadow-sm'
            )}
          >
            {isFinalized ? (
              <p className="text-sm text-zinc-600 leading-relaxed indent-4">
                {summary || '(Sem resumo)'}
              </p>
            ) : (
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="O que foi discutido hoje?"
                className="w-full h-24 p-4 text-sm outline-none resize-none bg-transparent placeholder:text-zinc-300"
              />
            )}
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              ANÁLISE TÉCNICA PRIVADA
            </label>
            <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">
              <ShieldAlert className="h-3 w-3" />
              Sigiloso
            </div>
          </div>
          <div
            className={cn(
              'rounded-xl transition-all border',
              isFinalized
                ? 'bg-zinc-50 border-zinc-100 p-4'
                : 'bg-white border-zinc-100 focus-within:border-zinc-300 shadow-sm'
            )}
          >
            {isFinalized ? (
              <p className="text-sm text-zinc-600 leading-relaxed italic">
                {analysis || '(Sem análise)'}
              </p>
            ) : (
              <textarea
                value={analysis}
                onChange={(e) => setAnalysis(e.target.value)}
                placeholder="Suas impressões técnicas..."
                className="w-full h-28 p-4 text-sm outline-none resize-none bg-transparent placeholder:text-zinc-300"
              />
            )}
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between bg-white shrink-0 sticky bottom-0 -mx-6 px-6 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-zinc-400 text-[10px] font-bold uppercase hover:bg-zinc-50 rounded-lg h-9"
        >
          <History className="h-3.5 w-3.5 mr-2" />
          Histórico
        </Button>
        <div className="flex items-center gap-2">
          {isFinalized ? (
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-200 text-zinc-500 hover:text-zinc-950 hover:border-zinc-800 rounded-lg px-6 font-bold text-xs h-10 transition-all gap-2"
              onClick={() => setIsFinalized(false)}
            >
              <Edit2 className="h-3.5 w-3.5" />
              Editar
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-zinc-950 text-white hover:bg-zinc-800 rounded-lg px-6 font-bold text-xs h-10 transition-all shadow-lg active:scale-95 shadow-zinc-950/20 gap-2"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {isSaving ? 'Gravando...' : 'Salvar Registro'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
