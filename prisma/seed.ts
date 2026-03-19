const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Final Seed started: Creating 12 unique psychologists...')

  // 1. Clean up existing test data to avoid duplicates
  // We identify them by IDs or just clean everything if it's a dev environment
  await prisma.psychologistProfile.deleteMany({
    where: {
      userId: {
        in: [
          'psych-001',
          'psych-002',
          'psych-003',
          'psych-004',
          'psych-005',
          'psych-006',
          'psych-007',
          'psych-008',
          'psych-009',
          'psych-010',
          'psych-011',
          'psych-012',
        ],
      },
    },
  })
  await prisma.profile.deleteMany({
    where: {
      user_id: {
        in: [
          'psych-001',
          'psych-002',
          'psych-003',
          'psych-004',
          'psych-005',
          'psych-006',
          'psych-007',
          'psych-008',
          'psych-009',
          'psych-010',
          'psych-011',
          'psych-012',
        ],
      },
    },
  })
  await prisma.user.deleteMany({
    where: {
      id: {
        in: [
          'psych-001',
          'psych-002',
          'psych-003',
          'psych-004',
          'psych-005',
          'psych-006',
          'psych-007',
          'psych-008',
          'psych-009',
          'psych-010',
          'psych-011',
          'psych-012',
        ],
      },
    },
  })

  // Standard Schedule
  const schedule = {
    sessionDuration: '50',
    monday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
    tuesday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
    wednesday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
    thursday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
    friday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  }

  const psychologists = [
    {
      id: 'psych-001',
      name: 'Dra. Beatriz Almeida',
      email: 'beatriz.a@mindcare.com',
      crp: '06/A1001',
      bio: 'Especialista em Terapia Cognitivo-Comportamental com foco em transtornos de pânico e fobias sociais.',
      specialties: ['Ansiedade', 'Pânico', 'Fobias'],
      price: 160,
      avatar: '/avatars/unique/avatar_f1.png',
    },
    {
      id: 'psych-002',
      name: 'Dr. Leonardo Vasconcelos',
      email: 'leo.v@mindcare.com',
      crp: '06/A1002',
      bio: 'Focado em psicologia existencial e humanista, auxiliando em crises de identidade e autoconhecimento.',
      specialties: ['Autoestima', 'Luto', 'Humanista'],
      price: 180,
      avatar: '/avatars/unique/avatar_m1.png',
    },
    {
      id: 'psych-003',
      name: 'Dra. Isabela Ferreira',
      email: 'isabela.f@mindcare.com',
      crp: '06/A1003',
      bio: 'Psicóloga clínica com vasta experiência em TDAH e neurodiversidade em adultos e crianças.',
      specialties: ['TDAH', 'Neurodiversidade', 'Infantil'],
      price: 210,
      avatar: '/avatars/unique/avatar_f2.png',
    },
    {
      id: 'psych-004',
      name: 'Dr. Felipe Rocha',
      email: 'felipe.r@mindcare.com',
      crp: '06/A1004',
      bio: 'Especialista em psicanálise contemporânea, com profundidade em relacionamentos e traumas de infância.',
      specialties: ['Psicanálise', 'Relacionamentos', 'Trauma'],
      price: 150,
      avatar: '/avatars/unique/avatar_m2.png',
    },
    {
      id: 'psych-005',
      name: 'Dra. Helena Souza',
      email: 'helena.s@mindcare.com',
      crp: '06/A1005',
      bio: 'Atuação em Psicologia Positiva e Fenomenologia, ajudando na descoberta de propósito e gestão de carreira.',
      specialties: ['Propósito', 'Carreira', 'Felicidade'],
      price: 200,
      avatar: '/avatars/unique/avatar_f3.png',
    },
    {
      id: 'psych-006',
      name: 'Dr. Ricardo Lima',
      email: 'ricardo.l@mindcare.com',
      crp: '06/A1006',
      bio: 'Expert em gestão de estresse e Burnout para executivos e profissionais de alta pressão.',
      specialties: ['Burnout', 'Estresse', 'Produtividade'],
      price: 250,
      avatar: '/avatars/unique/avatar_m3.png',
    },
    {
      id: 'psych-007',
      name: 'Dra. Camila Nunes',
      email: 'camila.n@mindcare.com',
      crp: '06/A1007',
      bio: 'Foco em distúrbios alimentares e imagem corporal. Abordagem acolhedora e sem julgamentos.',
      specialties: ['Alimentação', 'Autoimagem', 'Bulimia'],
      price: 170,
      avatar: '/avatars/unique/avatar_f4.png',
    },
    {
      id: 'psych-008',
      name: 'Dr. Cláudio Moreira',
      email: 'claudio.m@mindcare.com',
      crp: '06/A1008',
      bio: 'Terapia de Casal facilitando a comunicação não-violenta e a resolução de conflitos familiares.',
      specialties: ['Casal', 'Família', 'Mediação'],
      price: 195,
      avatar: '/avatars/unique/avatar_m4.png',
    },
    {
      id: 'psych-009',
      name: 'Dra. Tatiane Braga',
      email: 'tati.b@mindcare.com',
      crp: '06/A1009',
      bio: 'Trabalha com depressão pós-parto e maternidade, oferecendo suporte emocional para mães.',
      specialties: ['Maternidade', 'Post-Parto', 'Depressão'],
      price: 145,
      avatar: '/avatars/unique/avatar_f5.png',
    },
    {
      id: 'psych-010',
      name: 'Dr. Bruno Silveira',
      email: 'bruno.s@mindcare.com',
      crp: '06/A1010',
      bio: 'Psicólogo do esporte e performance. Ajuda atletas a alcançarem o máximo de seu potencial mental.',
      specialties: ['Esporte', 'Performance', 'Foco'],
      price: 230,
      avatar: '/avatars/unique/avatar_m5.png',
    },
    {
      id: 'psych-011',
      name: 'Dra. Viviane Gomes',
      email: 'vivi.g@mindcare.com',
      crp: '06/A1011',
      bio: 'Especialista em clínica médica e psicossomática, entendendo a relação entre mente e corpo.',
      specialties: ['Psicossomática', 'Dor Crônica', 'Saúde'],
      price: 165,
      avatar: '/avatars/unique/avatar_f6.png',
    },
    {
      id: 'psych-012',
      name: 'Dr. Samuel Mendes',
      email: 'samuel.m@mindcare.com',
      crp: '06/A1012',
      bio: 'Trabalho focado em LGBTQIA+ e questões de gênero com uma perspectiva interseccional e inclusiva.',
      specialties: ['LGBTQIA+', 'Gênero', 'Diversidade'],
      price: 155,
      avatar: '/avatars/unique/avatar_m6.png',
    },
  ]

  for (const psych of psychologists) {
    // 1. User
    await prisma.user.upsert({
      where: { id: psych.id },
      update: { role: 'PSYCHOLOGIST' },
      create: { id: psych.id, email: psych.email, name: psych.name, role: 'PSYCHOLOGIST' },
    })

    // 2. Profile
    await prisma.profile.upsert({
      where: { user_id: psych.id },
      update: { fullName: psych.name, avatarUrl: psych.avatar },
      create: {
        user_id: psych.id,
        fullName: psych.name,
        avatarUrl: psych.avatar,
        role: 'PSYCHOLOGIST',
      },
    })

    // 3. Psychologist Profile
    await prisma.psychologistProfile.upsert({
      where: { userId: psych.id },
      update: {
        isVerified: true,
        bio: psych.bio,
        specialties: psych.specialties,
        pricePerSession: psych.price,
        weeklySchedule: schedule,
      },
      create: {
        userId: psych.id,
        crp: psych.crp,
        bio: psych.bio,
        specialties: psych.specialties,
        pricePerSession: psych.price,
        isVerified: true,
        weeklySchedule: schedule,
      },
    })

    console.log(`Unique psychologist created: ${psych.name}`)
  }

  console.log('Final Seed finished successfully! 12 unique psychologists are online.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
