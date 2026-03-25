'use client'
import { logger } from '@/lib/utils/logger'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
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
  AlertCircle,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { ptBR } from 'date-fns/locale'
import { format } from 'date-fns'
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

  // --- Overlap Helpers ---

  const doSlotsOverlap = (a: TimeSlot, b: TimeSlot) => a.start < b.end && b.start < a.end

  const getOverlappingIndices = (slots: TimeSlot[]): Set<number> => {
    const overlapping = new Set<number>()
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (doSlotsOverlap(slots[i], slots[j])) {
          overlapping.add(i)
          overlapping.add(j)
        }
      }
    }
    return overlapping
  }

  const hasAnyOverlap = (): boolean => {
    // Check overrides
    for (const key of Object.keys(overrides)) {
      const ov = overrides[key]
      if (ov.type === 'custom' && getOverlappingIndices(ov.slots).size > 0) return true
    }
    // Check weekly
    for (const day of Object.values(weeklySchedule)) {
      if (day.enabled && getOverlappingIndices(day.slots).size > 0) return true
    }
    return false
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

    const duration = parseInt(sessionDuration)
    const breakTime = parseInt(breakDuration)
    const lastSlot = override.slots[override.slots.length - 1]

    let newStart = '09:00'
    let newEnd = '10:00'

    if (lastSlot) {
      const lastEnd = new Date(`1970-01-01T${lastSlot.end}:00`)
      lastEnd.setMinutes(lastEnd.getMinutes() + breakTime)
      const newEndDate = new Date(lastEnd.getTime() + duration * 60000)

      const pad = (n: number) => n.toString().padStart(2, '0')
      newStart = `${pad(lastEnd.getHours())}:${pad(lastEnd.getMinutes())}`
      newEnd = `${pad(newEndDate.getHours())}:${pad(newEndDate.getMinutes())}`
    }

    setOverrides((prev) => ({
      ...prev,
      [key]: { ...override, slots: [...override.slots, { start: newStart, end: newEnd }] },
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
    if (hasAnyOverlap()) {
      toast.error('Janelas sobrepostas', {
        description: 'Corrija os horários conflitantes antes de salvar.',
      })
      return
    }

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
    } catch (error) {
      logger.error('Error updating appointment status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  // --- Render ---
  const effective = selectedDate ? getEffectiveSchedule(selectedDate) : null
  const effectiveOverlapping =
    effective?.source === 'override' ? getOverlappingIndices(effective.slots) : new Set<number>()
  const hasConflicts = hasAnyOverlap()

  const WeeklyConfigDialog = (
    <Dialog open={isWeeklyConfigOpen} onOpenChange={setIsWeeklyConfigOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 h-9 border-slate-200 text-slate-700">
          <Settings2 className="h-3.5 w-3.5" />
          Rotina Semanal
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
            <label className="text-sm font-medium text-slate-700">Intervalo entre Sessões</label>
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

        <div className="space-y-3 py-4">
          {DAYS_OF_WEEK.map((day) => {
            const daySchedule = weeklySchedule[day.id] || { enabled: false, slots: [] }
            const isAvailable = daySchedule.enabled

            return (
              <div
                key={day.id}
                className={cn(
                  'p-4 rounded-xl border transition-all',
                  isAvailable
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50 border-slate-100 opacity-60'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={isAvailable}
                      onCheckedChange={() => handleWeeklyToggle(day.id)}
                      className="data-[state=checked]:bg-primary"
                    />
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isAvailable ? 'text-slate-900' : 'text-slate-400'
                      )}
                    >
                      {day.fullLabel}
                    </span>
                  </div>
                  {!isAvailable && <span className="text-xs text-slate-400">Indisponível</span>}
                </div>

                {isAvailable && (
                  <div className="mt-3 pl-10 space-y-2">
                    {daySchedule.slots.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                          <Select
                            value={slot.start}
                            onValueChange={(v) => handleWeeklySlotChange(day.id, idx, 'start', v)}
                          >
                            <SelectTrigger className="w-[80px] h-7 border-none bg-transparent shadow-none focus:ring-0 text-sm font-medium">
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
                          <span className="text-slate-300 text-xs">—</span>
                          <Select
                            value={slot.end}
                            onValueChange={(v) => handleWeeklySlotChange(day.id, idx, 'end', v)}
                          >
                            <SelectTrigger className="w-[80px] h-7 border-none bg-transparent shadow-none focus:ring-0 text-sm font-medium">
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
                          className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md"
                          onClick={() => handleWeeklyRemoveSlot(day.id, idx)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/90 hover:bg-primary/10 text-xs h-7 px-2 gap-1"
                      onClick={() => handleWeeklyAddSlot(day.id)}
                    >
                      <Plus className="h-3 w-3" /> Adicionar intervalo
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <DialogFooter>
          <Button onClick={() => setIsWeeklyConfigOpen(false)} className="bg-slate-900 text-white">
            Concluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Gerenciar Agenda</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Controle seus dias e horários de atendimento
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-[160px] h-9 text-xs border-slate-200">
              <SelectValue placeholder="Fuso..." />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {WeeklyConfigDialog}
          <Button
            onClick={handleSave}
            size="sm"
            className={cn(
              'gap-1.5 h-9',
              hasConflicts && 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
            )}
            variant={hasConflicts ? 'outline' : 'default'}
            disabled={isLoading}
            title={hasConflicts ? 'Existem janelas com horários conflitantes' : undefined}
          >
            {hasConflicts ? (
              <AlertCircle className="h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {isLoading ? 'Salvando...' : hasConflicts ? 'Conflito' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-start">
        {/* Calendar */}
        <Card className="lg:col-span-8 border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
          <CardHeader className="border-b border-slate-100 py-3 px-5">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <CalendarIcon className="h-4 w-4" />
              Visão Mensal
            </CardTitle>
          </CardHeader>
          <div className="p-4 flex justify-center items-start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border-0 w-full max-w-lg"
              classNames={{
                month: 'space-y-3 w-full',
                caption: 'flex justify-start pt-1 relative items-center pl-2',
                caption_label: 'text-sm font-bold text-slate-900',
                nav: 'space-x-1 flex items-center absolute right-1 inset-y-0',
                prev: 'h-7 w-7 bg-transparent hover:opacity-100 p-0 text-slate-400 hover:text-slate-900',
                next: 'h-7 w-7 bg-transparent hover:opacity-100 p-0 text-slate-400 hover:text-slate-900',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex w-full justify-between mb-1',
                row: 'flex w-full mt-1 justify-between',
                cell: 'h-12 w-12 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
                day: 'h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-lg transition-all flex flex-col items-center justify-center gap-0.5',
                day_selected:
                  'bg-slate-900 text-white hover:bg-slate-800 hover:text-white shadow-sm',
                day_today: 'bg-slate-50 text-slate-900 font-bold ring-1 ring-slate-200',
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
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <span className="text-sm font-medium leading-none">{date.getDate()}</span>
                      <div className="flex gap-0.5 mt-1">
                        {isBlocked && <div className="h-1 w-1 rounded-full bg-red-400" />}
                        {isCustom && <div className="h-1 w-1 rounded-full bg-indigo-500" />}
                        {hasRoutine && <div className="h-1 w-1 rounded-full bg-blue-500" />}
                        {!hasRoutine && !isBlocked && !isCustom && (
                          <div className="h-1 w-1 rounded-full bg-slate-200" />
                        )}
                        {hasAppt && <div className="h-1 w-1 rounded-full bg-emerald-500" />}
                      </div>
                    </div>
                  )
                },
              }}
            />
          </div>
          <div className="border-t border-slate-100 px-5 py-2.5 flex items-center justify-center gap-5">
            {[
              { color: 'bg-blue-500', label: 'Padrão' },
              { color: 'bg-indigo-500', label: 'Personalizado' },
              { color: 'bg-slate-200', label: 'Dia livre' },
              { color: 'bg-red-400', label: 'Folga' },
              { color: 'bg-emerald-500', label: 'Agendamento' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
                <div className={cn('h-1.5 w-1.5 rounded-full', color)} />
                {label}
              </div>
            ))}
          </div>
        </Card>

        {/* Day Editor Panel */}
        <Card className="lg:col-span-4 border border-slate-200 shadow-sm bg-white flex flex-col overflow-hidden">
          {!selectedDate ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <CalendarIcon className="h-7 w-7 text-slate-400" />
              </div>
              <p className="font-semibold text-slate-600">Selecione um dia</p>
              <p className="text-sm text-slate-400 mt-1 max-w-[180px]">
                Clique em uma data para gerenciar os horários.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div
                className={cn(
                  'px-5 pt-5 pb-4 border-b transition-colors',
                  effective?.type === 'blocked'
                    ? 'bg-red-50 border-red-100'
                    : 'bg-white border-slate-100'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
                      effective?.type === 'blocked'
                        ? 'bg-red-100 text-red-600'
                        : effective?.type === 'custom'
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-blue-50 text-blue-600'
                    )}
                  >
                    {effective?.type === 'blocked' ? (
                      <>
                        <Ban className="h-3 w-3" /> Folga
                      </>
                    ) : effective?.type === 'custom' ? (
                      <>
                        <Settings2 className="h-3 w-3" /> Personalizado
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" /> Rotina semanal
                      </>
                    )}
                  </span>
                  {effective?.source === 'override' && (
                    <button
                      onClick={handleResetOverride}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restaurar padrão
                    </button>
                  )}
                </div>

                <div className="flex items-end gap-2.5">
                  <span className="text-4xl font-bold text-slate-900 leading-none">
                    {format(selectedDate, 'dd', { locale: ptBR })}
                  </span>
                  <div className="pb-0.5">
                    <p className="text-sm font-semibold text-slate-700 capitalize">
                      {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
                    </p>
                    <p className="text-xs text-slate-400 capitalize">
                      {format(selectedDate, 'EEEE', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {effective?.type === 'blocked' ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <div className="h-12 w-12 bg-red-50 rounded-2xl flex items-center justify-center mb-3 border border-red-100">
                      <Ban className="h-6 w-6 text-red-400" />
                    </div>
                    <p className="font-semibold text-slate-700">Dia de folga</p>
                    <p className="text-sm text-slate-400 mt-1 max-w-[200px]">
                      Nenhum horário disponível para seus pacientes.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 border-slate-200 text-slate-600 hover:text-slate-900"
                      onClick={handleResetOverride}
                    >
                      Ativar dia
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Conflict banner */}
                    {effectiveOverlapping.size > 0 && (
                      <div className="mx-4 mt-4 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        Janelas sobrepostas — corrija antes de salvar
                      </div>
                    )}

                    {/* Time windows */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          Janelas de atendimento
                        </span>
                        {(effective?.slots?.length || 0) > 0 && (
                          <span className="text-xs text-slate-400">
                            {effective?.slots?.length} bloco
                            {(effective?.slots?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {(effective?.slots?.length || 0) === 0 ? (
                        <div className="text-center py-6 border border-dashed border-slate-200 rounded-lg">
                          <p className="text-xs text-slate-400">Sem janelas definidas</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {effective?.slots.map((slot, idx) => {
                            const isConflict = effectiveOverlapping.has(idx)
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  'flex items-center gap-2 p-3 rounded-lg border transition-colors',
                                  effective.source === 'override'
                                    ? isConflict
                                      ? 'bg-red-50 border-red-300'
                                      : 'bg-white border-slate-200 hover:border-slate-300'
                                    : 'bg-slate-50 border-slate-100'
                                )}
                              >
                                {effective.source === 'override' ? (
                                  <>
                                    <Select
                                      value={slot.start}
                                      onValueChange={(v) => handleCustomSlotChange(idx, 'start', v)}
                                    >
                                      <SelectTrigger
                                        className={cn(
                                          'h-8 w-[84px] text-sm font-medium focus:ring-0 focus:ring-offset-0',
                                          isConflict
                                            ? 'bg-red-50 border-red-300'
                                            : 'bg-slate-50 border-slate-200'
                                        )}
                                      >
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <div className="grid grid-cols-2">
                                          {HOURS.map((h) => (
                                            <SelectItem key={h} value={h} className="text-xs">
                                              {h}
                                            </SelectItem>
                                          ))}
                                        </div>
                                      </SelectContent>
                                    </Select>
                                    <span className="text-slate-300 text-sm">—</span>
                                    <Select
                                      value={slot.end}
                                      onValueChange={(v) => handleCustomSlotChange(idx, 'end', v)}
                                    >
                                      <SelectTrigger
                                        className={cn(
                                          'h-8 w-[84px] text-sm font-medium focus:ring-0 focus:ring-offset-0',
                                          isConflict
                                            ? 'bg-red-50 border-red-300'
                                            : 'bg-slate-50 border-slate-200'
                                        )}
                                      >
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <div className="grid grid-cols-2">
                                          {HOURS.map((h) => (
                                            <SelectItem key={h} value={h} className="text-xs">
                                              {h}
                                            </SelectItem>
                                          ))}
                                        </div>
                                      </SelectContent>
                                    </Select>
                                    {isConflict && (
                                      <span className="text-xs text-red-500 font-medium shrink-0">
                                        Conflito
                                      </span>
                                    )}
                                    <div className="flex-1" />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md shrink-0"
                                      onClick={() => handleRemoveCustomSlot(idx)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span className="text-sm font-semibold text-slate-800">
                                      {slot.start} — {slot.end}
                                    </span>
                                    <span className="text-xs text-slate-400 ml-auto">Regular</span>
                                  </>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Generated slots */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          Slots gerados
                        </span>
                        <span className="text-xs font-medium text-emerald-600">
                          {getGeneratedSlots(selectedDate!).length} vagas
                        </span>
                      </div>

                      {getGeneratedSlots(selectedDate!).length === 0 ? (
                        <p className="text-xs text-slate-400 py-1">Nenhum slot disponível.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {getGeneratedSlots(selectedDate!).map((time) => {
                            const isBooked = appointments.some(
                              (a) =>
                                a.scheduled_at.startsWith(format(selectedDate!, 'yyyy-MM-dd')) &&
                                format(new Date(a.scheduled_at), 'HH:mm') === time &&
                                a.status !== 'cancelled'
                            )
                            return (
                              <span
                                key={time}
                                className={cn(
                                  'inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border',
                                  isBooked
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-50 text-slate-600 border-slate-200'
                                )}
                              >
                                {time}
                                {isBooked && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                              </span>
                            )
                          })}
                        </div>
                      )}
                      <p className="text-xs text-slate-400">
                        Sessão de {sessionDuration}min · Intervalo de {breakDuration}min
                      </p>
                    </div>

                    {/* Appointments for this day */}
                    {appointments.filter((a) =>
                      a.scheduled_at.startsWith(format(selectedDate!, 'yyyy-MM-dd'))
                    ).length > 0 && (
                      <div className="p-4 space-y-2">
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          Agendamentos
                        </span>
                        <div className="space-y-1.5">
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
                                className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition-colors"
                              >
                                <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-semibold text-xs border border-indigo-100 uppercase shrink-0">
                                  {appt.patient_name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-800 truncate">
                                    {appt.patient_name}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                      <Clock className="h-2.5 w-2.5" />
                                      {format(new Date(appt.scheduled_at), 'HH:mm')}
                                    </span>
                                    <span
                                      className={cn(
                                        'text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded',
                                        appt.status === 'COMPLETED'
                                          ? 'bg-slate-100 text-slate-500'
                                          : 'bg-emerald-100 text-emerald-700'
                                      )}
                                    >
                                      {appt.status}
                                    </span>
                                  </div>
                                </div>
                                {appt.status === 'scheduled' && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                                      onClick={() =>
                                        handleUpdateAppointmentStatus(appt.id, 'COMPLETED')
                                      }
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                                      onClick={() =>
                                        handleUpdateAppointmentStatus(appt.id, 'cancelled')
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer actions */}
              {effective?.type !== 'blocked' && (
                <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                  {effective?.source === 'weekly' ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 h-9 border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 bg-white"
                        onClick={() => handleOverride('custom')}
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                        Personalizar dia
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-3 border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 bg-white"
                        onClick={() => handleOverride('blocked')}
                        title="Marcar folga"
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : effective?.source === 'override' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 h-9 border-dashed border-slate-200 text-slate-500 hover:border-slate-300 bg-white"
                      onClick={handleAddCustomSlot}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Adicionar janela
                    </Button>
                  ) : null}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
