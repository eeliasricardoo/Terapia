import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { createDailyRoom, createDailyToken } from '@/lib/daily'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'
import { checkRateLimit } from '@/lib/security'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { appointmentId } = body

    if (!appointmentId) {
      return NextResponse.json({ error: 'ID do agendamento ausente' }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    // Apply Rate Limiting
    const rateLimit = await checkRateLimit(`video-token:${user.id}`)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Muitas requisições. Tente novamente mais tarde.' },
        { status: 429 }
      )
    }

    // 1. Fetch appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        psychologist: { include: { user: true } },
        patient: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
    }

    // 2. Verify user permissions
    const isPatient = appointment.patientId === user.id
    const isPsychologist = appointment.psychologist.userId === user.id

    if (!isPatient && !isPsychologist) {
      return NextResponse.json(
        { error: 'Acesso negado - Você não faz parte deste agendamento' },
        { status: 403 }
      )
    }

    // 3. Check appointment time window
    const now = new Date()
    const scheduledAt = new Date(appointment.scheduledAt)

    // Window: Psychologists 30 min before, Patients 15 min before
    const leadTimeMinutes = isPsychologist ? 30 : 15
    const startTime = new Date(scheduledAt.getTime() - leadTimeMinutes * 60 * 1000)

    // Session ends at scheduledAt + duration + 30 min buffer
    const endTime = new Date(scheduledAt.getTime() + (appointment.durationMinutes + 30) * 60 * 1000)

    if (now < startTime) {
      return NextResponse.json(
        {
          error: `Muito cedo. A sala estará disponível ${leadTimeMinutes} minutos antes do horário.`,
        },
        { status: 403 }
      )
    }

    if (now > endTime) {
      return NextResponse.json(
        { error: 'Sessão encerrada. O acesso à sala expirou.' },
        { status: 403 }
      )
    }

    // 3. Create a Fresh Room for every session attempt to ensure it hasn't expired
    // The previous room URL in appointment.meetingUrl might be stale/expired
    const uniqueSuffix = Math.random().toString(36).substring(2, 7)
    const roomName = `terapia-${appointmentId}-${uniqueSuffix}`
    let roomUrl = ''

    try {
      const roomData = await createDailyRoom(roomName)
      roomUrl = roomData.url

      // Update meeting URL to the latest valid one
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { meetingUrl: roomUrl },
      })
    } catch (error) {
      logger.error('Error creating Daily room:', error)
      return NextResponse.json({ error: 'Falha ao criar sala de reunião' }, { status: 500 })
    }

    // 4. Generate Token
    // Patient: attendee, Psych: owner
    const isOwner = isPsychologist
    const userName = isPsychologist
      ? appointment.psychologist.userId === user.id
        ? 'Dr(a). ' + (user.user_metadata?.full_name || 'Psicólogo')
        : 'Psicólogo'
      : appointment.patient.name || 'Paciente'

    try {
      // Security: Set token duration to Appointment Duration + 20 minutes buffer
      // This ensures the call automatically cuts off preventing billing overages
      const durationBuffer = 20 // 20 minutes
      const durationInSeconds = ((appointment.durationMinutes || 50) + durationBuffer) * 60

      const token = await createDailyToken(roomName, userName, isOwner, durationInSeconds)
      return NextResponse.json({
        token,
        url: roomUrl,
        scheduledAt: appointment.scheduledAt,
        durationMinutes: appointment.durationMinutes,
        isPsychologist,
      })
    } catch (error) {
      logger.error('Error creating Daily token:', error)
      return NextResponse.json({ error: 'Falha ao criar token da sala' }, { status: 500 })
    }
  } catch (error) {
    logger.error('[VIDEO_TOKEN_ERROR]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
