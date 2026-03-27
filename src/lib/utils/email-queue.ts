import { redis, EMAIL_QUEUE_KEY } from '@/lib/upstash/redis'
import { logger } from './logger'

type EmailPayload = {
  to: string
  subject: string
  html: string
}

/**
 * Pushes an email to the Redis queue for later processing.
 * This is extremely fast and ensures data persistence even if the
 * calling server action terminates unexpectedly.
 */
export async function pushToEmailQueue(payload: EmailPayload): Promise<boolean> {
  if (!redis) {
    logger.warn('[EMAIL-QUEUE] Redis not configured. Skipping queue.', payload.to)
    return false
  }

  try {
    const data = {
      ...payload,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      attempts: 0,
    }

    // RPUSH to the end of the list
    await redis.rpush(EMAIL_QUEUE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    logger.error('[EMAIL-QUEUE] Failed to push to queue:', error)
    return false
  }
}

/**
 * Shifts (removes from start) up to `count` items from the queue.
 */
export async function popFromEmailQueue(count: number = 10): Promise<any[]> {
  if (!redis) return []

  try {
    // LPOP returns a string or null (or array if count is supported)
    // Using pipeline for efficiency if we need multiple
    const items: any[] = []

    for (let i = 0; i < count; i++) {
      const item = await redis.lpop(EMAIL_QUEUE_KEY)
      if (!item) break
      items.push(typeof item === 'string' ? JSON.parse(item) : item)
    }

    return items
  } catch (error) {
    logger.error('[EMAIL-QUEUE] Error popping from queue:', error)
    return []
  }
}
