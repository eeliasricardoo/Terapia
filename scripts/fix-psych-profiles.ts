import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

async function main() {
  console.log('--- Inciando Reparo de Perfis de Psicólogos ---')

  const profiles = await prisma.profile.findMany({
    where: { role: 'PSYCHOLOGIST' },
    include: {
      users: {
        include: {
          psychologistProfile: true,
        },
      },
    },
  })

  console.log(`Encontrados ${profiles.length} profissionais com cargo PSYCHOLOGIST.`)

  for (const p of profiles) {
    if (!p.users?.psychologistProfile) {
      console.log(`Criando perfil profissional para: ${p.fullName} (${p.user_id})`)

      // Se for a Ana María Rojas (conforme screenshot) ou outros do seed que deveriam estar aprovados
      const shouldBeVerified =
        p.fullName?.includes('Ana María Rojas') || p.user_id.startsWith('psych-')

      await prisma.psychologistProfile.create({
        data: {
          userId: p.user_id,
          crp: p.document || `CRP/FIX-${p.user_id.slice(0, 5)}`, // Unique fallback if no CRP
          isVerified: shouldBeVerified,
          bio: 'Perfil profissional criado pelo sistema de auto-reparo.',
          specialties: [],
          pricePerSession: 150,
          weeklySchedule: {
            monday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
            tuesday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
            wednesday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
            thursday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
            friday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
            saturday: { enabled: false, slots: [] },
            sunday: { enabled: false, slots: [] },
          },
        },
      })
      console.log(`✅ Perfil criado para ${p.fullName}. Status Verificado: ${shouldBeVerified}`)
    } else {
      // Se ela já existe mas está como false e deveria estar como true (casos de seed que foram resetados ou algo do tipo)
      if (p.fullName?.includes('Ana María Rojas') && !p.users.psychologistProfile.isVerified) {
        await prisma.psychologistProfile.update({
          where: { userId: p.user_id },
          data: { isVerified: true },
        })
        console.log(`✅ Status da Dra. Ana María Rojas atualizado para VERIFICADO.`)
      }
    }
  }

  console.log('--- Reparo finalizado ---')
}

main().finally(() => prisma.$disconnect())
