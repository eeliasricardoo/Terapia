"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus, Trash2, Clock, Save, Calendar as CalendarIcon, Ban, RotateCcw, Settings2, Info, CheckCircle2, Users } from "lucide-react"
import { toast } from "sonner"
import { ptBR } from "date-fns/locale"
import { format, isSameDay } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

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
    { id: "monday", label: "Segunda", fullLabel: "Segunda-feira" },
    { id: "tuesday", label: "Terça", fullLabel: "Terça-feira" },
    { id: "wednesday", label: "Quarta", fullLabel: "Quarta-feira" },
    { id: "thursday", label: "Quinta", fullLabel: "Quinta-feira" },
    { id: "friday", label: "Sexta", fullLabel: "Sexta-feira" },
    { id: "saturday", label: "Sábado", fullLabel: "Sábado" },
    { id: "sunday", label: "Domingo", fullLabel: "Domingo" },
]

const HOURS = Array.from({ length: 24 }).map((_, i) => i.toString().padStart(2, '0') + ":00")

const DEFAULT_SLOTS: TimeSlot[] = [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }]

const TIMEZONES = [
    "America/Sao_Paulo",
    "America/Manaus",
    "America/Belem",
    "America/Fortaleza",
    "America/Recife",
    "America/Cuiaba",
    "America/Bahia",
    "Europe/Lisbon",
    "Europe/London",
    "UTC"
]

export function ScheduleManager() {
    // --- State ---
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [isLoading, setIsLoading] = useState(false)
    const [timezone, setTimezone] = useState("America/Sao_Paulo")

    // Weekly Routine (The "Base" Layer)
    const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
        monday: { enabled: true, slots: [...DEFAULT_SLOTS] },
        tuesday: { enabled: true, slots: [...DEFAULT_SLOTS] },
        wednesday: { enabled: true, slots: [...DEFAULT_SLOTS] },
        thursday: { enabled: true, slots: [...DEFAULT_SLOTS] },
        friday: { enabled: true, slots: [{ start: "09:00", end: "16:00" }] },
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
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Load Profile (Weekly Schedule)
            const { data: profile } = await supabase
                .from('psychologist_profiles')
                .select('id, weekly_schedule, timezone')
                .eq('userId', user.id)
                .single()

            if (profile?.weekly_schedule) {
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
                    dbOverrides.forEach(o => {
                        const slots = (o.slots as unknown as TimeSlot[]) || []
                        newOverrides[o.date] = {
                            type: o.type as 'blocked' | 'custom',
                            slots: slots.map(s => ({ start: s.start, end: s.end }))
                        }
                    })
                    setOverrides(newOverrides)
                }

                // Load Appointments
                const { data: dbAppointments } = await supabase
                    .from('appointments')
                    .select(`
                        id,
                        scheduled_at,
                        duration_minutes,
                        status,
                        patient:patient_id (
                            full_name
                        )
                    `)
                    .eq('psychologist_id', profile.id)

                if (dbAppointments) {
                    setAppointments(dbAppointments.map(a => ({
                        id: a.id,
                        scheduled_at: a.scheduled_at,
                        duration: a.duration_minutes,
                        status: a.status,
                        patient_name: (a.patient as unknown as { full_name: string })?.full_name || 'Paciente'
                    })))
                }
            }
        }
        loadData()
    }, [])

    // --- Helpers ---

    const getDayId = (date: Date) => {
        return format(date, 'EEEE', { locale: ptBR }).toLowerCase()
            .replace('-feira', '')
            .replace('ça', 'ca')
            .replace('ábodo', 'abado') // Normalize if needed, but easier to map date-fns day index
            .replace('ç', 'c')
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    }

    // Map standard date-fns format 'EEEE' output to our keys if needed, 
    // but simpler to use getDay() index: 0=Sunday, 1=Monday...
    const getWeekDayKey = (date: Date) => {
        const index = date.getDay()
        const map = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
        return map[index]
    }

    const getEffectiveSchedule = (date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd')
        const override = overrides[dateKey]

        if (override) {
            return {
                type: override.type,
                slots: override.slots,
                source: 'override'
            }
        }

        const dayKey = getWeekDayKey(date)
        const weekly = weeklySchedule[dayKey]

        if (!weekly?.enabled) {
            return {
                type: 'blocked',
                slots: [],
                source: 'weekly'
            }
        }

        return {
            type: 'standard',
            slots: weekly.slots,
            source: 'weekly'
        }
    }

    // --- Handlers: Weekly ---

    const handleWeeklyToggle = (dayId: string) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], enabled: !prev[dayId].enabled }
        }))
    }

    const handleWeeklySlotChange = (dayId: string, index: number, field: 'start' | 'end', value: string) => {
        setWeeklySchedule(prev => {
            const newSlots = [...prev[dayId].slots]
            newSlots[index] = { ...newSlots[index], [field]: value }
            return { ...prev, [dayId]: { ...prev[dayId], slots: newSlots } }
        })
    }

    const handleWeeklyAddSlot = (dayId: string) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], slots: [...prev[dayId].slots, { start: "09:00", end: "10:00" }] }
        }))
    }

    const handleWeeklyRemoveSlot = (dayId: string, index: number) => {
        setWeeklySchedule(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], slots: prev[dayId].slots.filter((_, i) => i !== index) }
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

        setOverrides(prev => ({
            ...prev,
            [key]: { type, slots: initialSlots }
        }))
    }

    const handleResetOverride = () => {
        if (!selectedDate) return
        const key = format(selectedDate, 'yyyy-MM-dd')
        const { [key]: deleted, ...rest } = overrides
        setOverrides(rest)
        toast("Restaurado para padrão", { description: "Usando a configuração semanal." })
    }

    const handleCustomSlotChange = (index: number, field: 'start' | 'end', value: string) => {
        if (!selectedDate) return
        const key = format(selectedDate, 'yyyy-MM-dd')
        const override = overrides[key]
        if (!override || override.type !== 'custom') return

        const newSlots = [...override.slots]
        newSlots[index] = { ...newSlots[index], [field]: value }
        setOverrides(prev => ({ ...prev, [key]: { ...override, slots: newSlots } }))
    }

    const handleAddCustomSlot = () => {
        if (!selectedDate) return
        const key = format(selectedDate, 'yyyy-MM-dd')
        const override = overrides[key]
        if (!override || override.type !== 'custom') return

        setOverrides(prev => ({
            ...prev,
            [key]: { ...override, slots: [...override.slots, { start: "12:00", end: "13:00" }] }
        }))
    }

    const handleRemoveCustomSlot = (index: number) => {
        if (!selectedDate) return
        const key = format(selectedDate, 'yyyy-MM-dd')
        const override = overrides[key]
        if (!override || override.type !== 'custom') return

        setOverrides(prev => ({
            ...prev,
            [key]: { ...override, slots: override.slots.filter((_, i) => i !== index) }
        }))
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Get Profile ID
            const { data: profile } = await supabase
                .from('psychologist_profiles')
                .select('id')
                .eq('userId', user.id)
                .single()

            if (!profile) throw new Error("Perfil não encontrado")

            // 2. Save Weekly Schedule
            // Using unknown here to satisfy Supabase's Json type constraint while passing our defined type
            await supabase
                .from('psychologist_profiles')
                .update({
                    weekly_schedule: weeklySchedule as unknown as { [key: string]: any },
                    timezone: timezone
                })
                .eq('id', profile.id)

            // 3. Save Overrides
            // 3a. Get existing overrides to know what to delete
            const { data: dbOverrides } = await supabase
                .from('schedule_overrides')
                .select('date')
                .eq('psychologist_id', profile.id)

            const dbDates = dbOverrides?.map(o => o.date) || []
            const stateDates = Object.keys(overrides)

            // Dates to delete: in DB but not in State
            const datesToDelete = dbDates.filter(d => !stateDates.includes(d))

            // Dates to upsert: all in State
            const overridesToUpsert = stateDates.map(date => ({
                psychologist_id: profile.id,
                date: date,
                type: overrides[date].type,
                slots: overrides[date].slots as unknown as { [key: string]: any }
            }))

            if (datesToDelete.length > 0) {
                await supabase
                    .from('schedule_overrides')
                    .delete()
                    .eq('psychologist_id', profile.id)
                    .in('date', datesToDelete)
            }

            if (overridesToUpsert.length > 0) {
                await supabase
                    .from('schedule_overrides')
                    .upsert(overridesToUpsert, { onConflict: 'psychologist_id,date' })
            }

            toast.success("Alterações salvas!", { description: "Sua disponibilidade foi atualizada." })
        } catch (error) {
            console.error(error)
            toast.error("Erro ao salvar", { description: "Tente novamente mais tarde." })
        } finally {
            setIsLoading(false)
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
                    <p className="text-slate-500">Controle total sobre seus dias de atendimento e horários.</p>
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-slate-500">Fuso Horário:</span>
                        <Select value={timezone} onValueChange={setTimezone}>
                            <SelectTrigger className="w-[180px] h-8 text-xs">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {TIMEZONES.map(tz => (
                                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Dialog open={isWeeklyConfigOpen} onOpenChange={setIsWeeklyConfigOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50">
                                <Settings2 className="h-4 w-4" />
                                Configurar Rotina Semanal
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Rotina Semanal Padrão</DialogTitle>
                                <DialogDescription>
                                    Defina os horários base para cada dia da semana.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {DAYS_OF_WEEK.map((day) => {
                                    const daySchedule = weeklySchedule[day.id] || { enabled: false, slots: [] }
                                    const isAvailable = daySchedule.enabled

                                    return (
                                        <div key={day.id} className={`p-4 rounded-xl border transition-all ${isAvailable ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-70'}`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={isAvailable}
                                                        onCheckedChange={() => handleWeeklyToggle(day.id)}
                                                        className="data-[state=checked]:bg-blue-600"
                                                    />
                                                    <span className={`font-semibold ${isAvailable ? 'text-slate-900' : 'text-slate-500'}`}>
                                                        {day.fullLabel}
                                                    </span>
                                                </div>
                                                {!isAvailable && <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Indisponível</span>}
                                            </div>

                                            {isAvailable && (
                                                <div className="pl-12 space-y-3">
                                                    {daySchedule.slots.map((slot, idx) => (
                                                        <div key={idx} className="flex items-center gap-3">
                                                            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-md border border-slate-100">
                                                                <Select value={slot.start} onValueChange={(v) => handleWeeklySlotChange(day.id, idx, 'start', v)}>
                                                                    <SelectTrigger className="w-[90px] h-8 border-none bg-transparent shadow-none focus:ring-0 text-sm">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                                <span className="text-slate-300">→</span>
                                                                <Select value={slot.end} onValueChange={(v) => handleWeeklySlotChange(day.id, idx, 'end', v)}>
                                                                    <SelectTrigger className="w-[90px] h-8 border-none bg-transparent shadow-none focus:ring-0 text-sm">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleWeeklyRemoveSlot(day.id, idx)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs h-8 px-2" onClick={() => handleWeeklyAddSlot(day.id)}>
                                                        <Plus className="h-3 w-3 mr-1" /> Adicionar intervalo
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setIsWeeklyConfigOpen(false)} className="bg-slate-900 text-white">Concluir Configuração</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Button onClick={handleSave} className="bg-slate-900 text-white hover:bg-slate-800 gap-2 shadow-sm">
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
                                month: "space-y-4 w-full",
                                caption: "flex justify-start pt-1 relative items-center pl-2",
                                caption_label: "text-sm font-bold text-slate-900",
                                nav: "space-x-1 flex items-center absolute right-1 inset-y-0",
                                prev: "h-7 w-7 bg-transparent hover:opacity-100 p-0 text-slate-400 hover:text-slate-900",
                                next: "h-7 w-7 bg-transparent hover:opacity-100 p-0 text-slate-400 hover:text-slate-900",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex w-full justify-between mb-2",
                                row: "flex w-full mt-2 justify-between",
                                cell: "h-14 w-14 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-slate-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-14 w-14 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-lg transition-all border border-transparent hover:border-slate-200 flex flex-col items-center justify-center gap-1",
                                day_selected: "bg-slate-900 text-white hover:bg-slate-800 hover:text-white border-slate-900 shadow-md",
                                day_today: "bg-slate-50 text-slate-900 font-bold border-slate-200",
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
                                    return appointments.some(a => a.scheduled_at.startsWith(dateStr))
                                }
                            }}
                            components={{
                                DayContent: ({ date }: { date: Date }) => {
                                    const dateStr = format(date, 'yyyy-MM-dd')
                                    const isBlocked = overrides[dateStr]?.type === 'blocked'
                                    const isCustom = overrides[dateStr]?.type === 'custom'
                                    const hasRoutine = weeklySchedule[getWeekDayKey(date)]?.enabled && !isBlocked && !isCustom
                                    const hasAppt = appointments.some(a => a.scheduled_at.startsWith(dateStr))

                                    return (
                                        <div className="w-full h-full flex flex-col items-center justify-center relative">
                                            <span className="text-sm font-medium">{date.getDate()}</span>
                                            <div className="flex gap-0.5 mt-1">
                                                {isBlocked && <div className="h-1.5 w-1.5 rounded-full bg-red-400" />}
                                                {isCustom && <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                                                {hasRoutine && <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
                                                {!hasRoutine && !isBlocked && !isCustom && <div className="h-1.5 w-1.5 rounded-full border border-slate-200" />}
                                                {hasAppt && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                                            </div>
                                        </div>
                                    )
                                }
                            }}
                        />
                    </div>
                    <CardFooter className="border-t border-slate-50 bg-slate-50/30 p-4 text-xs text-slate-500 flex justify-center gap-6">
                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-slate-300" /> Padrão</div>
                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-500" /> Personalizado</div>
                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-red-400" /> Bloqueado</div>
                        <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Agendamento</div>
                    </CardFooter>
                </Card>

                {/* Day Editor Panel */}
                <Card className="lg:col-span-4 border border-slate-200 shadow-lg bg-white flex flex-col overflow-hidden h-full relative">
                    {!selectedDate ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                            <p className="font-medium text-slate-500">Nenhum dia selecionado</p>
                            <p className="text-sm mt-1">Clique em uma data no calendário para editar seus horários.</p>
                        </div>
                    ) : (
                        <>
                            {/* Card Header with Date Info */}
                            <div className={`p-6 border-b transition-colors ${effective?.type === 'blocked' ? 'bg-red-50 border-red-100' : effective?.type === 'custom' ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className={`bg-white uppercase tracking-wide text-[10px] font-bold h-5 ${effective?.type === 'blocked' ? 'text-red-700 border-red-200' : effective?.type === 'custom' ? 'text-blue-700 border-blue-200' : 'text-slate-600 border-slate-200'}`}>
                                        {effective?.type === 'blocked' ? 'Bloqueado' : effective?.type === 'custom' ? 'Personalizado' : 'Rotina Padrão'}
                                    </Badge>
                                    {effective?.source === 'override' && (
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-900 bg-white/50 hover:bg-white rounded-full" onClick={handleResetOverride} title="Restaurar padrão">
                                            <RotateCcw className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900">{format(selectedDate, 'dd', { locale: ptBR })}</h3>
                                <p className={`text-sm font-medium uppercase tracking-wide ${effective?.type === 'blocked' ? 'text-red-600' : effective?.type === 'custom' ? 'text-blue-600' : 'text-slate-500'}`}>
                                    {format(selectedDate, 'MMMM, EEEE', { locale: ptBR })}
                                </p>
                            </div>

                            {/* Card Body with Actions/Content */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                {effective?.type === 'blocked' ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                                            <Ban className="h-8 w-8 text-red-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Dia de Folga</h4>
                                            <p className="text-sm text-slate-500 mt-1 max-w-[200px] mx-auto">Você marcou este dia como indisponível para atendimentos.</p>
                                        </div>
                                        <Button variant="outline" className="mt-4 border-slate-200 text-slate-600" onClick={handleResetOverride}>
                                            Desbloquear Dia
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {effective?.slots.length === 0 ? (
                                            <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                                                <Info className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                                                <p className="text-sm font-medium text-slate-600">Sem horários definidos</p>
                                                <p className="text-xs text-slate-400 mt-1">Adicione horários ou libere este dia.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {effective?.slots.map((slot, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                                        <div className="flex-1 flex items-center justify-between p-3 rounded-lg border bg-white shadow-sm border-slate-100">
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-slate-400" />
                                                                {effective.source === 'override' ? (
                                                                    // Editable Slots (Custom Mode)
                                                                    <div className="flex items-center gap-1">
                                                                        <Select value={slot.start} onValueChange={(v) => handleCustomSlotChange(idx, 'start', v)}>
                                                                            <SelectTrigger className="h-7 w-[75px] border-none px-0 text-sm font-semibold text-slate-900 bg-transparent focus:ring-0 shadow-none"><SelectValue /></SelectTrigger>
                                                                            <SelectContent>{HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                                                        </Select>
                                                                        <span className="text-slate-300">-</span>
                                                                        <Select value={slot.end} onValueChange={(v) => handleCustomSlotChange(idx, 'end', v)}>
                                                                            <SelectTrigger className="h-7 w-[75px] border-none px-0 text-sm font-semibold text-slate-900 bg-transparent focus:ring-0 shadow-none"><SelectValue /></SelectTrigger>
                                                                            <SelectContent>{HOURS.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                ) : (
                                                                    // Read-only Slots (Routine Mode)
                                                                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                                        <span>{slot.start}</span>
                                                                        <span className="text-slate-300">-</span>
                                                                        <span>{slot.end}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {effective.source === 'override' && (
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => handleRemoveCustomSlot(idx)}>
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {effective?.source === 'weekly' ? (
                                            <div className="pt-4 space-y-3">
                                                <Button className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all" onClick={() => handleOverride('custom')}>
                                                    Editar Horário Deste Dia
                                                </Button>
                                                <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleOverride('blocked')}>
                                                    <Ban className="h-4 w-4 mr-2" /> Bloquear Dia
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="pt-4">
                                                <Button variant="outline" className="w-full border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50" onClick={handleAddCustomSlot}>
                                                    <Plus className="h-4 w-4 mr-2" /> Adicionar Intervalo
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Appointments List for Selected Day */}
                                {effective?.type !== 'blocked' && (
                                    <div className="pt-6 border-t border-slate-100 mt-6 md:pb-6">
                                        <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Users className="h-4 w-4 text-slate-500" />
                                            Agendamentos do Dia
                                        </h4>

                                        {appointments.filter(a => a.scheduled_at.startsWith(format(selectedDate, 'yyyy-MM-dd'))).length === 0 ? (
                                            <p className="text-xs text-slate-400 italic">Nenhum agendamento para este dia.</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {appointments
                                                    .filter(a => a.scheduled_at.startsWith(format(selectedDate, 'yyyy-MM-dd')))
                                                    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
                                                    .map((appt) => (
                                                        <div key={appt.id} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                                                            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-emerald-600 font-bold text-xs border border-emerald-100">
                                                                {appt.patient_name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900">{appt.patient_name}</p>
                                                                <p className="text-xs text-emerald-700 flex items-center gap-1.5 mt-0.5">
                                                                    <Clock className="h-3 w-3" />
                                                                    {format(new Date(appt.scheduled_at), 'HH:mm')}
                                                                    <span className="opacity-50">•</span>
                                                                    {appt.duration} min
                                                                    <span className="opacity-50">•</span>
                                                                    {appt.status}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Card>
            </div>
        </div>
    )
}
