import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Video, FileText, CalendarX } from 'lucide-react'
import { ReceiptDialog } from '@/components/dashboard/ReceiptDialog'
import { RescheduleDialog } from '@/components/dashboard/RescheduleDialog'
import { getCurrentUserProfile } from '@/lib/actions/profile'
import { getUserSessions } from '@/lib/actions/sessions'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function SessionsPage() {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">Você precisa estar logado para ver suas sessões.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Fazer Login</Link>
        </Button>
      </div>
    )
  }

  const sessions = await getUserSessions(profile.user_id)

  // Fetch psychologist profiles for dynamic data in RescheduleDialog
  const psychologistIds = [...new Set(sessions.map((s) => s.psychologist_id))]
  const psychProfiles =
    psychologistIds.length > 0
      ? await prisma.psychologistProfile.findMany({
          where: { userId: { in: psychologistIds } },
          select: {
            userId: true,
            crp: true,
            specialties: true,
            pricePerSession: true,
            timezone: true,
          },
        })
      : []
  const psychMap = new Map(psychProfiles.map((p) => [p.userId, p]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Minhas Sessões</h1>
        <p className="text-muted-foreground">
          Gerencie seus agendamentos e histórico de consultas.
        </p>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <CalendarX className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium">Nenhuma sessão encontrada.</p>
              <p className="text-sm">
                Seus agendamentos aparecerão aqui assim que forem realizados.
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/busca">Buscar Psicólogos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          sessions.map((session) => {
            const isPsychologist = profile.role === 'PSYCHOLOGIST'
            const otherParty = isPsychologist ? session.patient : session.psychologist
            const timezone = psychMap.get(session.psychologist_id)?.timezone || 'America/Sao_Paulo'
            const scheduledDate = toZonedTime(new Date(session.scheduled_at), timezone)
            const now = new Date()

            // A session is "upcoming" if it's in the future and scheduled
            const statusUpper = session.status.toUpperCase()
            const isUpcoming = scheduledDate > now && statusUpper === 'SCHEDULED'

            // We allow rescheduling if it's upcoming OR if it's a past scheduled session (missed)
            // especially useful for psychologists to manage their agenda
            const canReschedule =
              statusUpper === 'SCHEDULED' && (isUpcoming || isPsychologist || scheduledDate < now)

            return (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {/* Date Box */}
                    <div className="flex-shrink-0 w-full md:w-auto flex md:flex-col items-center justify-center bg-slate-50 rounded-lg border p-4 min-w-[100px] gap-2 md:gap-0">
                      <Calendar className="h-5 w-5 text-muted-foreground mb-1 md:block hidden" />
                      <span className="text-2xl font-bold text-primary">
                        {format(scheduledDate, 'dd')}
                      </span>
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        {format(scheduledDate, 'MMM', { locale: ptBR })}
                      </span>
                    </div>

                    {/* Session Info */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">
                          {otherParty?.full_name || 'Usuário'}
                        </h3>
                        {isUpcoming && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                            Agendada
                          </Badge>
                        )}
                        {statusUpper === 'COMPLETED' && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                          >
                            Realizada
                          </Badge>
                        )}
                        {statusUpper === 'CANCELLED' && (
                          <Badge
                            variant="destructive"
                            className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                          >
                            Cancelada
                          </Badge>
                        )}
                        {statusUpper === 'CANCELED' && (
                          <Badge
                            variant="destructive"
                            className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                          >
                            Cancelada
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isPsychologist
                          ? 'Paciente'
                          : otherParty?.role === 'PSYCHOLOGIST'
                            ? 'Psicólogo(a) Clínica'
                            : 'Especialista'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" /> {format(scheduledDate, 'HH:mm')} -{' '}
                          {format(
                            new Date(
                              scheduledDate.getTime() + (session.duration_minutes || 50) * 60000
                            ),
                            'HH:mm'
                          )}
                          <span className="ml-2 text-[10px] bg-slate-100 px-1 py-0.5 rounded font-bold uppercase">
                            {timezone.split('/').pop()}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="h-4 w-4" /> Online
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      {canReschedule ? (
                        <>
                          <RescheduleDialog
                            session={{
                              id: session.id,
                              doctor: otherParty?.full_name || 'Especialista',
                              role: isPsychologist ? 'Paciente' : 'Psicóloga Clínica',
                              image: otherParty?.avatar_url || '/avatars/01.png',
                              date: format(scheduledDate, "dd 'de' MMMM, yyyy", { locale: ptBR }),
                              time: format(scheduledDate, 'HH:mm'),
                              psychologistId: session.psychologist_id,
                              crp: psychMap.get(session.psychologist_id)?.crp || undefined,
                              specialties: psychMap.get(session.psychologist_id)?.specialties || [],
                              price: psychMap.get(session.psychologist_id)?.pricePerSession
                                ? Number(psychMap.get(session.psychologist_id)!.pricePerSession)
                                : undefined,
                            }}
                          >
                            <Button variant="outline" className="w-full md:w-auto h-9">
                              Reagendar
                            </Button>
                          </RescheduleDialog>
                          {isUpcoming && (
                            <Button asChild className="w-full md:w-auto gap-2 h-9">
                              <Link href={`/dashboard/sessoes/${session.id}`}>
                                <Video className="h-4 w-4" />
                                Entrar
                              </Link>
                            </Button>
                          )}
                        </>
                      ) : (
                        <>
                          <ReceiptDialog
                            session={{
                              id: session.id,
                              doctor: otherParty?.full_name || 'Especialista',
                              role: isPsychologist ? 'Paciente' : 'Psicóloga Clínica',
                              date: format(scheduledDate, "dd 'de' MMMM, yyyy", { locale: ptBR }),
                              time: format(scheduledDate, 'HH:mm'),
                              amount: Number(session.price),
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full md:w-auto text-muted-foreground"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Recibo
                            </Button>
                          </ReceiptDialog>
                          <Button variant="outline" size="sm" asChild className="w-full md:w-auto">
                            <Link href="/busca">Agendar Novamente</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
