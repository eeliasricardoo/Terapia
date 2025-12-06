"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Form } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const sessionDurations = [
  { value: "30", label: "30 min" },
  { value: "50", label: "50 min" },
  { value: "60", label: "60 min" },
]

const daysOfWeek = [
  { value: "lun", label: "LUN" },
  { value: "mar", label: "MAR" },
  { value: "mie", label: "MIE" },
  { value: "jue", label: "JUE" },
  { value: "vie", label: "VIE" },
  { value: "sab", label: "SAB" },
  { value: "dom", label: "DOM" },
]

const recurrenceOptions = [
  { value: "none", label: "No se repite" },
  { value: "daily", label: "Diariamente" },
  { value: "weekdays", label: "Días laborables (Lunes a Viernes)" },
  { value: "weekly", label: "Semanalmente" },
  { value: "monthly", label: "Mensualmente" },
  { value: "custom", label: "Personalizado..." },
]

interface RecurringSchedule {
  id: string
  day: string
  startTime: string
  endTime: string
}

interface SpecificDateSchedule {
  id: string
  date: Date
  startTime: string
  endTime: string
}

const formSchema = z.object({
  sessionDuration: z.string().min(1, "Selecione uma duração de sessão"),
  schedules: z.array(z.object({
    id: z.string(),
    day: z.string(),
    startTime: z.string(),
    endTime: z.string(),
  })).min(1, "Adicione pelo menos um horário"),
})

const generateTimeSlots = (sessionDuration: number, interval: number = 10) => {
  const slots: string[] = []
  const startHour = 8 // 8:00 AM
  const endHour = 18 // 6:00 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += sessionDuration + interval) {
      if (hour === endHour - 1 && minute + sessionDuration > 60) break
      
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      slots.push(timeString)
      
      // Se o próximo slot ultrapassaria a hora, para
      if (minute + sessionDuration + interval >= 60) break
    }
  }
  
  return slots
}

export function AvailabilityForm() {
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [isNotAvailable, setIsNotAvailable] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isSpecificDate, setIsSpecificDate] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)
  const [unavailableDays, setUnavailableDays] = useState<string[]>([])
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([])
  const [recurrence, setRecurrence] = useState("none")
  const [recurringSchedules, setRecurringSchedules] = useState<RecurringSchedule[]>([
    { id: "1", day: "mar", startTime: "9:00 AM", endTime: "12:00 PM" },
    { id: "2", day: "jue", startTime: "2:00 PM", endTime: "5:00 PM" },
  ])
  const [specificDateSchedules, setSpecificDateSchedules] = useState<SpecificDateSchedule[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      sessionDuration: "50",
      schedules: recurringSchedules,
    },
  })

  const selectedDuration = form.watch("sessionDuration")
  const sessionDurationMinutes = parseInt(selectedDuration) || 50
  const timeSlots = generateTimeSlots(sessionDurationMinutes)

  const handleDeleteSchedule = (id: string) => {
    const newSchedules = recurringSchedules.filter((schedule) => schedule.id !== id)
    setRecurringSchedules(newSchedules)
    form.setValue("schedules", newSchedules, { shouldValidate: true })
  }

  const handleDurationChange = (duration: string) => {
    form.setValue("sessionDuration", duration, { shouldValidate: true })
  }


  const handleTimeToggle = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time)
        ? prev.filter((t) => t !== time)
        : [...prev, time].sort()
    )
  }

  const handleNotAvailableToggle = () => {
    setIsNotAvailable(!isNotAvailable)
    if (!isNotAvailable) {
      setSelectedTimes([]) // Limpa horários selecionados se marcar como não disponível
    }
  }

  const handleSaveSchedule = () => {
    // Se for data específica
    if (isSpecificDate && selectedDate) {
      if (isNotAvailable) {
        setUnavailableDates((prev) => {
          if (!prev.some((d) => d.toDateString() === selectedDate.toDateString())) {
            return [...prev, selectedDate]
          }
          return prev
        })
        setSpecificDateSchedules((prev) =>
          prev.filter((s) => s.date.toDateString() !== selectedDate.toDateString())
        )
      } else if (selectedTimes.length > 0) {
        const formatTime = (time: string) => {
          const [hours, minutes] = time.split(":")
          const hour = parseInt(hours)
          if (hour === 0) return `12:${minutes} AM`
          if (hour < 12) return `${hour}:${minutes} AM`
          if (hour === 12) return `12:${minutes} PM`
          return `${hour - 12}:${minutes} PM`
        }

        const sortedTimes = selectedTimes.sort()
        const startTimeFormatted = sortedTimes[0]
        const endTimeFormatted = sortedTimes[sortedTimes.length - 1]

        const updatedSchedules = specificDateSchedules.filter(
          (s) => s.date.toDateString() !== selectedDate.toDateString()
        )

        updatedSchedules.push({
          id: `date-${Date.now()}-${Math.random()}`,
          date: selectedDate,
          startTime: formatTime(startTimeFormatted),
          endTime: formatTime(endTimeFormatted),
        })

        setSpecificDateSchedules(updatedSchedules)
        setUnavailableDates((prev) =>
          prev.filter((d) => d.toDateString() !== selectedDate.toDateString())
        )
      }
      setOpenDialog(false)
      setSelectedDate(null)
      setSelectedTimes([])
      setIsNotAvailable(false)
      setRecurrence("none")
      setIsSpecificDate(false)
      setEditingScheduleId(null)
      return
    }

    // Se for dia da semana recorrente
    if (!selectedDay) return

    if (isNotAvailable) {
      let daysToApply: string[] = [selectedDay]
      
      if (recurrence === "weekdays") {
        daysToApply = ["lun", "mar", "mie", "jue", "vie"]
      } else if (recurrence === "daily") {
        daysToApply = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"]
      } else if (recurrence === "weekly") {
        daysToApply = [selectedDay]
      }

      setUnavailableDays((prev) => {
        const newDays = [...prev]
        daysToApply.forEach((day) => {
          if (!newDays.includes(day)) {
            newDays.push(day)
          }
        })
        return newDays
      })

      const updatedSchedules = recurringSchedules.filter(
        (s) => !daysToApply.includes(s.day)
      )
      setRecurringSchedules(updatedSchedules)
      form.setValue("schedules", updatedSchedules, { shouldValidate: true })
    } else if (selectedTimes.length > 0) {
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":")
        const hour = parseInt(hours)
        if (hour === 0) return `12:${minutes} AM`
        if (hour < 12) return `${hour}:${minutes} AM`
        if (hour === 12) return `12:${minutes} PM`
        return `${hour - 12}:${minutes} PM`
      }

      let daysToApply: string[] = [selectedDay]
      
      if (recurrence === "weekdays") {
        daysToApply = ["lun", "mar", "mie", "jue", "vie"]
      } else if (recurrence === "daily") {
        daysToApply = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"]
      } else if (recurrence === "weekly") {
        daysToApply = [selectedDay]
      }

      const sortedTimes = selectedTimes.sort()
      const startTimeFormatted = sortedTimes[0]
      const endTimeFormatted = sortedTimes[sortedTimes.length - 1]

      // Se estiver editando, remover o horário antigo primeiro
      let updatedSchedules = recurringSchedules
      if (editingScheduleId) {
        updatedSchedules = recurringSchedules.filter((s) => s.id !== editingScheduleId)
      } else {
        updatedSchedules = recurringSchedules.filter(
          (s) => !daysToApply.includes(s.day)
        )
      }

      daysToApply.forEach((day) => {
        // Se estiver editando e for o mesmo dia, manter o ID
        if (editingScheduleId && day === selectedDay) {
          const existingSchedule = recurringSchedules.find((s) => s.id === editingScheduleId)
          if (existingSchedule) {
            updatedSchedules.push({
              ...existingSchedule,
              startTime: formatTime(startTimeFormatted),
              endTime: formatTime(endTimeFormatted),
            })
            return
          }
        }
        
        // Para novos schedules ou dias diferentes, criar novo ID
        const newSchedule: RecurringSchedule = {
          id: `${day}-${Date.now()}-${Math.random()}`,
          day: day,
          startTime: formatTime(startTimeFormatted),
          endTime: formatTime(endTimeFormatted),
        }
        updatedSchedules.push(newSchedule)
      })

      setRecurringSchedules(updatedSchedules)
      form.setValue("schedules", updatedSchedules, { shouldValidate: true })

      setUnavailableDays((prev) => prev.filter((d) => !daysToApply.includes(d)))
    }

    setOpenDialog(false)
    setSelectedDay(null)
    setSelectedTimes([])
    setIsNotAvailable(false)
    setRecurrence("none")
    setEditingScheduleId(null)
  }

  const handleDayClick = (day: string) => {
    setSelectedDay(day)
    setSelectedDate(null)
    setIsSpecificDate(false)
    // Carregar horários já configurados para este dia, se houver
    const existingSchedule = recurringSchedules.find((s) => s.day === day)
    const isUnavailable = unavailableDays.includes(day)
    
    if (existingSchedule) {
      // Converter horários AM/PM para formato 24h para pré-selecionar
      const parseTime = (timeStr: string) => {
        const [time, period] = timeStr.split(" ")
        const [hours, minutes] = time.split(":")
        let hour = parseInt(hours)
        if (period === "PM" && hour !== 12) hour += 12
        if (period === "AM" && hour === 12) hour = 0
        return `${hour.toString().padStart(2, "0")}:${minutes}`
      }
      
      const start = parseTime(existingSchedule.startTime)
      const end = parseTime(existingSchedule.endTime)
      
      // Gerar slots entre start e end
      const slots: string[] = []
      const [startHour, startMin] = start.split(":").map(Number)
      const [endHour, endMin] = end.split(":").map(Number)
      
      for (let h = startHour; h < endHour || (h === endHour && startMin < endMin); h++) {
        for (let m = 0; m < 60; m += sessionDurationMinutes + 10) {
          if (h === startHour && m < startMin) continue
          if (h === endHour && m >= endMin) break
          slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`)
        }
      }
      
      setSelectedTimes(slots)
    } else {
      setSelectedTimes([])
    }
    
    setIsNotAvailable(isUnavailable)
    setRecurrence("none")
    setOpenDialog(true)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setSelectedDay(null)
    setIsSpecificDate(true)
    // Carregar horários já configurados para esta data, se houver
    const existingSchedule = specificDateSchedules.find(
      (s) => s.date.toDateString() === date.toDateString()
    )
    const isUnavailable = unavailableDates.some(
      (d) => d.toDateString() === date.toDateString()
    )
    
    if (existingSchedule) {
      const parseTime = (timeStr: string) => {
        const [time, period] = timeStr.split(" ")
        const [hours, minutes] = time.split(":")
        let hour = parseInt(hours)
        if (period === "PM" && hour !== 12) hour += 12
        if (period === "AM" && hour === 12) hour = 0
        return `${hour.toString().padStart(2, "0")}:${minutes}`
      }
      
      const start = parseTime(existingSchedule.startTime)
      const end = parseTime(existingSchedule.endTime)
      
      const slots: string[] = []
      const [startHour, startMin] = start.split(":").map(Number)
      const [endHour, endMin] = end.split(":").map(Number)
      
      for (let h = startHour; h < endHour || (h === endHour && startMin < endMin); h++) {
        for (let m = 0; m < 60; m += sessionDurationMinutes + 10) {
          if (h === startHour && m < startMin) continue
          if (h === endHour && m >= endMin) break
          slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`)
        }
      }
      
      setSelectedTimes(slots)
    } else {
      setSelectedTimes([])
    }
    
    setIsNotAvailable(isUnavailable)
    setRecurrence("none")
    setOpenDialog(true)
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: Integrate with Supabase
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Configurar sua Disponibilidade
            </h1>
            <p className="text-muted-foreground mt-2">
              Selecione os dias e horários em que você estará disponível para atender seus pacientes. Todos os horários são salvos em GMT-3 (Brasília).
            </p>
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Não se preocupe!</strong> Você poderá alterar sua disponibilidade a qualquer momento pelo painel de controle após o cadastro.
              </p>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Session Duration and Weekly Schedules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Duration Card */}
          <Card>
            <CardHeader>
              <CardTitle>1. Defina a duração da sessão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {sessionDurations.map((duration) => (
                  <Button
                    key={duration.value}
                    type="button"
                    variant={selectedDuration === duration.value ? "default" : "outline"}
                    className={cn(
                      "h-[44px] rounded-full px-6",
                      selectedDuration === duration.value && "font-bold"
                    )}
                    onClick={() => handleDurationChange(duration.value)}
                  >
                    {duration.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Schedules Card - Simple Grid */}
          <Card>
            <CardHeader>
              <CardTitle>2. Selecione seus horários semanais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-3">
                {daysOfWeek.map((day) => {
                  const schedule = recurringSchedules.find((s) => s.day === day.value)
                  const isUnavailable = unavailableDays.includes(day.value)
                  
                  return (
                    <div key={day.value} className="space-y-2">
                      <div className="text-center text-sm font-medium">{day.label}</div>
                      <div
                        className={cn(
                          "h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors",
                          schedule
                            ? "bg-primary/10 border-primary"
                            : isUnavailable
                            ? "bg-destructive/10 border-destructive"
                            : "bg-muted/30 border-muted hover:border-primary/50"
                        )}
                        onClick={() => handleDayClick(day.value)}
                      >
                        {schedule ? (
                          <div className="text-center px-2">
                            <div className="text-xs font-medium">
                              {schedule.startTime.replace(" AM", "").replace(" PM", "")} - {schedule.endTime.replace(" AM", "").replace(" PM", "")}
                            </div>
                          </div>
                        ) : isUnavailable ? (
                          <div className="text-xs font-medium text-destructive">
                            Indisponível
                          </div>
                        ) : (
                          <Plus className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Calendar for Specific Dates */}
          <Card>
            <CardHeader>
              <CardTitle>3. Dias específicos do mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center bg-muted/30 p-8 rounded-lg">
                <div className="w-full max-w-md">
                  <Calendar
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={(date: Date | undefined) => {
                      if (date) handleDateClick(date)
                    }}
                    locale={es}
                    className="rounded-md w-full"
                    modifiers={{
                      scheduled: specificDateSchedules.map((s) => s.date),
                      unavailable: unavailableDates,
                    }}
                    modifiersClassNames={{
                      scheduled: "bg-primary text-primary-foreground font-medium rounded-full",
                      unavailable: "bg-destructive text-destructive-foreground font-medium rounded-full",
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Recurring Schedules */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Horários Recorrentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recurringSchedules.map((schedule) => {
                const dayLabel = daysOfWeek.find((d) => d.value === schedule.day)?.label || schedule.day
                const dayName = {
                  lun: "Segunda",
                  mar: "Terça",
                  mie: "Quarta",
                  jue: "Quinta",
                  vie: "Sexta",
                  sab: "Sábado",
                  dom: "Domingo",
                }[schedule.day] || schedule.day

                return (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div>
                      <div className="font-medium text-sm">
                        Toda {dayName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setEditingScheduleId(schedule.id)
                          // Carregar dados do horário para edição
                          const parseTime = (timeStr: string) => {
                            const [time, period] = timeStr.split(" ")
                            const [hours, minutes] = time.split(":")
                            let hour = parseInt(hours)
                            if (period === "PM" && hour !== 12) hour += 12
                            if (period === "AM" && hour === 12) hour = 0
                            return `${hour.toString().padStart(2, "0")}:${minutes}`
                          }
                          
                          const start = parseTime(schedule.startTime)
                          const end = parseTime(schedule.endTime)
                          
                          // Gerar slots entre start e end
                          const slots: string[] = []
                          const [startHour, startMin] = start.split(":").map(Number)
                          const [endHour, endMin] = end.split(":").map(Number)
                          
                          for (let h = startHour; h < endHour || (h === endHour && startMin < endMin); h++) {
                            for (let m = 0; m < 60; m += sessionDurationMinutes + 10) {
                              if (h === startHour && m < startMin) continue
                              if (h === endHour && m >= endMin) break
                              slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`)
                            }
                          }
                          
                          setSelectedDay(schedule.day)
                          setSelectedDate(null)
                          setIsSpecificDate(false)
                          setSelectedTimes(slots)
                          setIsNotAvailable(false)
                          setRecurrence("none")
                          setOpenDialog(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteSchedule(schedule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="font-bold h-[44px]"
            disabled={!form.formState.isValid}
          >
            Salvar Alterações
          </Button>
        </div>
      </form>

      {/* Dialog for selecting schedule */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl professional-theme">
          <DialogHeader>
            <DialogTitle>
              {isSpecificDate && selectedDate
                ? `Configurar Horários - ${format(selectedDate, "d 'de' MMMM", { locale: es })}`
                : selectedDay
                ? `Configurar Horários - ${daysOfWeek.find((d) => d.value === selectedDay)?.label}`
                : "Configurar Horários"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Indisponível option */}
            <div>
              <Button
                type="button"
                variant={isNotAvailable ? "default" : "outline"}
                className={cn(
                  "w-full h-[44px]",
                  isNotAvailable
                    ? "bg-primary text-primary-foreground font-medium"
                    : "border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary"
                )}
                onClick={handleNotAvailableToggle}
              >
                Indisponível
              </Button>
            </div>

            {/* Time Slots Grid */}
            {!isNotAvailable && (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione os horários disponíveis:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={selectedTimes.includes(time) ? "default" : "outline"}
                      className={cn(
                        "h-[44px]",
                        selectedTimes.includes(time)
                          ? "bg-primary text-primary-foreground font-medium rounded-full"
                          : "border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary rounded-full"
                      )}
                      style={selectedTimes.includes(time) ? {
                        backgroundColor: 'hsl(340 72% 61%)',
                        color: 'white'
                      } : {}}
                      onClick={() => handleTimeToggle(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              className="h-[44px] border-primary/30 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary"
              onClick={() => {
                setOpenDialog(false)
                setSelectedDay(null)
                setSelectedDate(null)
                setSelectedTimes([])
                setIsNotAvailable(false)
                setRecurrence("none")
                setIsSpecificDate(false)
                setEditingScheduleId(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveSchedule}
              disabled={!isNotAvailable && selectedTimes.length === 0}
              className="font-bold h-[44px] bg-primary text-primary-foreground hover:bg-primary/90"
              style={{
                backgroundColor: 'hsl(340 72% 61%)',
                color: 'white'
              }}
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </Form>
  )
}

