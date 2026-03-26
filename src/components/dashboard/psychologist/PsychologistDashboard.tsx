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
  Clock,
  Settings,
  FileText,
  CheckCircle2,
  ArrowRight,
  Bell,
} from 'lucide-react'
import Link from 'next/link'
import { Profile } from '@/lib/supabase/types'

import { PsychologistDashboardData } from '@/lib/actions/dashboard'
import { RescheduleDialog } from '@/components/dashboard/RescheduleDialog'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { NotificationCenter } from '../NotificationCenter'

import { AlertCircle } from 'lucide-react'
import { DashboardCalendar } from './DashboardCalendar'

interface Props {
  userProfile: Profile
  dashboardData: PsychologistDashboardData
}

export function PsychologistDashboard({ userProfile, dashboardData }: Props) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [allAppointments, setAllAppointments] = useState<any[]>([
    ...dashboardData.upcomingSessions,
    ...dashboardData.futureSessions,
  ])
  const [unreadCount] = useState(dashboardData.unreadNotifications)
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

  const sessionsByDate = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const source = allAppointments.length > 0 ? allAppointments : upcomingSessions
    const relevant = source
      .filter((a) => a.scheduledAt.substring(0, 10) >= todayStr)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    const map = new Map<string, any[]>()
    relevant.forEach((session) => {
      const dateKey = session.scheduledAt.substring(0, 10)
      if (!map.has(dateKey)) map.set(dateKey, [])
      map.get(dateKey)!.push(session)
    })
    return Array.from(map.entries()).map(([date, sessions]) => ({
      date,
      sessions,
      isToday: date === todayStr,
    }))
  }, [allAppointments, upcomingSessions])

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 mt-2">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
                Olá, {userName}.
              </h1>
              <p className="text-slate-600 mt-1 sm:mt-2 font-medium text-sm sm:text-base">
                Você tem {stats.sessionsToday}{' '}
                {stats.sessionsToday === 1 ? 'atendimento agendado' : 'atendimentos agendados'} para
                hoje.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toast.success('Notificação de Teste ✅', {
                      description: 'Isso é apenas para validar se o sistema de avisos está ok.',
                    })
                  }
                  className="rounded-full text-[10px] font-bold uppercase tracking-wider"
                >
                  Testar Toast
                </Button>
              )}
              <Link
                href="/dashboard/ajustes"
                className="opacity-70 hover:opacity-100 transition-opacity"
              >
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <NotificationCenter />
              <Button
                asChild
                className="ml-1 gap-2 bg-slate-900 text-white hover:bg-slate-800 rounded-full px-4 sm:px-6 transition-all hover:translate-y-[-1px] shadow-lg shadow-slate-200"
              >
                <Link href={upcomingSessions?.[0]?.id ? `/sala/${upcomingSessions[0].id}` : '#'}>
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">Sala Virtual</span>
                </Link>
              </Button>
            </div>
          </div>

          {!dashboardData.hasStripeAccount && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 shadow-sm animate-in slide-in-from-top-4 duration-500 mb-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 flex-shrink-0">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h3 className="text-amber-900 font-bold font-serif italic text-base sm:text-lg tracking-tight">
                    Faturamento Pendente
                  </h3>
                  <p className="text-amber-700/80 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                    Seu perfil está <b>oculto na busca</b> até que você conecte sua conta bancária
                    via Stripe Connect. Isso é necessário para que você receba os repasses das
                    sessões automaticamente.
                  </p>
                </div>
              </div>
              <Button
                asChild
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl px-6 sm:px-8 shadow-lg shadow-amber-600/20 whitespace-nowrap h-10 sm:h-12 w-full sm:w-auto text-sm"
              >
                <Link href="/dashboard/financeiro">Conectar Conta Agora</Link>
              </Button>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Sessões
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{stats.sessionsToday}</span>
                <span className="text-[10px] text-slate-400 font-bold">HOJE</span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Pacientes Ativos
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">{stats.activePatients}</span>
                <span className="text-[10px] text-slate-400 font-bold">
                  / {stats.totalPatients}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Receita
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    maximumFractionDigits: 0,
                  }).format(stats.monthlyRevenue)}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Desempenho
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">
                  {stats.revenueChange >= 0 ? '+' : ''}
                  {stats.revenueChange}%
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${stats.revenueChange >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}
                >
                  MENSAL
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="col-span-1 lg:col-span-2 space-y-4">
              {/* Agenda */}
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="border-b border-slate-100 bg-white pb-5 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-slate-900">
                        Próximas Sessões
                      </CardTitle>
                      <CardDescription>
                        {(() => {
                          const todayCount =
                            sessionsByDate.find((g) => g.isToday)?.sessions.length ?? 0
                          const futureCount = sessionsByDate
                            .filter((g) => !g.isToday)
                            .reduce((acc, g) => acc + g.sessions.length, 0)
                          const parts = []
                          if (todayCount > 0) parts.push(`${todayCount} hoje`)
                          if (futureCount > 0) parts.push(`${futureCount} em breve`)
                          return parts.length > 0 ? parts.join(' · ') : 'Agenda livre'
                        })()}
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
                <CardContent className="p-0">
                  {sessionsByDate.length === 0 ? (
                    <div className="p-12 text-center bg-slate-50/50">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-4">
                        <CalendarIcon className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-900">Agenda livre</h3>
                      <p className="text-slate-500 text-xs mt-1">Nenhum atendimento agendado.</p>
                    </div>
                  ) : (
                    <div className="overflow-y-auto max-h-[600px]">
                      {sessionsByDate.map(({ date, sessions, isToday }) => (
                        <div key={date}>
                          {/* Date Header */}
                          <div className="px-6 py-2.5 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10 flex items-center gap-2">
                            <span
                              className={`text-[11px] font-bold uppercase tracking-widest capitalize ${isToday ? 'text-slate-800' : 'text-slate-400'}`}
                            >
                              {format(new Date(date + 'T12:00:00'), "eeee, d 'de' MMMM", {
                                locale: ptBR,
                              })}
                            </span>
                            {isToday && (
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                — hoje
                              </span>
                            )}
                          </div>
                          {/* Sessions */}
                          {sessions.map((session: any, idx: number) => {
                            const isNext = isToday && idx === 0 && session.status === 'scheduled'
                            const scheduledDate = new Date(session.scheduledAt)
                            const startTimeStr = formatInTimeZone(
                              scheduledDate,
                              dashboardData.timezone,
                              'HH:mm'
                            )
                            return (
                              <div
                                key={session.id}
                                className={`flex items-center gap-2 sm:gap-4 justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-50 last:border-0 transition-colors ${isNext ? 'bg-slate-50/60' : 'bg-white hover:bg-slate-50/40'}`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="flex flex-col items-center justify-center min-w-[3.5rem]">
                                    <span
                                      className={`text-base font-bold ${isNext ? 'text-slate-900' : 'text-slate-500'}`}
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
                                      <span className="text-[11px] text-slate-400">
                                        {session.type}
                                      </span>
                                      {session.status === 'completed' && (
                                        <Badge
                                          variant="secondary"
                                          className="bg-emerald-50 text-emerald-600 border-none text-[9px] h-4 font-black uppercase tracking-tighter"
                                        >
                                          Concluída
                                        </Badge>
                                      )}
                                      {isNext && (
                                        <Badge className="bg-primary/10 text-primary border-none text-[9px] h-4 font-bold uppercase tracking-wider">
                                          Próxima
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isNext ? (
                                    <>
                                      <Link href={`/sala/${session.id}`}>
                                        <Button
                                          size="sm"
                                          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-5 h-8 text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 shadow-sm shadow-slate-200"
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
                                    </>
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
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions / Recent Patients */}
            <div className="space-y-4">
              <DashboardCalendar
                selected={selectedDate}
                onSelect={setSelectedDate}
                appointments={allAppointments}
                overrides={overrides}
                weeklySchedule={weeklySchedule}
              />
              <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-50 pt-5 px-5">
                  <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Settings className="h-3.5 w-3.5" />
                    Acesso Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Link
                    href="/dashboard/agenda"
                    className="group block rounded-xl p-3 bg-slate-50/50 border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-white border border-slate-100 text-slate-600 flex items-center justify-center group-hover:text-slate-900 transition-colors shadow-sm">
                        <CalendarIcon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                          Gerenciar Horários
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">Configure sua agenda</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/pacientes"
                    className="group block rounded-xl p-3 bg-slate-50/50 border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-white border border-slate-100 text-slate-600 flex items-center justify-center group-hover:text-slate-900 transition-colors shadow-sm">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                          Meus Pacientes
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">Visualize prontuários</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden">
                <CardHeader className="pb-4 border-b border-slate-50 pt-5 px-5">
                  <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Histórico Recente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-50">
                    {recentPatients.map((patient) => (
                      <Link
                        key={patient.id}
                        href="/dashboard/pacientes"
                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 group-hover:bg-slate-200 transition-colors">
                            {patient.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors truncate">
                              {patient.name}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              {patient.lastSession}
                            </p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                      </Link>
                    ))}
                  </div>
                  {recentPatients.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-sm text-slate-400">Nenhum paciente recente</p>
                    </div>
                  )}
                  <div className="p-3 border-t border-slate-50 bg-slate-50/30">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm text-[11px] font-bold h-8 rounded-lg transition-all uppercase tracking-wider"
                      asChild
                    >
                      <Link href="/dashboard/pacientes">Ver todos</Link>
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
