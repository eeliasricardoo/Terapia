import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
  const allUsers = await prisma.user.findMany({
    include: {
      psychologistProfile: true,
      profiles: true,
    },
  })

  const psychologists = allUsers.filter((u) => u.role === 'PSYCHOLOGIST')

  const approved = psychologists.filter((p) => p.psychologistProfile?.isVerified === true)
  const pending = psychologists.filter(
    (p) => p.psychologistProfile?.isVerified === false && !p.psychologistProfile?.suspensionReason
  )
  const suspended = psychologists.filter(
    (p) => p.psychologistProfile?.isVerified === false && p.psychologistProfile?.suspensionReason
  )
  const patients = allUsers.filter((u) => u.role === 'PATIENT')
  const admins = allUsers.filter((u) => u.role === 'ADMIN')

  console.log('=== RELATÓRIO GERAL DE USUÁRIOS ===')
  console.log(`Total de Usuários: ${allUsers.length}`)
  console.log(`- Pacientes: ${patients.length}`)
  console.log(`- Psicólogos Aprovados: ${approved.length}`)
  console.log(`- Psicólogos em Aprovação: ${pending.length}`)
  console.log(`- Psicólogos Suspensos: ${suspended.length}`)
  console.log(`- Administradores: ${admins.length}`)
  console.log('\n')

  console.log('=== LISTA DE PSICÓLOGOS APROVADOS ===')
  if (approved.length === 0) console.log('Nenhum encontrado.')
  approved.forEach((p, index) => {
    console.log(
      `${index + 1}. [${p.id}] ${p.profiles?.fullName || p.name || 'Sem nome'} - ${p.email} (CRP: ${p.psychologistProfile?.crp || 'N/A'})`
    )
  })

  console.log('\n=== LISTA DE PSICÓLOGOS EM APROVAÇÃO ===')
  if (pending.length === 0) console.log('Nenhum encontrado.')
  pending.forEach((p, index) => {
    console.log(
      `${index + 1}. [${p.id}] ${p.profiles?.fullName || p.name || 'Sem nome'} - ${p.email} (CRP: ${p.psychologistProfile?.crp || 'N/A'})`
    )
  })

  console.log('\n=== OUTROS USUÁRIOS (PACIENTES) ===')
  patients.slice(0, 50).forEach((p, index) => {
    console.log(`${index + 1}. ${p.profiles?.fullName || p.name || 'Sem nome'} - ${p.email}`)
  })
  if (patients.length > 50) console.log(`... e mais ${patients.length - 50} pacientes.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
