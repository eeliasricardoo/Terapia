"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

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

interface RecurringSchedule {
  id: string
  day: string
  startTime: string
  endTime: string
}

export function AvailabilityForm() {
  const [selectedDuration, setSelectedDuration] = useState("50")
  const [recurringSchedules, setRecurringSchedules] = useState<RecurringSchedule[]>([
    { id: "1", day: "mar", startTime: "9:00 AM", endTime: "12:00 PM" },
    { id: "2", day: "jue", startTime: "2:00 PM", endTime: "5:00 PM" },
  ])

  const handleDeleteSchedule = (id: string) => {
    setRecurringSchedules(recurringSchedules.filter((schedule) => schedule.id !== id))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Configurar tu Disponibilidad
          </h1>
          <p className="text-muted-foreground mt-2">
            Selecciona los días y horas en los que estarás disponible para atender a tus pacientes. Todos los horarios se guardan en GMT-5 (Bogotá).
          </p>
        </div>
        <Button className="h-[44px] font-bold">
          <Plus className="mr-2 h-4 w-4" />
          Añadir Horario
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Session Duration and Weekly Schedules */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Duration Card */}
          <Card>
            <CardHeader>
              <CardTitle>1. Define la duración de la sesión</CardTitle>
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
                    onClick={() => setSelectedDuration(duration.value)}
                  >
                    {duration.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Schedules Card */}
          <Card>
            <CardHeader>
              <CardTitle>2. Selecciona tus horarios semanales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-3">
                {daysOfWeek.map((day) => {
                  const schedule = recurringSchedules.find((s) => s.day === day.value)
                  const isWeekend = day.value === "sab" || day.value === "dom"
                  
                  return (
                    <div key={day.value} className="space-y-2">
                      <div className="text-center text-sm font-medium">{day.label}</div>
                      <div
                        className={cn(
                          "h-24 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors",
                          schedule
                            ? "bg-primary/10 border-primary"
                            : isWeekend
                            ? "bg-muted/30 border-muted"
                            : "bg-muted/30 border-muted hover:border-primary/50"
                        )}
                      >
                        {schedule ? (
                          <div className="text-center px-2">
                            <div className="text-sm font-medium">
                              {schedule.startTime.replace(" AM", "").replace(" PM", "")} - {schedule.endTime.replace(" AM", "").replace(" PM", "")}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              3 ranuras
                            </div>
                          </div>
                        ) : isWeekend ? (
                          <div className="text-xs text-muted-foreground">
                            No disponible
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
        </div>

        {/* Right Column - Recurring Schedules */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Horarios Recurrentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recurringSchedules.map((schedule) => {
                const dayLabel = daysOfWeek.find((d) => d.value === schedule.day)?.label || schedule.day
                const dayName = {
                  lun: "Lunes",
                  mar: "Martes",
                  mie: "Miércoles",
                  jue: "Jueves",
                  vie: "Viernes",
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
                        Todos los {dayName}
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
        <Button type="submit" className="font-bold h-[44px]">
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}

