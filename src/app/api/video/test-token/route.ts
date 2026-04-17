import { createDailyRoom, createDailyToken, getDailyRoom } from '@/lib/daily'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/utils/logger'

export async function POST(req: Request) {
  // Test-only endpoint: disabled in production to prevent unauthenticated Daily.co room creation
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const body = await req.json()
    const { role } = body

    if (!role || !['psychologist', 'patient'].includes(role)) {
      return NextResponse.json({ error: 'Role inválido' }, { status: 400 })
    }

    const testRoomName = 'test-room-mindcares'
    let roomUrl = ''

    try {
      const roomData = await createDailyRoom(testRoomName)
      roomUrl = roomData.url
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : ''
      if (errMsg.includes('already exists')) {
        try {
          const roomData = await getDailyRoom(testRoomName)
          roomUrl = roomData.url
        } catch (innerError: unknown) {
          logger.error('Error fetching existing Daily room for test:', innerError)
          return NextResponse.json(
            { error: 'Falha ao recuperar sala de teste existente' },
            { status: 500 }
          )
        }
      } else {
        logger.error('Error creating Daily room for test:', error)
        return NextResponse.json({ error: 'Falha ao criar sala de teste' }, { status: 500 })
      }
    }

    const isPsychologist = role === 'psychologist'
    const userName = isPsychologist ? 'Psicólogo (Teste)' : 'Paciente (Teste)'
    const isOwner = isPsychologist

    try {
      const durationInSeconds = 3600 // 1 hour for test
      const token = await createDailyToken(testRoomName, userName, isOwner, durationInSeconds)

      return NextResponse.json({
        token,
        url: roomUrl,
        scheduledAt: new Date().toISOString(),
        durationMinutes: 60,
        isPsychologist,
      })
    } catch (error) {
      logger.error('Error creating Daily token for test:', error)
      return NextResponse.json({ error: 'Falha ao criar token da sala de teste' }, { status: 500 })
    }
  } catch (error) {
    logger.error('[VIDEO_TEST_TOKEN_ERROR]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
