import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/upstash/redis'

/**
 * Internal API to view critical logs from Redis.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  const envSecret = process.env.INTERNAL_API_SECRET

  if (!envSecret || secret !== envSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!redis) {
    return NextResponse.json({ error: 'Redis not configured' }, { status: 500 })
  }

  try {
    const logs = await redis.lrange('terapia:logs:critical', 0, 100)
    return NextResponse.json({
      count: logs.length,
      logs: logs.map((l) => (typeof l === 'string' ? JSON.parse(l) : l)),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}

/**
 * Clear legacy logs if needed
 */
export async function DELETE(req: NextRequest) {
  const secret = req.headers.get('x-internal-secret')
  const envSecret = process.env.INTERNAL_API_SECRET

  if (!envSecret || secret !== envSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!redis) return NextResponse.json({ error: 'Redis not configured' }, { status: 500 })

  await redis.del('terapia:logs:critical')
  return NextResponse.json({ success: true })
}
