const { PrismaClient, UserRole } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seed started...')

  const psychologists = [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Dr. Ricardo Santos',
      email: 'ricardo.santos@exemplo.com',
      bio: 'Especialista em Terapia Cognitivo-Comportamental com mais de 10 anos de experiência ajudando pessoas a superarem ansiedade e estresse crônico.',
      specialties: ['Ansiedade', 'Estresse', 'TCC', 'Depressão'],
      pricePerSession: 180.0,
      image:
        'https://images.unsplash.com/photo-1559839734-2b71f153673f?q=80&w=256&h=256&auto=format&fit=crop',
      crp: '0612345',
      university: 'USP',
      yearsOfExperience: 12,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Dra. Beatriz Oliveira',
      email: 'beatriz.oliveira@exemplo.com',
      bio: 'Psicóloga clínica focada em relacionamentos e terapia de casal. Acredito na comunicação como base para uma vida plena a dois.',
      specialties: ['Relacionamentos', 'Casal', 'Conflitos Familiares'],
      pricePerSession: 220.0,
      image:
        'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=256&h=256&auto=format&fit=crop',
      crp: '1254321',
      university: 'PUC-SP',
      yearsOfExperience: 15,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      name: 'Dr. Lucas Mendes',
      email: 'lucas.mendes@exemplo.com',
      bio: 'Atendimento humanizado para jovens e adultos. Especialista em transtornos de humor e desenvolvimento pessoal.',
      specialties: ['Desenvolvimento Pessoal', 'Humor', 'Jovens'],
      pricePerSession: 150.0,
      image:
        'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=256&h=256&auto=format&fit=crop',
      crp: '0898765',
      university: 'Unicamp',
      yearsOfExperience: 8,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      name: 'Dra. Fernanda Rocha',
      email: 'fernanda.rocha@exemplo.com',
      bio: 'Dedicada à saúde mental da mulher em todas as fases da vida. Experiência em transições de carreira e maternidade.',
      specialties: ['Saúde da Mulher', 'Carreira', 'Maternidade'],
      pricePerSession: 200.0,
      image:
        'https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=256&h=256&auto=format&fit=crop',
      crp: '0677889',
      university: 'UFRJ',
      yearsOfExperience: 10,
    },
  ]

  for (const psych of psychologists) {
    // Create User
    await prisma.user.upsert({
      where: { email: psych.email },
      update: {},
      create: {
        id: psych.id,
        email: psych.email,
        name: psych.name,
        image: psych.image,
        role: UserRole.PSYCHOLOGIST,
      },
    })

    // Create Profile
    await prisma.profile.upsert({
      where: { user_id: psych.id },
      update: {},
      create: {
        user_id: psych.id,
        fullName: psych.name,
        avatarUrl: psych.image,
        role: UserRole.PSYCHOLOGIST,
        document: `123456${psych.crp}`.slice(0, 11), // Fake CPF
      },
    })

    // Create PsychologistProfile
    await prisma.psychologistProfile.upsert({
      where: { userId: psych.id },
      update: {},
      create: {
        userId: psych.id,
        crp: psych.crp,
        bio: psych.bio,
        specialties: psych.specialties,
        pricePerSession: psych.pricePerSession,
        isVerified: true,
        university: psych.university,
        yearsOfExperience: psych.yearsOfExperience,
        timezone: 'America/Sao_Paulo',
      },
    })
  }

  // Create some Patients
  const patients = [
    {
      id: '550e8400-e29b-41d4-a716-446655440100',
      name: 'João Paciente',
      email: 'joao.paciente@exemplo.com',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440101',
      name: 'Maria Souza',
      email: 'maria.souza@exemplo.com',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop',
    },
  ]

  for (const patient of patients) {
    await prisma.user.upsert({
      where: { email: patient.email },
      update: {},
      create: {
        id: patient.id,
        email: patient.email,
        name: patient.name,
        image: patient.image,
        role: UserRole.PATIENT,
      },
    })

    await prisma.profile.upsert({
      where: { user_id: patient.id },
      update: {},
      create: {
        user_id: patient.id,
        fullName: patient.name,
        avatarUrl: patient.image,
        role: UserRole.PATIENT,
        document: `987654${patient.id.slice(-5)}`.replace(/\D/g, '').slice(0, 11),
      },
    })
  }

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
