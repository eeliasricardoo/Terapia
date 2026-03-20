'use client'

import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'

interface Props {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  appointments: any[]
  overrides: any
  weeklySchedule: any
}

export function DashboardCalendar({
  selected,
  onSelect,
  appointments,
  overrides,
  weeklySchedule,
}: Props) {
  const getWeekDayKey = (date: Date) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[date.getDay()]
  }

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="pb-4 pt-5 px-5 border-b border-slate-50/50">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <CalendarIcon className="h-4 w-4" />
          Visão Mensal
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-6">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          showOutsideDays={false}
          className="p-0 w-full"
          classNames={{
            month: 'space-y-4 w-full',
            caption: 'flex justify-between pt-1 relative items-center mb-6 px-2',
            caption_label: 'text-sm font-bold text-slate-900 capitalize tracking-tight',
            nav: 'flex items-center gap-1',
            nav_button_previous: 'p-1 hover:bg-slate-50 rounded-md transition-colors',
            nav_button_next: 'p-1 hover:bg-slate-50 rounded-md transition-colors',
            table: 'w-full border-collapse',
            head_row: 'flex w-full justify-between mb-2',
            head_cell: 'text-slate-900 font-bold w-9 text-xs',
            row: 'flex w-full justify-between mt-1',
            cell: 'h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
            day: cn(
              'h-10 w-10 p-0 font-medium transition-all flex flex-col items-center justify-center rounded-lg border border-transparent hover:bg-slate-100 relative'
            ),
            day_selected:
              'bg-slate-900 text-white hover:bg-slate-900 hover:text-white shadow-md font-bold z-10 !border-slate-900',
            day_today: 'bg-slate-50 text-slate-900 font-bold border border-slate-200',
            day_outside: 'invisible pointer-events-none',
          }}
          components={{
            DayContent: ({ date }: { date: Date }) => {
              const dateStr = format(date, 'yyyy-MM-dd')
              const isSelected =
                selected && format(date, 'yyyy-MM-dd') === format(selected, 'yyyy-MM-dd')

              const override = overrides[dateStr]
              const isBlocked = override?.type === 'blocked'
              const isCustom = override?.type === 'custom'

              const weekDayKey = getWeekDayKey(date)
              const hasRoutine =
                weeklySchedule && weeklySchedule[weekDayKey]?.enabled && !isBlocked && !isCustom
              const hasAppt = appointments.some((a) => {
                const sDate = a.scheduledAt || a.scheduled_at
                return sDate && sDate.startsWith(dateStr)
              })

              return (
                <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
                  <span className={cn('text-[13px] relative z-20 text-inherit mb-1')}>
                    {date.getDate()}
                  </span>

                  <div className="flex gap-0.5 mt-0.5 z-10">
                    {isBlocked && (
                      <div
                        className={cn(
                          'h-1 w-1 rounded-full',
                          isSelected ? 'bg-white' : 'bg-red-400'
                        )}
                      />
                    )}
                    {isCustom && (
                      <div
                        className={cn(
                          'h-1 w-1 rounded-full',
                          isSelected ? 'bg-white' : 'bg-blue-900'
                        )}
                      />
                    )}
                    {hasRoutine && (
                      <div
                        className={cn(
                          'h-1 w-1 rounded-full',
                          isSelected ? 'bg-white' : 'bg-blue-600'
                        )}
                      />
                    )}
                    {!hasRoutine && !isBlocked && !isCustom && (
                      <div
                        className={cn(
                          'h-1 w-1 rounded-full',
                          isSelected ? 'bg-white/40' : 'bg-slate-300'
                        )}
                      />
                    )}
                    {hasAppt && (
                      <div
                        className={cn(
                          'h-1 w-1 rounded-full',
                          isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                        )}
                      />
                    )}
                  </div>
                </div>
              )
            },
          }}
        />

        <div className="mt-8 flex items-center justify-center gap-x-4 gap-y-2 flex-wrap text-[10px] text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-600" /> Padrão
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-blue-900" /> Personalizado
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-slate-300" /> Dia Livre
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-400" /> Folga
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" /> Agendamento
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
