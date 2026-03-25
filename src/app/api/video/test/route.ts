import { createDailyRoom, createDailyToken } from '@/lib/daily'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const uniqueSuffix = Math.random().toString(36).substring(2, 7)
    const roomName = `test-room-${uniqueSuffix}`

    let roomUrl = ''
    try {
      const roomData = await createDailyRoom(roomName)
      roomUrl = roomData.url
    } catch (error) {
      console.error('Error creating Daily test room:', error)
      return NextResponse.json({ error: 'Falha ao criar sala de teste' }, { status: 500 })
    }

    try {
      const token = await createDailyToken(roomName, 'Test User', true, 3600)
      return NextResponse.json({
        token,
        url: roomUrl,
        scheduledAt: new Date().toISOString(),
        durationMinutes: 50,
        isPsychologist: true, // Test with full permissions by default
      })
    } catch (error) {
      console.error('Error creating Daily test token:', error)
      return NextResponse.json({ error: 'Falha ao criar token de teste' }, { status: 500 })
    }
  } catch (error) {
    console.error('[VIDEO_TEST_TOKEN_ERROR]', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
