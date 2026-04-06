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
import { Link } from '@/i18n/routing'
import { prisma } from '@/lib/prisma'
import { getTranslations } from 'next-intl/server'

export default async function SessionsPage() {
  const t = await getTranslations('SessionsList')
  const profile = await getCurrentUserProfile()

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t('loginRequired')}</p>
        <Button asChild className="mt-4">
          <Link href="/login">{t('loginButton')}</Link>
        </Button>
      </div>
    )
  }

  const sessionsRes = await getUserSessions({ limit: 20 })
  const {
    sessions = [],
    total = 0,
    nextCursor = null,
  } = sessionsRes.success ? sessionsRes.data : {}

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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
          {total > 0 && (
            <span className="ml-1">
              {nextCursor
                ? t('summaryPagination', { count: sessions.length, total })
                : t('summaryTotal', { total })}
            </span>
          )}
        </p>
      </div>

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <CalendarX className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium">{t('emptyTitle')}</p>
              <p className="text-sm">{t('emptyDesc')}</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/busca">{t('searchPsychologists')}</Link>
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
            const statusUpper = (session.status || '').toUpperCase()
            const isUpcoming = scheduledDate > now && statusUpper === 'SCHEDULED'

            // We allow rescheduling if it's upcoming OR if it's a past scheduled session (missed)
            // especially useful for psychologists to manage their agenda
            const canReschedule =
              statusUpper === 'SCHEDULED' && (isUpcoming || isPsychologist || scheduledDate < now)

            return (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                    {/* Date Box - horizontal strip on mobile, vertical block on sm+ */}
                    <div className="flex-shrink-0 flex sm:flex-col items-center sm:justify-center bg-slate-50 rounded-lg border p-3 sm:p-4 sm:min-w-[80px] w-full sm:w-auto gap-3 sm:gap-0">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground sm:mb-1" />
                      <div className="flex items-baseline gap-1 sm:flex-col sm:items-center">
                        <span className="text-xl sm:text-2xl font-bold text-primary">
                          {format(scheduledDate, 'dd')}
                        </span>
                        <span className="text-xs font-medium uppercase text-muted-foreground">
                          {format(scheduledDate, 'MMM', { locale: ptBR })}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground sm:hidden ml-auto">
                        {format(scheduledDate, 'HH:mm')}
                      </span>
                    </div>

                    {/* Session Info */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={otherParty?.avatar_url || undefined} />
                          <AvatarFallback>
                            {(otherParty?.full_name || 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold text-lg">
                          {otherParty?.full_name || 'Usuário'}
                        </h3>
                        {isUpcoming && (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                            {t('badges.scheduled')}
                          </Badge>
                        )}
                        {statusUpper === 'COMPLETED' && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                          >
                            {t('badges.completed')}
                          </Badge>
                        )}
                        {(statusUpper === 'CANCELLED' || statusUpper === 'CANCELED') && (
                          <Badge
                            variant="destructive"
                            className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                          >
                            {t('badges.cancelled')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isPsychologist
                          ? t('roles.patient')
                          : otherParty?.role === 'PSYCHOLOGIST'
                            ? t('roles.psychologist')
                            : t('roles.specialist')}
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
                          <Video className="h-4 w-4" /> {t('online')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto flex-wrap">
                      {canReschedule ? (
                        <>
                          <RescheduleDialog
                            session={{
                              id: session.id,
                              doctor: otherParty?.full_name || 'Especialista',
                              role: isPsychologist ? 'Paciente' : 'Psicólogo(a)',
                              image: otherParty?.avatar_url || '/avatars/01.png',
                              date: format(scheduledDate, "dd 'de' MMMM, yyyy", { locale: ptBR }),
                              time: format(scheduledDate, 'HH:mm'),
                              psychologistId: session.psychologist_id,
                              crp: psychMap.get(session.psychologist_id)?.crp || undefined,
                              specialties: psychMap.get(session.psychologist_id)?.specialties || [],
                              price: psychMap.get(session.psychologist_id)?.pricePerSession
                                ? Number(psychMap.get(session.psychologist_id)!.pricePerSession)
                                : undefined,
                              scheduledAt: scheduledDate.toISOString(),
                            }}
                          >
                            <Button variant="outline" className="w-full sm:w-auto h-9">
                              {t('reschedule')}
                            </Button>
                          </RescheduleDialog>
                          {isUpcoming && (
                            <Button asChild className="w-full md:w-auto gap-2 h-9">
                              <Link href={`/dashboard/sessoes/${session.id}`}>
                                <Video className="h-4 w-4" />
                                {t('enterSession')}
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
                              role: isPsychologist ? 'Paciente' : 'Psicólogo(a)',
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
                              {t('receipt')}
                            </Button>
                          </ReceiptDialog>
                          <Button variant="outline" size="sm" asChild className="w-full md:w-auto">
                            <Link href="/busca">{t('scheduleAgain')}</Link>
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
