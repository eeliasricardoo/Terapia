const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seed started...')

  // 1. Create a Test Admin
  const adminId = 'admin-user-id-001'
  await prisma.user.upsert({
    where: { id: adminId },
    update: {},
    create: {
      id: adminId,
      email: 'admin@terapia.com.br',
      name: 'Admin MindCare',
      role: 'ADMIN',
    },
  })

  // 2. Create Sample Psychologists
  const psychologists = [
    {
      id: 'psych-001',
      name: 'Dra. Ana Silva',
      email: 'ana.silva@terapia.com.br',
      crp: '06/123456',
      specialties: ['Ansiedade', 'Depressão', 'Terapia Cognitivo-Comportamental'],
      bio: 'Especialista em transtornos de ansiedade com mais de 10 anos de experiência clínica.',
      price: 150.0,
    },
    {
      id: 'psych-002',
      name: 'Dr. Roberto Santos',
      email: 'roberto.santos@terapia.com.br',
      crp: '06/789012',
      specialties: ['Terapia de Casal', 'Luto', 'Relacionamentos'],
      bio: 'Focado em ajudar casais a encontrarem harmonia e superarem desafios de comunicação.',
      price: 180.0,
    },
    {
      id: 'psych-003',
      name: 'Dra. Juliana Costa',
      email: 'juliana.costa@terapia.com.br',
      crp: '06/345678',
      specialties: ['TDAH', 'Autismo', 'Psicologia Infantil'],
      bio: 'Atendimento lúdico e especializado para crianças e adolescentes neurodiversos.',
      price: 200.0,
    },
  ]

  for (const psych of psychologists) {
    // 1. Create User
    await prisma.user.upsert({
      where: { id: psych.id },
      update: {
        role: 'PSYCHOLOGIST',
      },
      create: {
        id: psych.id,
        email: psych.email,
        name: psych.name,
        role: 'PSYCHOLOGIST',
      },
    })

    // 2. Create Profile (Used by Search UI for name)
    // Note: Field name is user_id in schema
    await prisma.profile.upsert({
      where: { user_id: psych.id },
      update: {
        fullName: psych.name,
      },
      create: {
        user_id: psych.id,
        fullName: psych.name,
        role: 'PSYCHOLOGIST',
      },
    })

    // 3. Create Psychologist Profile (Verified)
    await prisma.psychologistProfile.upsert({
      where: { userId: psych.id },
      update: {
        isVerified: true,
        specialties: psych.specialties,
        pricePerSession: psych.price,
      },
      create: {
        userId: psych.id,
        crp: psych.crp,
        bio: psych.bio,
        specialties: psych.specialties,
        pricePerSession: psych.price,
        isVerified: true,
      },
    })

    console.log(`Created psychologist and profile: ${psych.name}`)
  }

  console.log('Seed finished successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
