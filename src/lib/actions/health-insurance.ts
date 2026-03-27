'use server'

import { prisma } from '@/lib/prisma'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

/**
 * Fetches alphabetical list of all supported health insurances.
 */
export const getHealthInsurances = createSafeAction(
  z.void().optional(),
  async () => {
    return await prisma.healthInsurance.findMany({
      orderBy: { name: 'asc' },
    })
  },
  { isPublic: true }
)
