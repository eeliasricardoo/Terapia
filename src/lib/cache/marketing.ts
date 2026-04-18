import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/utils/logger'

/**
 * Marketing Cache Layer
 * 
 * Caches public information displayed on landing pages.
 */

const COUNTER_CACHE_TTL = 3600 // 1 hour — counts don't need to be live

/**
 * Get the count of verified psychologists, cached for 1 hour.
 * Falls back to a reasonable default if the query fails to avoid crashing the landing page.
 */
export async function getCachedPsychologistCount() {
  try {
    return await unstable_cache(
      async () => {
        try {
          return await prisma.psychologistProfile.count({
            where: { isVerified: true },
          })
        } catch (error) {
          logger.error('Error counting psychologists in cache:', error)
          return 0
        }
      },
      ['psychologist-count'],
      {
        revalidate: COUNTER_CACHE_TTL,
        tags: ['marketing', 'psychologist-count'],
      }
    )()
  } catch (error) {
    logger.error('Failed to get cached psychologist count:', error)
    return 0
  }
}
