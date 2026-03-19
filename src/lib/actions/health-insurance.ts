'use server'

import { logger } from '@/lib/utils/logger'

import { prisma } from '@/lib/prisma'

export async function getHealthInsurances() {
  try {
    const insurances = await prisma.healthInsurance.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return { success: true, data: insurances }
  } catch (error) {
    logger.error('Error fetching health insurances:', error)
    return { success: false, error: 'Erro ao buscar planos de saúde' }
  }
}
