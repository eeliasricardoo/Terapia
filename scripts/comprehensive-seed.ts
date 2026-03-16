import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const PSYCHOLOGISTS = [
  {
    email: 'psicologo.ana@test.com',
    name: 'Ana Silva',
    crp: '06/12345',
    specialties: ['Terapia Cognitivo-Comportamental', 'Ansiedade'],
    bio: 'Especialista em transtornos de ansiedade com 10 anos de experiência.',
    price: 180.0,
  },
  {
    email: 'psicologo.joao@test.com',
    name: 'João Santos',
    crp: '06/54321',
    specialties: ['Psicanálise', 'Depressão', 'Relacionamentos'],
    bio: 'Foco em psicoterapia profunda e autoconhecimento.',
    price: 150.0,
  },
]

const PATIENTS = [
  { email: 'paciente.carlos@test.com', name: 'Carlos Oliveira' },
  { email: 'paciente.maria@test.com', name: 'Maria Souza' },
  { email: 'paciente.pedro@test.com', name: 'Pedro Ferreira' },
]

async function createAuthUser(email: string, name: string) {
  console.log(`Checking/Creating auth user: ${email}`)

  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers()
  if (listError) throw listError

  let authUser = users.find((u) => u.email === email)

  if (!authUser) {
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: 'Password123!',
      email_confirm: true,
      user_metadata: { full_name: name },
    })
    if (createError) throw createError
    authUser = createData.user
    console.log(`✅ Created auth user: ${email}`)
  } else {
    console.log(`ℹ️ Auth user already exists: ${email}`)
  }

  return authUser
}

async function main() {
  try {
    console.log('🚀 Starting comprehensive seeding...')

    // 1. Create Psychologists
    const psychIds: string[] = []
    const psychProfileIds: string[] = []

    for (const p of PSYCHOLOGISTS) {
      const authUser = await createAuthUser(p.email, p.name)

      // Upsert User in Prisma
      const user = await prisma.user.upsert({
        where: { email: p.email },
        update: { name: p.name, role: UserRole.PSYCHOLOGIST },
        create: {
          id: authUser.id,
          email: p.email,
          name: p.name,
          role: UserRole.PSYCHOLOGIST,
        },
      })

      // Upsert Profile
      await prisma.profile.upsert({
        where: { user_id: user.id },
        update: { fullName: p.name, role: UserRole.PSYCHOLOGIST },
        create: {
          id: user.id,
          user_id: user.id,
          fullName: p.name,
          role: UserRole.PSYCHOLOGIST,
        },
      })

      // Upsert Psychologist Profile
      const psychProfile = await prisma.psychologistProfile.upsert({
        where: { userId: user.id },
        update: {
          crp: p.crp,
          bio: p.bio,
          specialties: p.specialties,
          pricePerSession: p.price,
          isVerified: true,
          weeklySchedule: {
            sessionDuration: '50',
            monday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
            tuesday: { enabled: true, slots: [{ start: '08:00', end: '12:00' }] },
            wednesday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
            thursday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
            friday: { enabled: true, slots: [{ start: '08:00', end: '16:00' }] },
            saturday: { enabled: false, slots: [] },
            sunday: { enabled: false, slots: [] },
          },
        },
        create: {
          userId: user.id,
          crp: p.crp,
          bio: p.bio,
          specialties: p.specialties,
          pricePerSession: p.price,
          isVerified: true,
          weeklySchedule: {
            sessionDuration: '50',
            monday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
            tuesday: { enabled: true, slots: [{ start: '08:00', end: '12:00' }] },
            wednesday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
            thursday: { enabled: true, slots: [{ start: '08:00', end: '18:00' }] },
            friday: { enabled: true, slots: [{ start: '08:00', end: '16:00' }] },
            saturday: { enabled: false, slots: [] },
            sunday: { enabled: false, slots: [] },
          },
        },
      })

      psychIds.push(user.id)
      psychProfileIds.push(psychProfile.id)
    }

    // 2. Create Patients
    const patientIds: string[] = []
    const patientProfileIds: string[] = []

    for (const p of PATIENTS) {
      const authUser = await createAuthUser(p.email, p.name)

      const user = await prisma.user.upsert({
        where: { email: p.email },
        update: { name: p.name, role: UserRole.PATIENT },
        create: {
          id: authUser.id,
          email: p.email,
          name: p.name,
          role: UserRole.PATIENT,
        },
      })

      const profile = await prisma.profile.upsert({
        where: { user_id: user.id },
        update: { fullName: p.name, role: UserRole.PATIENT },
        create: {
          id: user.id,
          user_id: user.id,
          fullName: p.name,
          role: UserRole.PATIENT,
        },
      })

      patientIds.push(user.id)
      patientProfileIds.push(profile.id)
    }

    // 3. Create Patient-Psychologist Links
    console.log('🔗 Creating links...')
    // PatientPsychologistLink relates Profile to Profile
    await prisma.patientPsychologistLink.upsert({
      where: {
        patientId_psychologistId: { patientId: patientIds[0], psychologistId: psychIds[0] },
      },
      update: { status: 'active' },
      create: { patientId: patientIds[0], psychologistId: psychIds[0], status: 'active' },
    })

    await prisma.patientPsychologistLink.upsert({
      where: {
        patientId_psychologistId: { patientId: patientIds[1], psychologistId: psychIds[0] },
      },
      update: { status: 'active' },
      create: { patientId: patientIds[1], psychologistId: psychIds[0], status: 'active' },
    })

    // 4. Create Appointments
    console.log('📅 Creating appointments...')
    const now = new Date()

    // Ana with Carlos - COMPLETED (Yesterday)
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    yesterday.setHours(14, 0, 0, 0)

    await prisma.appointment.create({
      data: {
        patientId: patientIds[0],
        psychologistId: psychProfileIds[0],
        scheduledAt: yesterday,
        status: AppointmentStatus.COMPLETED,
        price: 180.0,
        sessionType: 'Psicoterapia Individual',
      },
    })

    // Ana with Maria - SCHEDULED (Tomorrow)
    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)

    await prisma.appointment.create({
      data: {
        patientId: patientIds[1],
        psychologistId: psychProfileIds[0],
        scheduledAt: tomorrow,
        status: AppointmentStatus.SCHEDULED,
        price: 180.0,
        sessionType: 'Psicoterapia Individual',
      },
    })

    // João with Carlos - SCHEDULED (Today in 2 hours)
    const todayLater = new Date(now)
    todayLater.setHours(now.getHours() + 2, 0, 0, 0)

    await prisma.appointment.create({
      data: {
        patientId: patientIds[0],
        psychologistId: psychProfileIds[1],
        scheduledAt: todayLater,
        status: AppointmentStatus.SCHEDULED,
        price: 150.0,
        sessionType: 'Primeira Consulta',
      },
    })

    // 5. Create Diary Entries
    console.log('📒 Creating diary entries...')
    await prisma.diaryEntry.create({
      data: {
        userId: patientIds[0],
        mood: 4,
        emotions: ['Feliz', 'Grato'],
        content:
          'Tive uma ótima sessão hoje. Sinto que estou progredindo no controle da minha ansiedade.',
      },
    })

    await prisma.diaryEntry.create({
      data: {
        userId: patientIds[1],
        mood: 2,
        emotions: ['Cansado', 'Ansioso'],
        content:
          'Dia difícil no trabalho. Muita pressão e prazos apertados. Ansiosa pela consulta de amanhã.',
      },
    })

    // 6. Create Messages/Conversations
    console.log('💬 Creating sample chat...')
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: psychIds[0] }, { userId: patientIds[0] }],
        },
      },
    })

    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderId: psychIds[0],
          content: 'Olá Carlos, como você tem se sentido desde nossa última sessão?',
        },
        {
          conversationId: conversation.id,
          senderId: patientIds[0],
          content:
            'Olá Dra. Ana, estou me sentindo mais calmo, mas ainda tive um episódio de ansiedade ontem.',
        },
        {
          conversationId: conversation.id,
          senderId: psychIds[0],
          content: 'Entendo. Vamos conversar mais sobre isso na nossa próxima sessão de amanhã.',
        },
      ],
    })

    console.log('\n✨ Seeding completed successfully!')
    console.log('\n--- CREDENTIALS (Password: Password123!) ---')
    console.log('Psychologists:')
    PSYCHOLOGISTS.forEach((p) => console.log(`  - ${p.email}`))
    console.log('Patients:')
    PATIENTS.forEach((p) => console.log(`  - ${p.email}`))
    console.log('-------------------------------------------\n')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
