'use server'

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
    console.error('Error fetching health insurances:', error)
    return { success: false, error: 'Erro ao buscar planos de saúde' }
  }
}
