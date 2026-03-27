import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'
import { logger } from './logger'

export async function createAuditLog(data: {
  userId: string
  action: string
  entity: string
  entityId?: string
  oldData?: any
  newData?: any
}) {
  try {
    const ipAddress = (await headers()).get('x-forwarded-for') || 'unknown'

    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        oldData: data.oldData,
        newData: data.newData,
        ipAddress,
      },
    })
  } catch (error) {
    // We don't want to crash the main operation just because logging failed,
    // but we MUST know about it.
    logger.error('Failed to create audit log:', error)
  }
}
