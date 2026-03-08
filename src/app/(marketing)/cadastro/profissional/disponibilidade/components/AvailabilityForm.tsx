'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

// --- Types ---

type TimeSlot = {
  start: string
  end: string
}

type DaySchedule = {
  enabled: boolean
  slots: TimeSlot[]
}

type WeeklySchedule = {
  [key: string]: DaySchedule
}

// --- Constants ---

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Segunda', fullLabel: 'Segunda-feira' },
  { id: 'tuesday', label: 'Terça', fullLabel: 'Terça-feira' },
  { id: 'wednesday', label: 'Quarta', fullLabel: 'Quarta-feira' },
  { id: 'thursday', label: 'Quinta', fullLabel: 'Quinta-feira' },
  { id: 'friday', label: 'Sexta', fullLabel: 'Sexta-feira' },
  { id: 'saturday', label: 'Sábado', fullLabel: 'Sábado' },
  { id: 'sunday', label: 'Domingo', fullLabel: 'Domingo' },
]

const HOURS = Array.from({ length: 24 }).map((_, i) => i.toString().padStart(2, '0') + ':00')

const DEFAULT_SLOTS: TimeSlot[] = [
  { start: '09:00', end: '12:00' },
  { start: '14:00', end: '18:00' },
]

const TIMEZONES = [
  'America/Sao_Paulo',
  'America/Manaus',
  'America/Belem',
  'America/Fortaleza',
  'America/Recife',
  'America/Cuiaba',
  'America/Bahia',
  'Europe/Lisbon',
  'Europe/London',
  'UTC',
]

export function AvailabilityForm() {
  const router = useRouter()
  // --- State ---
  const [isLoading, setIsLoading] = useState(false)
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [sessionDuration, setSessionDuration] = useState<string>('50')

  // Weekly Routine (The "Base" Layer)
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: { enabled: true, slots: [...DEFAULT_SLOTS] },
    tuesday: { enabled: true, slots: [...DEFAULT_SLOTS] },
    wednesday: { enabled: true, slots: [...DEFAULT_SLOTS] },
    thursday: { enabled: true, slots: [...DEFAULT_SLOTS] },
    friday: { enabled: true, slots: [{ start: '09:00', end: '16:00' }] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  })

  // --- Load Data ---
  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Load Profile (Weekly Schedule)
      const { data: profile } = await supabase
        .from('psychologist_profiles')
        .select('id, weekly_schedule, timezone')
        .eq('userId', user.id)
        .single()

      if (profile?.weekly_schedule) {
        const ws = profile.weekly_schedule as any
        if (ws.sessionDuration) {
          setSessionDuration(ws.sessionDuration)
        }
        setWeeklySchedule(profile.weekly_schedule as unknown as WeeklySchedule)
      }
      if (profile?.timezone) {
        setTimezone(profile.timezone)
      }
    }
    loadData()
  }, [])

  // --- Handlers: Weekly ---

  const handleWeeklyToggle = (dayId: string) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], enabled: !prev[dayId].enabled },
    }))
  }

  const handleWeeklySlotChange = (
    dayId: string,
    index: number,
    field: 'start' | 'end',
    value: string
  ) => {
    setWeeklySchedule((prev) => {
      const newSlots = [...prev[dayId].slots]
      newSlots[index] = { ...newSlots[index], [field]: value }
      return { ...prev, [dayId]: { ...prev[dayId], slots: newSlots } }
    })
  }

  const handleWeeklyAddSlot = (dayId: string) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], slots: [...prev[dayId].slots, { start: '09:00', end: '10:00' }] },
    }))
  }

  const handleWeeklyRemoveSlot = (dayId: string, index: number) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayId]: { ...prev[dayId], slots: prev[dayId].slots.filter((_, i) => i !== index) },
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Simulated success for availability without auth in dev')
          toast.success('Disponibilidade salva!')
          router.push('/cadastro/profissional/pagamento')
          return
        }
        return
      }

      // 1. Get Profile ID
      const { data: profile } = await supabase
        .from('psychologist_profiles')
        .select('id')
        .eq('userId', user.id)
        .single()

      if (!profile) throw new Error('Perfil não encontrado')

      // 2. Save Weekly Schedule
      const { error } = await supabase
        .from('psychologist_profiles')
        .update({
          weekly_schedule: { ...weeklySchedule, sessionDuration } as unknown as {
            [key: string]: any
          },
          timezone: timezone,
        })
        .eq('id', profile.id)

      if (error) {
        console.error('Error saving schedule:', error)
        toast.error('Erro ao salvar', {
          description: 'Tente novamente mais tarde.',
        })
        return
      }

      toast.success('Disponibilidade salva!', {
        description: 'Seus horários foram atualizados com sucesso.',
      })
      router.push('/cadastro/profissional/pagamento')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar', { description: 'Tente novamente mais tarde.' })
    } finally {
      setIsLoading(false)
    }
  }

  // --- Render ---
  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Configurar sua Disponibilidade
          </h2>
          <p className="text-slate-500 mt-2 text-lg">
            Selecione os dias e horários em que você estará disponível para atender seus pacientes.
          </p>
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100/50 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 bg-emerald-500 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <p className="text-sm text-emerald-800 font-medium relative z-10">
              💡 <strong>Não se preocupe!</strong> Você poderá configurar exceções (feriados,
              folgas, dias específicos) e alterar essa rotina a qualquer momento através da página
              de Agenda no seu painel.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mt-2 pt-4 border-t border-slate-100">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">Duração da Sessão:</span>
            <Select value={sessionDuration} onValueChange={setSessionDuration}>
              <SelectTrigger className="w-[180px] h-[44px] bg-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="50">50 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="90">1 hora e 30 min</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">Fuso Horário Local:</span>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-[280px] h-[44px] bg-white">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Routine list inline */}
      <Card className="border border-slate-200/60 shadow-xl shadow-slate-200/20 bg-white/70 backdrop-blur-xl overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-slate-100 pb-5 bg-white/50">
          <CardTitle className="text-xl font-bold text-slate-800">Sua Rotina Semanal</CardTitle>
          <CardDescription className="text-slate-500 text-[15px]">
            Defina os horários base para cada dia da semana. Ative apenas os dias que deseja
            trabalhar.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {DAYS_OF_WEEK.map((day) => {
              const daySchedule = weeklySchedule[day.id] || { enabled: false, slots: [] }
              const isAvailable = daySchedule.enabled

              return (
                <div
                  key={day.id}
                  className={`p-6 transition-all flex flex-col sm:flex-row gap-6 ${isAvailable ? 'bg-white' : 'bg-slate-50/40'}`}
                >
                  <div className="flex items-center gap-4 sm:w-[200px] shrink-0">
                    <Switch
                      checked={isAvailable}
                      onCheckedChange={() => handleWeeklyToggle(day.id)}
                      className="data-[state=checked]:bg-emerald-500 shadow-sm"
                    />
                    <span
                      className={`font-bold text-[15px] ${isAvailable ? 'text-slate-900' : 'text-slate-400'}`}
                    >
                      {day.fullLabel}
                    </span>
                  </div>

                  <div className="flex-1 transition-all">
                    {!isAvailable ? (
                      <span className="text-sm font-medium text-slate-400 tracking-wide flex items-center h-10 px-2">
                        Indisponível neste dia
                      </span>
                    ) : (
                      <div className="space-y-4">
                        {daySchedule.slots.length === 0 && (
                          <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md font-medium border border-amber-100/50">
                            Nenhum horário definido. Por favor, adicione um intervalo.
                          </div>
                        )}
                        {daySchedule.slots.map((slot, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-50/80 p-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                              <Select
                                value={slot.start}
                                onValueChange={(v) =>
                                  handleWeeklySlotChange(day.id, idx, 'start', v)
                                }
                              >
                                <SelectTrigger className="w-[105px] h-10 bg-white text-sm font-bold shadow-sm border-slate-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[250px]">
                                  {HOURS.map((h) => (
                                    <SelectItem key={h} value={h}>
                                      {h}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <span className="text-slate-400 font-medium px-1 text-sm">até</span>
                              <Select
                                value={slot.end}
                                onValueChange={(v) => handleWeeklySlotChange(day.id, idx, 'end', v)}
                              >
                                <SelectTrigger className="w-[105px] h-10 bg-white text-sm font-bold shadow-sm border-slate-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="max-h-[250px]">
                                  {HOURS.map((h) => (
                                    <SelectItem key={h} value={h}>
                                      {h}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => handleWeeklyRemoveSlot(day.id, idx)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#D9416D] hover:text-[#D9416D] hover:bg-[#D9416D]/10 text-[14px] h-10 px-3 font-bold mt-1 -ml-3 rounded-lg transition-colors"
                          onClick={() => handleWeeklyAddSlot(day.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Adicionar intervalo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-6 pb-12">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/cadastro/profissional/dados')}
          className="h-[48px] px-6 font-semibold border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
        >
          Voltar
        </Button>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-[#D9416D] text-white hover:bg-[#D9416D]/90 shadow-lg shadow-[#D9416D]/20 font-bold h-[48px] px-10 rounded-xl"
        >
          {isLoading ? 'Salvando...' : 'Próximo Passo'}
        </Button>
      </div>
    </div>
  )
}
