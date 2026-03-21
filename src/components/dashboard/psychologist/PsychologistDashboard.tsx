'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Video,
  Calendar as CalendarIcon,
  Users,
  Clock,
  CreditCard,
  MoreHorizontal,
  Star,
  Settings,
  FileText,
  CheckCircle2,
  ArrowRight,
  Bell,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { Profile } from '@/lib/supabase/types'

import { PsychologistDashboardData } from '@/lib/actions/dashboard'
import { RescheduleDialog } from '@/components/dashboard/RescheduleDialog'
import { format, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { DashboardCalendar } from './DashboardCalendar'

interface Props {
  userProfile: Profile
  dashboardData: PsychologistDashboardData
}

export function PsychologistDashboard({ userProfile, dashboardData }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [allAppointments, setAllAppointments] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(dashboardData.unreadNotifications)
  const [overrides, setOverrides] = useState<any>({})
  const [weeklySchedule, setWeeklySchedule] = useState<any>({
    monday: { enabled: true, slots: [] },
    tuesday: { enabled: true, slots: [] },
    wednesday: { enabled: true, slots: [] },
    thursday: { enabled: true, slots: [] },
    friday: { enabled: true, slots: [] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  })
  const [isLoadingAgenda, setIsLoadingAgenda] = useState(false)

  const userName = userProfile?.full_name || 'Doutor(a)'

  const { stats, upcomingSessions, recentPatients } = dashboardData

  // Fetch all appointments for the calendar and selection
  useEffect(() => {
    const fetchAllData = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('psychologist_profiles')
        .select('id, working_hours')
        .eq('userId', user.id)
        .single()

      if (profile) {
        // Fetch all appointments (e.g. 1 month before/after)
        const { data: appts } = await supabase
          .from('appointments')
          .select(
            `
            id,
            scheduled_at,
            duration_minutes,
            status,
            session_type,
            patient:patient_id (
              id,
              full_name,
              avatar_url
            )
          `
          )
          .eq('psychologist_id', profile.id)

        if (appts) {
          const mappedAppts = appts.map((a: any) => ({
            id: a.id,
            patientName: a.patient?.full_name || 'Paciente',
            time: format(new Date(a.scheduled_at), 'HH:mm'),
            scheduledAt: a.scheduled_at,
            psychologistId: profile.id,
            type: a.session_type || 'Sessão',
            status: a.status.toLowerCase(),
            image: a.patient?.avatar_url || undefined,
            duration: a.duration_minutes,
          }))
          setAllAppointments(mappedAppts)
        }

        // Fetch overrides
        const { data: ovr } = await supabase
          .from('schedule_overrides')
          .select('*')
          .eq('psychologist_id', profile.id)

        if (ovr) {
          const ovrMap: any = {}
          ovr.forEach((o: any) => {
            ovrMap[o.date] = o
          })
          setOverrides(ovrMap)
        }

        // Set working hours (routine)
        if (profile.working_hours) {
          setWeeklySchedule(profile.working_hours)
        }
      }
    }
    fetchAllData()
  }, [])

  // 🔔 [REALTIME] - Listen for new notifications
  useEffect(() => {
    const supabase = createClient()

    const setupSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const channel = supabase
        .channel(`notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as any
            setUnreadCount((prev) => prev + 1)

            // EYE-CATCHING Notification (Toast)
            toast.success(newNotif.title, {
              description: newNotif.message,
              duration: 8000, // Longer for important stuff
              action: {
                label: 'Ver Agenda',
                onClick: () => (window.location.href = '/dashboard/agenda'),
              },
            })
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    setupSubscription()
  }, [])

  const displaySessions = useMemo(() => {
    if (!selectedDate) return []
    const dateStr = format(selectedDate, 'yyyy-MM-dd')

    // If it's today and we don't have all data yet, use server-side sessions
    if (isSameDay(selectedDate, new Date()) && allAppointments.length === 0) {
      return upcomingSessions
    }

    return allAppointments.filter((a) => a.scheduledAt.startsWith(dateStr))
  }, [selectedDate, allAppointments, upcomingSessions])

  const agendaTitle = useMemo(() => {
    if (!selectedDate) return 'Agenda de Hoje'
    if (isSameDay(selectedDate, new Date())) return 'Agenda de Hoje'
    return `Agenda de ${format(selectedDate, "eeee, d 'de' MMMM", { locale: ptBR })}`
  }, [selectedDate])

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      {!dashboardData.isVerified ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="h-20 w-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-200">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
            Perfil em Análise
          </h2>
          <p className="text-slate-500 max-w-lg mb-8 leading-relaxed">
            Seus dados e documentos (CRP) foram recebidos com sucesso e estão sendo validados por
            nossa equipe de especialistas. Você receberá um e-mail assim que seu acesso for aprovado
            e você puder começar a atender pacientes pela plataforma.
          </p>
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm shadow-slate-100 max-w-md w-full text-left">
            <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Próximos Passos
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm text-slate-600">
                <span className="text-emerald-500 font-bold">1.</span>
                Validação do registro profissional (CRP).
              </li>
              <li className="flex gap-3 text-sm text-slate-600">
                <span className="text-emerald-500 font-bold">2.</span>
                Aprovação do seu perfil público e especialidades.
              </li>
              <li className="flex gap-3 text-sm text-slate-600">
                <span className="text-slate-300 font-bold">3.</span>
                Liberação da sua agenda para marcações de pacientes.
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 mt-2">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
                Olá, {userName}.
              </h1>
              <p className="text-slate-600 mt-2 font-medium">
                Você tem {stats.sessionsToday}{' '}
                {stats.sessionsToday === 1 ? 'atendimento agendado' : 'atendimentos agendados'} para
                hoje.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/ajustes"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full relative opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Notificações"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span
                    className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-slate-50"
                    aria-hidden="true"
                  />
                )}
                <span className="sr-only">Você tem novas notificações</span>
              </Button>
              <Button
                asChild
                className="ml-2 gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-full px-6 transition-all hover:translate-y-[-1px] shadow-lg shadow-slate-200"
              >
                <Link href={upcomingSessions?.[0]?.id ? `/sala/${upcomingSessions[0].id}` : '#'}>
                  <Video className="h-4 w-4" />
                  <span>Sala Virtual</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Sessões
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{stats.sessionsToday}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold">
                  HOJE
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Pacientes Ativos
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{stats.activePatients}</span>
                <span className="text-[10px] text-slate-500 font-bold">
                  TOTAL {stats.totalPatients}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Receita
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0,
                  }).format(stats.monthlyRevenue)}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Desempenho
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {stats.revenueChange >= 0 ? '+' : ''}
                  {stats.revenueChange}%
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${stats.revenueChange >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}
                >
                  MENSAL
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Schedule */}
            <Card className="col-span-1 lg:col-span-2 border-none shadow-sm bg-white flex flex-col">
              <CardHeader className="border-b border-slate-100 bg-white pb-5 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 capitalize">
                      {agendaTitle}
                    </CardTitle>
                    <CardDescription>
                      {selectedDate
                        ? format(selectedDate, "eeee, d 'de' MMMM", { locale: ptBR })
                        : 'Selecione uma data'}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-primary hover:bg-transparent font-semibold text-xs transition-colors"
                    asChild
                  >
                    <Link href="/dashboard/agenda">VER AGENDA &rarr;</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden">
                <div className="flex flex-col overflow-y-auto max-h-[420px]">
                  {displaySessions.map((session, index) => {
                    const isNext = index === 0 && session.status === 'scheduled'
                    const scheduledDate = new Date(session.scheduledAt)
                    const startTimeStr = formatInTimeZone(
                      scheduledDate,
                      dashboardData.timezone,
                      'HH:mm'
                    )
                    return (
                      <div
                        key={session.id}
                        className={`flex items-stretch ${isNext ? 'bg-slate-50/50' : 'bg-white'} border-b border-slate-50 last:border-0 transition-colors`}
                      >
                        {/* Time & Session Info */}
                        <div className="flex-1 flex items-center justify-between px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center min-w-[3.5rem]">
                              <span
                                className={`text-lg font-bold ${isNext ? 'text-slate-900' : 'text-slate-500'}`}
                              >
                                {startTimeStr}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400">
                                {session.duration}m
                              </span>
                            </div>

                            <Avatar
                              className={`h-10 w-10 transition-all ${isNext ? 'ring-2 ring-primary/20 ring-offset-2' : ''}`}
                            >
                              <AvatarImage src={session.image} />
                              <AvatarFallback className="bg-slate-50 text-slate-400 text-xs font-semibold">
                                {session.patientName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <h4
                                className={`font-semibold text-sm ${isNext ? 'text-slate-900' : 'text-slate-700'}`}
                              >
                                {session.patientName}
                              </h4>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400">{session.type}</span>
                                {session.status === 'completed' && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-emerald-50 text-emerald-600 border-none text-[9px] h-4 font-black uppercase tracking-tighter"
                                  >
                                    Concluída
                                  </Badge>
                                )}
                                {session.status === 'scheduled' && isNext && (
                                  <Badge className="bg-primary/10 text-primary border-none text-[9px] h-4 font-bold uppercase tracking-wider">
                                    Próxima
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {isNext ? (
                              <div className="flex items-center gap-2 w-full md:w-auto">
                                <Link href={`/sala/${session.id}`} className="flex-1">
                                  <Button
                                    size="sm"
                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-5 h-8 text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-sm shadow-slate-200 w-full"
                                  >
                                    <Video className="w-3.5 h-3.5 mr-2" />
                                    Iniciar
                                  </Button>
                                </Link>
                                <RescheduleDialog
                                  session={{
                                    id: session.id,
                                    doctor: session.patientName,
                                    role: 'Paciente',
                                    image: session.image || '/avatars/01.png',
                                    date: format(
                                      new Date(session.scheduledAt),
                                      "dd 'de' MMMM, yyyy",
                                      { locale: ptBR }
                                    ),
                                    time: session.time,
                                    psychologistId: session.psychologistId,
                                  }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-slate-300 hover:text-primary transition-colors font-medium text-[11px] h-8 px-2"
                                  >
                                    Reagendar
                                  </Button>
                                </RescheduleDialog>
                              </div>
                            ) : (
                              <RescheduleDialog
                                session={{
                                  id: session.id,
                                  doctor: session.patientName,
                                  role: 'Paciente',
                                  image: session.image || '/avatars/01.png',
                                  date: format(
                                    new Date(session.scheduledAt),
                                    "dd 'de' MMMM, yyyy",
                                    { locale: ptBR }
                                  ),
                                  time: session.time,
                                  psychologistId: session.psychologistId,
                                }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-300 hover:text-primary transition-colors font-medium text-[11px] h-8 px-2"
                                >
                                  Reagendar
                                </Button>
                              </RescheduleDialog>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {displaySessions.length === 0 && (
                  <div className="p-12 text-center bg-slate-50/50">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                      <CalendarIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-medium text-slate-900">Agenda livre</h3>
                    <p className="text-slate-500 text-xs mt-1">Nenhum atendimento para hoje.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions / Recent Patients */}
            <div className="space-y-4">
              <DashboardCalendar
                selected={selectedDate}
                onSelect={setSelectedDate}
                appointments={allAppointments}
                overrides={overrides}
                weeklySchedule={weeklySchedule}
              />
              <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50/30 overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-100 pt-5 px-5 bg-white/50 backdrop-blur-sm">
                  <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                      <Settings className="h-3 w-3 text-white" />
                    </div>
                    Acesso Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Link
                    href="/dashboard/agenda"
                    className="group block rounded-xl p-4 bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          Gerenciar Horários
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Configure sua agenda</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/pacientes"
                    className="group block rounded-xl p-4 bg-white border border-slate-100 hover:border-pink-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-pink-600 transition-colors">
                          Meus Pacientes
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">Visualize prontuários</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-gradient-to-br from-white to-slate-50/30 overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-100 pt-5 px-5 bg-white/50 backdrop-blur-sm">
                  <CardTitle className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                      <Clock className="h-3 w-3 text-white" />
                    </div>
                    Histórico Recente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {recentPatients.map((patient) => (
                      <Link
                        key={patient.id}
                        href="/dashboard/pacientes"
                        className="flex items-center justify-between p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="relative">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-sm font-bold text-blue-700 border-2 border-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                              {patient.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 border-2 border-white flex items-center justify-center">
                              <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                              {patient.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {patient.lastSession}
                            </p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                  {recentPatients.length === 0 && (
                    <div className="p-8 text-center">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <Users className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500">Nenhum paciente recente</p>
                    </div>
                  )}
                  <div className="p-3 border-t border-slate-100 bg-white/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-slate-600 hover:text-blue-600 hover:bg-blue-50 text-xs font-semibold h-9 rounded-lg transition-all"
                      asChild
                    >
                      <Link href="/dashboard/pacientes">
                        Ver todos os pacientes
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
