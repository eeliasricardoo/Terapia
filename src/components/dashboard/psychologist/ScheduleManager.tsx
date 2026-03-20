'use client'
import { logger } from '@/lib/utils/logger'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus,
  Trash2,
  Clock,
  Save,
  Calendar as CalendarIcon,
  Ban,
  RotateCcw,
  Settings2,
  Info,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { ptBR } from 'date-fns/locale'
import { format, isSameDay } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

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

type DateOverride = {
  type: 'blocked' | 'custom'
  slots: TimeSlot[]
}

type OverridesMap = {
  [dateStr: string]: DateOverride
}

type ScheduledAppointment = {
  id: string
  scheduled_at: string
  duration: number
  status: string
  patient_name: string
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

export function ScheduleManager() {
  // --- State ---
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [sessionDuration, setSessionDuration] = useState<string>('50')
  const [breakDuration, setBreakDuration] = useState<string>('10')

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

  // Overrides (The "Exception" Layer)
  const [overrides, setOverrides] = useState<OverridesMap>({})
  const [appointments, setAppointments] = useState<ScheduledAppointment[]>([])

  // Dialog State
  const [isWeeklyConfigOpen, setIsWeeklyConfigOpen] = useState(false)

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
        if (ws.breakDuration) {
          setBreakDuration(ws.breakDuration)
        }
        setWeeklySchedule(profile.weekly_schedule as unknown as WeeklySchedule)
      }
      if (profile?.timezone) {
        setTimezone(profile.timezone)
      }

      if (profile) {
        // Load Overrides
        const { data: dbOverrides } = await supabase
          .from('schedule_overrides')
          .select('*')
          .eq('psychologist_id', profile.id)

        if (dbOverrides) {
          const newOverrides: OverridesMap = {}
          dbOverrides.forEach((o) => {
            const slots = (o.slots as unknown as TimeSlot[]) || []
            newOverrides[o.date] = {
              type: o.type as 'blocked' | 'custom',
              slots: slots.map((s) => ({ start: s.start, end: s.end })),
            }
          })
          setOverrides(newOverrides)
        }

        // Load Appointments
        const { data: dbAppointments } = await supabase
          .from('appointments')
          .select(
            `
                        id,
                        scheduled_at,
                        duration_minutes,
                        status,
                        patient:patient_id (
                            full_name
                        )
                    `
          )
          .eq('psychologist_id', profile.id)

        if (dbAppointments) {
          setAppointments(
            dbAppointments.map((a) => ({
              id: a.id,
              scheduled_at: a.scheduled_at,
              duration: a.duration_minutes,
              status: a.status,
              patient_name:
                (a.patient as unknown as { full_name: string })?.full_name || 'Paciente',
            }))
          )
        }
      }
    }
    loadData()
  }, [])

  // --- Helpers ---

  const getDayId = (date: Date) => {
    return format(date, 'EEEE', { locale: ptBR })
      .toLowerCase()
      .replace('-feira', '')
      .replace('ça', 'ca')
      .replace('ábodo', 'abado') // Normalize if needed, but easier to map date-fns day index
      .replace('ç', 'c')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
  }

  // Map standard date-fns format 'EEEE' output to our keys if needed,
  // but simpler to use getDay() index: 0=Sunday, 1=Monday...
  const getWeekDayKey = (date: Date) => {
    const index = date.getDay()
    const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return map[index]
  }

  const getEffectiveSchedule = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    const override = overrides[dateKey]

    if (override) {
      return {
        type: override.type,
        slots: override.slots,
        source: 'override',
      }
    }

    const dayKey = getWeekDayKey(date)
    const weekly = weeklySchedule[dayKey]

    if (!weekly?.enabled) {
      return {
        type: 'blocked',
        slots: [],
        source: 'weekly',
      }
    }

    return {
      type: 'standard',
      slots: weekly.slots,
      source: 'weekly',
    }
  }

  const getGeneratedSlots = (date: Date) => {
    const effective = getEffectiveSchedule(date)
    if (effective.type === 'blocked') return []

    const slots: string[] = []
    const duration = parseInt(sessionDuration)
    const breakTime = parseInt(breakDuration)

    effective.slots.forEach((range) => {
      let current = new Date(`1970-01-01T${range.start}:00`)
      const end = new Date(`1970-01-01T${range.end}:00`)

      while (current < end) {
        const h = current.getHours().toString().padStart(2, '0')
        const m = current.getMinutes().toString().padStart(2, '0')
        const timeStr = `${h}:${m}`

        // Check if there's enough time for the session within the range
        const sessionEnd = new Date(current.getTime() + duration * 60000)
        if (sessionEnd <= end) {
          slots.push(timeStr)
        }

        current = new Date(current.getTime() + (duration + breakTime) * 60000)
      }
    })

    return slots
  }

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

  // --- Handlers: Specific Date ---

  const handleOverride = (type: 'blocked' | 'custom') => {
    if (!selectedDate) return
    const key = format(selectedDate, 'yyyy-MM-dd')

    let initialSlots: TimeSlot[] = []
    if (type === 'custom') {
      // Pre-fill with existing weekly slots or default if empty
      const effective = getEffectiveSchedule(selectedDate)
      initialSlots = effective.slots.length > 0 ? [...effective.slots] : [...DEFAULT_SLOTS]
    }

    setOverrides((prev) => ({
      ...prev,
      [key]: { type, slots: initialSlots },
    }))
  }

  const handleResetOverride = () => {
    if (!selectedDate) return
    const key = format(selectedDate, 'yyyy-MM-dd')
    const { [key]: deleted, ...rest } = overrides
    setOverrides(rest)
    toast('Restaurado para padrão', { description: 'Usando a configuração semanal.' })
  }

  const handleCustomSlotChange = (index: number, field: 'start' | 'end', value: string) => {
    if (!selectedDate) return
    const key = format(selectedDate, 'yyyy-MM-dd')
    const override = overrides[key]
    if (!override || override.type !== 'custom') return

    const newSlots = [...override.slots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setOverrides((prev) => ({ ...prev, [key]: { ...override, slots: newSlots } }))
  }

  const handleAddCustomSlot = () => {
    if (!selectedDate) return
    const key = format(selectedDate, 'yyyy-MM-dd')
    const override = overrides[key]
    if (!override || override.type !== 'custom') return

    setOverrides((prev) => ({
      ...prev,
      [key]: { ...override, slots: [...override.slots, { start: '12:00', end: '13:00' }] },
    }))
  }

  const handleRemoveCustomSlot = (index: number) => {
    if (!selectedDate) return
    const key = format(selectedDate, 'yyyy-MM-dd')
    const override = overrides[key]
    if (!override || override.type !== 'custom') return

    setOverrides((prev) => ({
      ...prev,
      [key]: { ...override, slots: override.slots.filter((_, i) => i !== index) },
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const { updatePsychologistAvailability } = await import('@/lib/actions/availability')

      const result = await updatePsychologistAvailability({
        weeklySchedule,
        sessionDuration,
        breakDuration,
        timezone,
        overrides,
      })

      if (result.success) {
        toast.success('Alterações salvas!', { description: 'Sua disponibilidade foi atualizada.' })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      logger.error('Error saving schedule changes:', error)
      toast.error('Erro ao salvar', {
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateAppointmentStatus = async (id: string, newStatus: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)))

      toast.success(`Sessão marcada como ${newStatus.toLowerCase()}`)
      toast.success(`Sessão marcada como ${newStatus.toLowerCase()}`)
    } catch (error) {
      logger.error('Error updating appointment status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  // --- Render ---
  const effective = selectedDate ? getEffectiveSchedule(selectedDate) : null

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Gerenciar Agenda</h2>
          <p className="text-slate-500">
            Controle total sobre seus dias de atendimento e horários.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-slate-500">Fuso Horário:</span>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Dialog open={isWeeklyConfigOpen} onOpenChange={setIsWeeklyConfigOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
              >
                <Settings2 className="h-4 w-4" />
                Configurar Rotina Semanal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Configurações da Agenda</DialogTitle>
                <DialogDescription>
                  Defina os horários base e a duração das suas sessões.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100 mb-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Duração da Sessão</label>
                  <Select value={sessionDuration} onValueChange={setSessionDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="50">50 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                      <SelectItem value="90">90 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Intervalo entre Sessões
                  </label>
                  <Select value={breakDuration} onValueChange={setBreakDuration}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sem intervalo</SelectItem>
                      <SelectItem value="5">5 minutos</SelectItem>
                      <SelectItem value="10">10 minutos</SelectItem>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="20">20 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6 py-4">
                {DAYS_OF_WEEK.map((day) => {
                  const daySchedule = weeklySchedule[day.id] || { enabled: false, slots: [] }
                  const isAvailable = daySchedule.enabled

                  return (
                    <div
                      key={day.id}
                      className={`p-4 rounded-xl border transition-all ${isAvailable ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-70'}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={isAvailable}
                            onCheckedChange={() => handleWeeklyToggle(day.id)}
                            className="data-[state=checked]:bg-primary"
                          />
                          <span
                            className={`font-semibold ${isAvailable ? 'text-slate-900' : 'text-slate-500'}`}
                          >
                            {day.fullLabel}
                          </span>
                        </div>
                        {!isAvailable && (
                          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                            Indisponível
                          </span>
                        )}
                      </div>

                      {isAvailable && (
                        <div className="pl-12 space-y-3">
                          {daySchedule.slots.map((slot, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-100">
                                <Select
                                  value={slot.start}
                                  onValueChange={(v) =>
                                    handleWeeklySlotChange(day.id, idx, 'start', v)
                                  }
                                >
                                  <SelectTrigger className="w-[90px] h-8 border-none bg-transparent shadow-none focus:ring-0 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {HOURS.map((h) => (
                                      <SelectItem key={h} value={h}>
                                        {h}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <span className="text-slate-300">→</span>
                                <Select
                                  value={slot.end}
                                  onValueChange={(v) =>
                                    handleWeeklySlotChange(day.id, idx, 'end', v)
                                  }
                                >
                                  <SelectTrigger className="w-[90px] h-8 border-none bg-transparent shadow-none focus:ring-0 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
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
                                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                onClick={() => handleWeeklyRemoveSlot(day.id, idx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/90 hover:bg-primary/10 text-xs h-8 px-2"
                            onClick={() => handleWeeklyAddSlot(day.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Adicionar intervalo
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setIsWeeklyConfigOpen(false)}
                  className="bg-slate-900 text-white"
                >
                  Concluir Configuração
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 shadow-sm"
          >
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[600px] h-auto">
        {/* Visual Calendar */}
        <Card className="lg:col-span-8 border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
          <CardHeader className="border-b border-slate-50 pb-4 bg-slate-50/30">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-slate-500">
              <CalendarIcon className="h-4 w-4" />
              Visão Mensal
            </CardTitle>
          </CardHeader>
          <div className="flex-1 p-6 flex justify-center items-start overflow-y-auto">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border-0 w-full max-w-lg"
              classNames={{
                month: 'space-y-4 w-full',
                caption: 'flex justify-start pt-1 relative items-center pl-2',
                caption_label: 'text-sm font-bold text-slate-900',
                nav: 'space-x-1 flex items-center absolute right-1 inset-y-0',
                prev: 'h-7 w-7 bg-transparent hover:opacity-100 p-0 text-slate-400 hover:text-slate-900',
                next: 'h-7 w-7 bg-transparent hover:opacity-100 p-0 text-slate-400 hover:text-slate-900',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex w-full justify-between mb-2',
                row: 'flex w-full mt-2 justify-between',
                cell: 'h-14 w-14 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-14 w-14 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-lg transition-all border border-transparent hover:border-slate-200 flex flex-col items-center justify-center gap-1',
                day_selected:
                  'bg-slate-900 text-white hover:bg-slate-800 hover:text-white border-slate-900 shadow-md',
                day_today: 'bg-slate-50 text-slate-900 font-bold border-slate-200',
              }}
              modifiers={{
                blocked: (date: Date) => overrides[format(date, 'yyyy-MM-dd')]?.type === 'blocked',
                custom: (date: Date) => overrides[format(date, 'yyyy-MM-dd')]?.type === 'custom',
                hasRoutine: (date: Date) => {
                  const key = getWeekDayKey(date)
                  return weeklySchedule[key]?.enabled && !overrides[format(date, 'yyyy-MM-dd')]
                },
                hasAppointment: (date: Date) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  return appointments.some((a) => a.scheduled_at.startsWith(dateStr))
                },
              }}
              components={{
                DayContent: ({ date }: { date: Date }) => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  const isBlocked = overrides[dateStr]?.type === 'blocked'
                  const isCustom = overrides[dateStr]?.type === 'custom'
                  const hasRoutine =
                    weeklySchedule[getWeekDayKey(date)]?.enabled && !isBlocked && !isCustom
                  const hasAppt = appointments.some((a) => a.scheduled_at.startsWith(dateStr))

                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                      <span className="text-sm font-medium">{date.getDate()}</span>
                      <div className="flex gap-0.5 mt-1">
                        {isBlocked && <div className="h-1.5 w-1.5 rounded-full bg-red-400" />}
                        {isCustom && <div className="h-1.5 w-1.5 rounded-full bg-blue-900" />}
                        {hasRoutine && <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                        {!hasRoutine && !isBlocked && !isCustom && (
                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        )}
                        {hasAppt && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                      </div>
                    </div>
                  )
                },
              }}
            />
          </div>
          <CardFooter className="border-t border-slate-50 bg-slate-50/30 p-4 text-xs text-slate-500 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-600" /> Padrão
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-900" /> Personalizado
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-slate-300" /> Dia Livre
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-400" /> Folga
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" /> Agendamento
            </div>
          </CardFooter>
        </Card>

        {/* Day Editor Panel */}
        <Card className="lg:col-span-4 border border-slate-200 shadow-xl bg-white flex flex-col overflow-hidden h-full relative">
          {!selectedDate ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/10">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 opacity-40">
                <CalendarIcon className="h-10 w-10 text-slate-400" />
              </div>
              <p className="font-bold text-slate-500 text-lg">Selecione um dia</p>
              <p className="text-sm mt-2 max-w-[200px] leading-relaxed">
                Clique em uma data no calendário para gerenciar seus horários.
              </p>
            </div>
          ) : (
            <>
              {/* Card Header with Date Info */}
              <div
                className={cn(
                  'p-8 border-b transition-all duration-500',
                  effective?.type === 'blocked'
                    ? 'bg-red-50/50 border-red-100'
                    : effective?.type === 'custom'
                      ? 'bg-slate-900 border-slate-800 shadow-inner' // Dark elegant mode for custom
                      : 'bg-white border-slate-100'
                )}
              >
                <div className="flex items-center justify-between mb-6">
                  <Badge
                    variant="outline"
                    className={cn(
                      'uppercase tracking-[0.2em] text-[10px] font-black px-3 py-1 border-2 transition-all',
                      effective?.type === 'blocked'
                        ? 'text-red-700 border-red-200 bg-white'
                        : effective?.type === 'custom'
                          ? 'text-white border-white/20 bg-white/10'
                          : 'text-blue-600 border-blue-100 bg-blue-50/50'
                    )}
                  >
                    {effective?.type === 'blocked'
                      ? 'DIA BLOQUEADO'
                      : effective?.type === 'custom'
                        ? 'HORÁRIO ESPECIAL'
                        : 'ROTINA SEMANAL'}
                  </Badge>

                  {effective?.source === 'override' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'h-8 px-3 text-[10px] font-black uppercase tracking-widest transition-all',
                        effective?.type === 'custom'
                          ? 'text-slate-400 hover:text-white hover:bg-white/10'
                          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                      )}
                      onClick={handleResetOverride}
                    >
                      <RotateCcw className="h-3 w-3 mr-2" />
                      RESTAURAR PADRÃO
                    </Button>
                  )}
                </div>

                <div className="flex items-baseline gap-3">
                  <span
                    className={cn(
                      'text-5xl font-black tracking-tighter',
                      effective?.type === 'custom' ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    {format(selectedDate, 'dd', { locale: ptBR })}
                  </span>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        'text-sm font-black uppercase tracking-[0.1em]',
                        effective?.type === 'custom' ? 'text-slate-200' : 'text-slate-600'
                      )}
                    >
                      {format(selectedDate, 'MMMM', { locale: ptBR })}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-widest opacity-60',
                        effective?.type === 'custom' ? 'text-white' : 'text-slate-400'
                      )}
                    >
                      {format(selectedDate, 'EEEE', { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Body - Scrollable Area */}
              <div className="flex-1 overflow-y-auto bg-slate-50/20 custom-scrollbar">
                <div className="p-8">
                  {effective?.type === 'blocked' ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                      <div className="h-24 w-24 bg-red-50 rounded-3xl flex items-center justify-center border-2 border-red-100 shadow-md rotate-3">
                        <Ban className="h-12 w-12 text-red-400" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-black text-slate-900 text-xl tracking-tight">
                          Dia de Folga
                        </h4>
                        <p className="text-sm text-slate-500 max-w-[260px] mx-auto leading-relaxed">
                          Este dia foi marcado como indisponível. Nenhum horário aparecerá para seus
                          pacientes.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="mt-6 border-2 border-slate-200 text-slate-700 bg-white hover:border-red-500 hover:text-red-500 transition-all font-black px-10 h-12 rounded-xl"
                        onClick={handleResetOverride}
                      >
                        ATIVAR DIA
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {/* Attendance Periods Section */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] inline-flex items-center">
                            <Clock className="h-3 w-3 mr-2 text-indigo-400" />
                            Janelas de Atendimento
                          </h4>
                          {(effective?.slots?.length || 0) > 0 && (
                            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                              {effective?.slots?.length || 0} BLOCO
                              {(effective?.slots?.length || 0) === 1 ? '' : 'S'}
                            </span>
                          )}
                        </div>

                        {(effective?.slots?.length || 0) === 0 ? (
                          <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-inner">
                            <p className="text-xs font-bold text-slate-400">
                              Sem horários definidos.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {effective?.slots.map((slot, idx) => (
                              <div
                                key={idx}
                                className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                                style={{ animationDelay: `${idx * 100}ms` }}
                              >
                                <div
                                  className={cn(
                                    'flex items-center justify-between p-5 rounded-3xl border-2 transition-all duration-300',
                                    effective.source === 'override'
                                      ? 'bg-white border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-xl hover:-translate-y-1'
                                      : 'bg-blue-50/50 border-blue-100/50'
                                  )}
                                >
                                  <div className="flex items-center gap-6">
                                    {effective.source === 'override' ? (
                                      <>
                                        <div className="space-y-2">
                                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">
                                            Início
                                          </span>
                                          <Select
                                            value={slot.start}
                                            onValueChange={(v) =>
                                              handleCustomSlotChange(idx, 'start', v)
                                            }
                                          >
                                            <SelectTrigger className="h-12 w-[100px] bg-slate-50 border-2 border-slate-100 hover:border-blue-400 font-bold text-slate-900 rounded-2xl transition-all outline-none ring-0 shadow-none focus:ring-0">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <div className="grid grid-cols-2">
                                                {HOURS.map((h) => (
                                                  <SelectItem
                                                    key={h}
                                                    value={h}
                                                    className="text-xs font-bold"
                                                  >
                                                    {h}
                                                  </SelectItem>
                                                ))}
                                              </div>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="h-8 w-1 bg-slate-100 self-end mb-2 rounded-full hidden sm:block" />
                                        <div className="space-y-2">
                                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">
                                            Fim
                                          </span>
                                          <Select
                                            value={slot.end}
                                            onValueChange={(v) =>
                                              handleCustomSlotChange(idx, 'end', v)
                                            }
                                          >
                                            <SelectTrigger className="h-12 w-[100px] bg-slate-50 border-2 border-slate-100 hover:border-blue-400 font-bold text-slate-900 rounded-2xl transition-all outline-none ring-0 shadow-none focus:ring-0">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <div className="grid grid-cols-2">
                                                {HOURS.map((h) => (
                                                  <SelectItem
                                                    key={h}
                                                    value={h}
                                                    className="text-xs font-bold"
                                                  >
                                                    {h}
                                                  </SelectItem>
                                                ))}
                                              </div>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="py-2 pl-4">
                                        <p className="text-xl font-black text-slate-800 tracking-tight">
                                          {slot.start} — {slot.end}
                                        </p>
                                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">
                                          Horário Regular
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {effective.source === 'override' && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all mr-2"
                                      onClick={() => handleRemoveCustomSlot(idx)}
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Logic Buttons / Actions */}
                      {effective?.source === 'weekly' ? (
                        <div className="pt-4 space-y-4">
                          <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t-2 border-slate-100 border-dashed"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] bg-[#fbfbfb] px-4">
                              Alternativas
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <Button
                              className="bg-white border-2 border-slate-200 text-slate-900 hover:border-blue-600 hover:bg-blue-50/50 hover:text-blue-600 transition-all font-black h-16 rounded-3xl shadow-sm text-sm"
                              onClick={() => handleOverride('custom')}
                            >
                              <Settings2 className="h-5 w-5 mr-3 text-blue-500" />
                              PERSONALIZAR DIA
                            </Button>
                            <Button
                              variant="ghost"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 font-black h-14 rounded-2xl text-[11px] tracking-widest uppercase"
                              onClick={() => handleOverride('blocked')}
                            >
                              <Ban className="h-4 w-4 mr-2" /> MARCAR FOLGA
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-8 border-t-2 border-slate-100 border-dashed">
                          <Button
                            variant="outline"
                            className="w-full border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-white h-16 rounded-3xl transition-all group"
                            onClick={handleAddCustomSlot}
                          >
                            <Plus className="h-5 w-5 mr-2 group-hover:scale-125 transition-transform" />
                            <span className="font-black text-xs uppercase tracking-widest">
                              Adicionar Horário
                            </span>
                          </Button>
                        </div>
                      )}

                      {/* Generated Slots Preview */}
                      <div className="pt-8 space-y-6">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-emerald-500" />
                          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                            Slots de Consulta Gerados
                          </h4>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm space-y-6">
                          <div className="flex flex-wrap gap-2">
                            {getGeneratedSlots(selectedDate!).length === 0 ? (
                              <p className="text-xs text-slate-400 italic py-2">
                                Nenhum slot disponível.
                              </p>
                            ) : (
                              getGeneratedSlots(selectedDate!).map((time) => {
                                const isBooked = appointments.some(
                                  (a) =>
                                    a.scheduled_at.startsWith(
                                      format(selectedDate!, 'yyyy-MM-dd')
                                    ) &&
                                    format(new Date(a.scheduled_at), 'HH:mm') === time &&
                                    a.status !== 'cancelled'
                                )
                                return (
                                  <Badge
                                    key={time}
                                    variant="outline"
                                    className={cn(
                                      'px-3 py-1 text-[11px] font-black h-8 rounded-xl transition-all',
                                      isBooked
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-inner'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                                    )}
                                  >
                                    {time}
                                    {isBooked && (
                                      <CheckCircle2 className="h-3 w-3 ml-2 text-emerald-500" />
                                    )}
                                  </Badge>
                                )
                              })
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest pt-4 border-t border-slate-100">
                            <span className="text-slate-400">
                              Tempo de Sessão: {sessionDuration}m
                            </span>
                            <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                              {getGeneratedSlots(selectedDate!).length} VAGAS DISPONÍVEIS
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Appointments list (footer of panel context) */}
                      {appointments.filter((a) =>
                        a.scheduled_at.startsWith(format(selectedDate!, 'yyyy-MM-dd'))
                      ).length > 0 && (
                        <div className="pt-12 space-y-6">
                          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] inline-flex items-center">
                            <Users className="h-4 w-4 mr-2 text-indigo-400" />
                            Meus Agendamentos de Hoje
                          </h4>
                          <div className="space-y-4">
                            {appointments
                              .filter((a) =>
                                a.scheduled_at.startsWith(format(selectedDate!, 'yyyy-MM-dd'))
                              )
                              .sort(
                                (a, b) =>
                                  new Date(a.scheduled_at).getTime() -
                                  new Date(b.scheduled_at).getTime()
                              )
                              .map((appt) => (
                                <div
                                  key={appt.id}
                                  className="bg-white border-2 border-slate-100 p-4 rounded-3xl flex items-center justify-between hover:shadow-lg transition-all"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xs border border-indigo-100 uppercase">
                                      {appt.patient_name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-sm font-black text-slate-800">
                                        {appt.patient_name}
                                      </p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                          <Clock className="h-2.5 w-2.5" />
                                          {format(new Date(appt.scheduled_at), 'HH:mm')}
                                        </span>
                                        <Badge
                                          className={cn(
                                            'text-[9px] font-black uppercase tracking-tighter px-2 h-5 rounded-md',
                                            appt.status === 'COMPLETED'
                                              ? 'bg-slate-100 text-slate-500'
                                              : 'bg-emerald-500 text-white'
                                          )}
                                        >
                                          {appt.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {appt.status === 'scheduled' && (
                                      <>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-10 w-10 rounded-2xl hover:bg-emerald-50 text-emerald-600 transition-all"
                                          onClick={() =>
                                            handleUpdateAppointmentStatus(appt.id, 'COMPLETED')
                                          }
                                        >
                                          <CheckCircle2 className="h-5 w-5" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-10 w-10 rounded-2xl hover:bg-red-50 text-red-400 transition-all"
                                          onClick={() =>
                                            handleUpdateAppointmentStatus(appt.id, 'cancelled')
                                          }
                                        >
                                          <Trash2 className="h-5 w-5" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
