/**
 * seed-qa-complete.ts
 *
 * Script de seed completo para QA.
 * Cria todos os usuários, cupons, planos, consultas e dados de teste
 * necessários para executar o roteiro manual de testes.
 *
 * Uso:
 *   npx ts-node --project tsconfig.scripts.json scripts/seed-qa-complete.ts
 *
 * Ou, se estiver usando tsx:
 *   npx tsx scripts/seed-qa-complete.ts
 *
 * Pré-requisitos:
 *   - .env.local com NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 *   - Banco de dados acessível via DATABASE_URL
 */

import { PrismaClient, UserRole, AppointmentStatus } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─────────────────────────────────────────────────────────────────
// USUÁRIOS DE TESTE
// ─────────────────────────────────────────────────────────────────

const QA_PASSWORD = 'Senha123!'

const PSYCHOLOGISTS = [
  {
    email: 'ana.silva@teste-qa.com',
    name: 'Ana Silva',
    crp: 'QA/11111',
    bio: 'Especialista em TCC e transtornos de ansiedade. Usuária de teste QA.',
    specialties: ['Terapia Cognitivo-Comportamental', 'Ansiedade', 'Síndrome do Pânico'],
    price: 180.0,
    yearsOfExperience: 10,
    sessionDuration: 50,
    // Plano mensal ativado com 20% de desconto
    monthlyPlanEnabled: true,
    monthlyPlanDiscount: 20,
    monthlyPlanSessions: 4,
  },
  {
    email: 'joao.santos@teste-qa.com',
    name: 'João Santos',
    crp: 'QA/22222',
    bio: 'Foco em psicanálise e autoconhecimento. Usuário de teste QA.',
    specialties: ['Psicanálise', 'Depressão', 'Relacionamentos'],
    price: 150.0,
    yearsOfExperience: 7,
    sessionDuration: 50,
    monthlyPlanEnabled: false,
    monthlyPlanDiscount: 0,
    monthlyPlanSessions: 4,
  },
  {
    email: 'psico.pendente@teste-qa.com',
    name: 'Rodrigo Pendente',
    crp: 'QA/33333',
    bio: 'Psicólogo aguardando aprovação. Usuário para testar fluxo de aprovação admin.',
    specialties: ['Mindfulness'],
    price: 120.0,
    yearsOfExperience: 2,
    sessionDuration: 50,
    monthlyPlanEnabled: false,
    monthlyPlanDiscount: 0,
    monthlyPlanSessions: 4,
    isVerified: false, // PENDENTE — não aparece na busca
  },
]

const PATIENTS = [
  {
    email: 'carlos.oliveira@teste-qa.com',
    name: 'Carlos Oliveira',
    // Tem sessão passada (completed), futura (hoje+2h), e sessão prestes a iniciar (hoje+15min)
  },
  {
    email: 'maria.souza@teste-qa.com',
    name: 'Maria Souza',
    // Tem sessão futura agendada com Ana (amanhã)
  },
  {
    email: 'pedro.ferreira@teste-qa.com',
    name: 'Pedro Ferreira',
    // Sem sessões agendadas (para testar estado vazio)
  },
]

const ADMIN_USER = {
  email: 'admin@test.com',
  name: 'Admin QA',
}

const COMPANY_USER = {
  email: 'empresa@teste-qa.com',
  name: 'Empresa QA LTDA',
  cnpj: '12.345.678/0001-99',
  organizationCode: 'EMPRESA-QA-001',
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

async function ensureAuthUser(email: string, name: string): Promise<string> {
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const existing = list?.users.find((u) => u.email === email)

  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, {
      password: QA_PASSWORD,
      user_metadata: { full_name: name },
    })
    console.log(`  ♻️  Auth user already exists: ${email}`)
    return existing.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: QA_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: name },
  })

  if (error || !data?.user) throw new Error(`Failed to create ${email}: ${error?.message}`)
  console.log(`  ✅ Created auth user: ${email}`)
  return data.user.id
}

async function ensureUser(id: string, email: string, name: string, role: UserRole) {
  return prisma.user.upsert({
    where: { id },
    update: { name, email, role, emailVerified: new Date() },
    create: { id, name, email, role, emailVerified: new Date() },
  })
}

async function ensureProfile(userId: string, name: string, role: UserRole) {
  return prisma.profile.upsert({
    where: { user_id: userId },
    update: { fullName: name, role },
    create: { user_id: userId, fullName: name, role },
  })
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 Iniciando seed QA completo...\n')

  // ── 1. PSICÓLOGOS ──────────────────────────────────────────────
  console.log('👩‍⚕️  Criando psicólogos...')
  const psychData: Array<{
    userId: string
    profileId: string
    psychologistProfileId: string
    name: string
    email: string
  }> = []

  for (const p of PSYCHOLOGISTS) {
    const isVerified = p.isVerified !== false // default true

    const userId = await ensureAuthUser(p.email, p.name)
    await ensureUser(userId, p.email, p.name, UserRole.PSYCHOLOGIST)
    const profile = await ensureProfile(userId, p.name, UserRole.PSYCHOLOGIST)

    const weeklySchedule = {
      sessionDuration: String(p.sessionDuration),
      monday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
      tuesday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
      wednesday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
      thursday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
      friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
      saturday: { enabled: false, slots: [] },
      sunday: { enabled: false, slots: [] },
    }

    const psychProfile = await prisma.psychologistProfile.upsert({
      where: { userId },
      update: {
        crp: p.crp,
        bio: p.bio,
        specialties: p.specialties,
        pricePerSession: p.price,
        isVerified,
        weeklySchedule,
        yearsOfExperience: p.yearsOfExperience,
        sessionDuration: p.sessionDuration,
        monthlyPlanEnabled: p.monthlyPlanEnabled,
        monthlyPlanDiscount: p.monthlyPlanDiscount,
        monthlyPlanSessions: p.monthlyPlanSessions,
      },
      create: {
        userId,
        crp: p.crp,
        bio: p.bio,
        specialties: p.specialties,
        pricePerSession: p.price,
        isVerified,
        weeklySchedule,
        yearsOfExperience: p.yearsOfExperience,
        sessionDuration: p.sessionDuration,
        monthlyPlanEnabled: p.monthlyPlanEnabled,
        monthlyPlanDiscount: p.monthlyPlanDiscount,
        monthlyPlanSessions: p.monthlyPlanSessions,
      },
    })

    psychData.push({
      userId,
      profileId: profile.id,
      psychologistProfileId: psychProfile.id,
      name: p.name,
      email: p.email,
    })
    console.log(`  ✅ Psicólogo: ${p.name} (${isVerified ? 'verificado' : 'PENDENTE'})`)
  }

  const ana = psychData[0] // Ana Silva
  const joao = psychData[1] // João Santos

  // ── 2. PACIENTES ───────────────────────────────────────────────
  console.log('\n👥 Criando pacientes...')
  const patientData: Array<{ userId: string; profileId: string; name: string; email: string }> = []

  for (const p of PATIENTS) {
    const userId = await ensureAuthUser(p.email, p.name)
    await ensureUser(userId, p.email, p.name, UserRole.PATIENT)
    const profile = await ensureProfile(userId, p.name, UserRole.PATIENT)
    patientData.push({ userId, profileId: profile.id, name: p.name, email: p.email })
    console.log(`  ✅ Paciente: ${p.name}`)
  }

  const carlos = patientData[0] // Carlos Oliveira
  const maria = patientData[1] // Maria Souza
  // pedro = patientData[2] — sem consultas agendadas (estado vazio)

  // ── 3. ADMIN ───────────────────────────────────────────────────
  console.log('\n🔑 Criando admin...')
  const adminId = await ensureAuthUser(ADMIN_USER.email, ADMIN_USER.name)
  await ensureUser(adminId, ADMIN_USER.email, ADMIN_USER.name, UserRole.ADMIN)
  await ensureProfile(adminId, ADMIN_USER.name, UserRole.ADMIN)
  console.log(`  ✅ Admin: ${ADMIN_USER.name}`)

  // ── 4. EMPRESA ─────────────────────────────────────────────────
  console.log('\n🏢 Criando empresa...')
  const companyUserId = await ensureAuthUser(COMPANY_USER.email, COMPANY_USER.name)
  await ensureUser(companyUserId, COMPANY_USER.email, COMPANY_USER.name, UserRole.COMPANY)
  await ensureProfile(companyUserId, COMPANY_USER.name, UserRole.COMPANY)

  await prisma.companyProfile.upsert({
    where: { userId: companyUserId },
    update: { name: COMPANY_USER.name, cnpj: COMPANY_USER.cnpj },
    create: {
      userId: companyUserId,
      name: COMPANY_USER.name,
      cnpj: COMPANY_USER.cnpj,
      organizationCode: COMPANY_USER.organizationCode,
      benefitConfig: { maxSessions: 4, coveredPercentage: 80 },
    },
  })
  console.log(`  ✅ Empresa: ${COMPANY_USER.name}`)

  // ── 5. VÍNCULOS PACIENTE-PSICÓLOGO ─────────────────────────────
  console.log('\n🔗 Criando vínculos paciente-psicólogo...')

  // Carlos <-> Ana
  await prisma.patientPsychologistLink.upsert({
    where: {
      patientId_psychologistId: { patientId: carlos.profileId, psychologistId: ana.profileId },
    },
    update: { status: 'active' },
    create: { patientId: carlos.profileId, psychologistId: ana.profileId, status: 'active' },
  })

  // Carlos <-> João
  await prisma.patientPsychologistLink.upsert({
    where: {
      patientId_psychologistId: { patientId: carlos.profileId, psychologistId: joao.profileId },
    },
    update: { status: 'active' },
    create: { patientId: carlos.profileId, psychologistId: joao.profileId, status: 'active' },
  })

  // Maria <-> Ana
  await prisma.patientPsychologistLink.upsert({
    where: {
      patientId_psychologistId: { patientId: maria.profileId, psychologistId: ana.profileId },
    },
    update: { status: 'active' },
    create: { patientId: maria.profileId, psychologistId: ana.profileId, status: 'active' },
  })

  console.log('  ✅ Vínculos criados')

  // ── 6. CONSULTAS ───────────────────────────────────────────────
  console.log('\n📅 Criando consultas...')
  const now = new Date()

  // Sessão passada — Carlos + Ana (ontem, COMPLETED)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  yesterday.setHours(14, 0, 0, 0)
  const apptCompleted = await prisma.appointment.upsert({
    where: { id: 'qa-appt-completed-carlos-ana' },
    update: { status: AppointmentStatus.COMPLETED, scheduledAt: yesterday },
    create: {
      id: 'qa-appt-completed-carlos-ana',
      patientId: carlos.userId,
      psychologistId: ana.psychologistProfileId,
      scheduledAt: yesterday,
      durationMinutes: 50,
      status: AppointmentStatus.COMPLETED,
      price: 180.0,
      sessionType: 'Terapia Individual',
    },
  })
  console.log(`  ✅ Sessão COMPLETED (ontem 14:00): Carlos + Ana — ${apptCompleted.id}`)

  // Sessão futura — Maria + Ana (amanhã, SCHEDULED)
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)
  const apptFutureMaria = await prisma.appointment.upsert({
    where: { id: 'qa-appt-scheduled-maria-ana' },
    update: { status: AppointmentStatus.SCHEDULED, scheduledAt: tomorrow },
    create: {
      id: 'qa-appt-scheduled-maria-ana',
      patientId: maria.userId,
      psychologistId: ana.psychologistProfileId,
      scheduledAt: tomorrow,
      durationMinutes: 50,
      status: AppointmentStatus.SCHEDULED,
      price: 180.0,
      sessionType: 'Terapia Individual',
    },
  })
  console.log(`  ✅ Sessão SCHEDULED (amanhã 10:00): Maria + Ana — ${apptFutureMaria.id}`)

  // Sessão em breve — Carlos + Ana (hoje + 2h, SCHEDULED)
  const inTwoHours = new Date(now)
  inTwoHours.setHours(now.getHours() + 2, 0, 0, 0)
  const apptSoon = await prisma.appointment.upsert({
    where: { id: 'qa-appt-soon-carlos-ana' },
    update: { status: AppointmentStatus.SCHEDULED, scheduledAt: inTwoHours },
    create: {
      id: 'qa-appt-soon-carlos-ana',
      patientId: carlos.userId,
      psychologistId: ana.psychologistProfileId,
      scheduledAt: inTwoHours,
      durationMinutes: 50,
      status: AppointmentStatus.SCHEDULED,
      price: 180.0,
      sessionType: 'Terapia Individual',
    },
  })
  console.log(`  ✅ Sessão SCHEDULED (hoje +2h): Carlos + Ana — ${apptSoon.id}`)

  // Sessão prestes a iniciar — Carlos + João (hoje +15min, SCHEDULED)
  // Serve para testar o botão "Entrar na Sala" que aparece 15 min antes
  const inFifteenMin = new Date(now)
  inFifteenMin.setMinutes(now.getMinutes() + 15, 0, 0)
  const apptIminent = await prisma.appointment.upsert({
    where: { id: 'qa-appt-iminent-carlos-joao' },
    update: { status: AppointmentStatus.SCHEDULED, scheduledAt: inFifteenMin },
    create: {
      id: 'qa-appt-iminent-carlos-joao',
      patientId: carlos.userId,
      psychologistId: joao.psychologistProfileId,
      scheduledAt: inFifteenMin,
      durationMinutes: 50,
      status: AppointmentStatus.SCHEDULED,
      price: 150.0,
      sessionType: 'Terapia Individual',
    },
  })
  console.log(`  ✅ Sessão IMINENTE (+15min): Carlos + João — ${apptIminent.id}`)
  console.log(`     👉 Sala de vídeo: http://localhost:3000/sala/${apptIminent.id}`)

  // Sessão cancelada — Carlos + Ana (3 dias atrás, CANCELED)
  const threeDaysAgo = new Date(now)
  threeDaysAgo.setDate(now.getDate() - 3)
  threeDaysAgo.setHours(15, 0, 0, 0)
  const apptCanceled = await prisma.appointment.upsert({
    where: { id: 'qa-appt-canceled-carlos-ana' },
    update: { status: AppointmentStatus.CANCELED, scheduledAt: threeDaysAgo },
    create: {
      id: 'qa-appt-canceled-carlos-ana',
      patientId: carlos.userId,
      psychologistId: ana.psychologistProfileId,
      scheduledAt: threeDaysAgo,
      durationMinutes: 50,
      status: AppointmentStatus.CANCELED,
      price: 180.0,
      sessionType: 'Terapia Individual',
    },
  })
  console.log(`  ✅ Sessão CANCELED (3 dias atrás): Carlos + Ana — ${apptCanceled.id}`)

  // ── 7. CUPONS (vinculados à Ana Silva) ─────────────────────────
  console.log('\n🏷️  Criando cupons para Ana Silva...')

  const coupons: Array<{
    code: string
    type: string
    value: number
    maxUses: number | null
    used?: number
    active: boolean
    expiresAt: Date | null
    desc: string
  }> = [
    {
      code: 'QA10',
      type: 'percentage',
      value: 10,
      maxUses: null,
      active: true,
      expiresAt: null,
      desc: '10% de desconto — sem limite, sem expiração ✅ VÁLIDO',
    },
    {
      code: 'QA20',
      type: 'percentage',
      value: 20,
      maxUses: 100,
      active: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
      desc: '20% de desconto — limite 100 usos, expira em 30 dias ✅ VÁLIDO',
    },
    {
      code: 'QAFIXO50',
      type: 'fixed',
      value: 50,
      maxUses: null,
      active: true,
      expiresAt: null,
      desc: 'R$50 de desconto fixo — sem limite ✅ VÁLIDO',
    },
    {
      code: 'QAGRATIS',
      type: 'percentage',
      value: 100,
      maxUses: 5,
      active: true,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 dias
      desc: '100% de desconto — cria sessão GRÁTIS ✅ VÁLIDO (cria sem checkout Stripe)',
    },
    {
      code: 'QAEXPIRADO',
      type: 'percentage',
      value: 15,
      maxUses: null,
      active: true,
      expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // ontem
      desc: '15% de desconto — EXPIRADO ❌ Deve rejeitar',
    },
    {
      code: 'QAESGOTADO',
      type: 'percentage',
      value: 20,
      maxUses: 1,
      used: 1,
      active: true,
      expiresAt: null,
      desc: '20% de desconto — ESGOTADO (max_uses=1, used=1) ❌ Deve rejeitar',
    },
    {
      code: 'QAINATIVO',
      type: 'percentage',
      value: 15,
      maxUses: null,
      active: false,
      expiresAt: null,
      desc: '15% de desconto — INATIVO (active=false) ❌ Deve rejeitar',
    },
  ]

  for (const c of coupons) {
    const existing = await prisma.coupon.findFirst({
      where: { psychologistId: ana.psychologistProfileId, code: c.code },
    })

    if (existing) {
      await prisma.coupon.update({
        where: { id: existing.id },
        data: {
          type: c.type,
          value: c.value,
          maxUses: c.maxUses,
          used: c.used ?? 0,
          active: c.active,
          expiresAt: c.expiresAt,
        },
      })
    } else {
      await prisma.coupon.create({
        data: {
          psychologistId: ana.psychologistProfileId,
          code: c.code,
          type: c.type,
          value: c.value,
          maxUses: c.maxUses,
          used: c.used ?? 0,
          active: c.active,
          expiresAt: c.expiresAt,
        },
      })
    }
    console.log(`  ✅ ${c.code} — ${c.desc}`)
  }

  // ── 8. PLANOS (vinculados à Ana Silva) ─────────────────────────
  console.log('\n📦 Criando planos de sessão para Ana Silva...')

  const plans = [
    {
      name: 'Plano Mensal',
      sessions: 4,
      price: 576.0, // R$180 * 4 com 20% desconto = R$576
      discount: 20,
      active: true,
    },
    {
      name: 'Plano Intensivo',
      sessions: 8,
      price: 1008.0, // R$180 * 8 com 30% desconto = R$1.008
      discount: 30,
      active: true,
    },
    {
      name: 'Plano Inativo',
      sessions: 2,
      price: 360.0,
      discount: 0,
      active: false, // Para testar estado de plano desativado
    },
  ]

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({
      where: { psychologistId: ana.psychologistProfileId, name: plan.name },
    })

    if (existing) {
      await prisma.plan.update({ where: { id: existing.id }, data: plan })
    } else {
      await prisma.plan.create({ data: { psychologistId: ana.psychologistProfileId, ...plan } })
    }
    console.log(
      `  ✅ ${plan.name} — ${plan.sessions} sessões, ${plan.discount}% desconto (${plan.active ? 'ativo' : 'INATIVO'})`
    )
  }

  // ── 9. ENTRADAS DO DIÁRIO ──────────────────────────────────────
  console.log('\n📒 Criando entradas do diário de humor para Carlos...')
  const diaryEntries = [
    {
      userId: carlos.userId,
      mood: 7,
      emotions: ['Feliz', 'Grato', 'Calmo'],
      content: 'Tive uma ótima sessão com a Dra. Ana hoje. Sinto que estou progredindo.',
    },
    {
      userId: carlos.userId,
      mood: 4,
      emotions: ['Ansioso', 'Cansado'],
      content: 'Dia difícil no trabalho. Muita pressão. Técnicas de respiração ajudaram.',
    },
    {
      userId: carlos.userId,
      mood: 8,
      emotions: ['Motivado', 'Esperançoso'],
      content: 'Consegui aplicar as técnicas de TCC em uma situação difícil. Orgulhoso.',
    },
  ]

  for (const entry of diaryEntries) {
    await prisma.diaryEntry.create({ data: entry })
  }
  console.log(`  ✅ 3 entradas criadas para Carlos`)

  // ── 10. MENSAGENS ─────────────────────────────────────────────
  console.log('\n💬 Criando conversa entre Ana e Carlos...')
  const existingConvo = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: { userId: { in: [ana.userId, carlos.userId] } },
      },
    },
  })

  if (!existingConvo) {
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId: ana.userId }, { userId: carlos.userId }],
        },
      },
    })

    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderId: ana.userId,
          content: 'Olá Carlos, como você está se sentindo desde nossa última sessão?',
        },
        {
          conversationId: conversation.id,
          senderId: carlos.userId,
          content: 'Olá Dra. Ana! Estou melhor, mas ainda tive um episódio de ansiedade na terça.',
        },
        {
          conversationId: conversation.id,
          senderId: ana.userId,
          content:
            'Entendo. Vamos conversar mais sobre isso na nossa próxima sessão. Lembre das técnicas de respiração.',
        },
        {
          conversationId: conversation.id,
          senderId: carlos.userId,
          content: 'Sim, vou praticar. Obrigado!',
        },
      ],
    })
    console.log(`  ✅ Conversa criada com 4 mensagens`)
  } else {
    console.log(`  ♻️  Conversa já existe`)
  }

  // ── 11. OVERRIDE DE AGENDA (Ana Silva) ─────────────────────────
  console.log('\n📆 Criando overrides de agenda para Ana Silva...')

  // Próximo sábado com horário especial
  const nextSaturday = new Date(now)
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7
  nextSaturday.setDate(now.getDate() + daysUntilSaturday)
  const saturdayStr = nextSaturday.toISOString().split('T')[0]

  await supabase.from('schedule_overrides').upsert(
    {
      psychologist_id: ana.psychologistProfileId,
      date: saturdayStr,
      type: 'custom',
      slots: [{ start: '10:00', end: '14:00' }],
    },
    { onConflict: 'psychologist_id,date' }
  )
  console.log(`  ✅ Sábado ${saturdayStr}: horário especial 10:00-14:00`)

  // Próxima quarta com bloqueio total
  const nextWednesday = new Date(now)
  const daysUntilWednesday = (3 - now.getDay() + 7) % 7 || 7
  nextWednesday.setDate(now.getDate() + daysUntilWednesday)
  const wednesdayStr = nextWednesday.toISOString().split('T')[0]

  await supabase.from('schedule_overrides').upsert(
    {
      psychologist_id: ana.psychologistProfileId,
      date: wednesdayStr,
      type: 'blocked',
      slots: [],
    },
    { onConflict: 'psychologist_id,date' }
  )
  console.log(`  ✅ Quarta ${wednesdayStr}: BLOQUEADA (vermelho no calendário)`)

  // ── RESUMO FINAL ──────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60))
  console.log('✨ SEED QA COMPLETO!')
  console.log('═'.repeat(60))
  console.log('\n📋 CREDENCIAIS DE TESTE (senha: ' + QA_PASSWORD + ')\n')

  console.log('PSICÓLOGOS:')
  console.log('  ana.silva@teste-qa.com        → Ana Silva (R$180, verificada)')
  console.log('  joao.santos@teste-qa.com      → João Santos (R$150, verificado)')
  console.log('  psico.pendente@teste-qa.com   → Rodrigo Pendente (PENDENTE APROVAÇÃO)')
  console.log('\nPACIENTES:')
  console.log('  carlos.oliveira@teste-qa.com  → Carlos Oliveira (tem sessões)')
  console.log('  maria.souza@teste-qa.com      → Maria Souza (tem sessão futura)')
  console.log('  pedro.ferreira@teste-qa.com   → Pedro Ferreira (sem sessões — estado vazio)')
  console.log('\nADMIN:')
  console.log('  admin@teste-qa.com            → Admin QA')
  console.log('\nEMPRESA:')
  console.log('  empresa@teste-qa.com          → Empresa QA LTDA')

  console.log('\n🏷️  CUPONS DA ANA SILVA:')
  console.log('  QA10       → 10% desconto (VÁLIDO)')
  console.log('  QA20       → 20% desconto, expira em 30 dias (VÁLIDO)')
  console.log('  QAFIXO50   → R$50 fixo (VÁLIDO)')
  console.log('  QAGRATIS   → 100% grátis — sem Stripe (VÁLIDO)')
  console.log('  QAEXPIRADO → 15% desconto EXPIRADO (deve dar erro)')
  console.log('  QAESGOTADO → 20% desconto ESGOTADO (deve dar erro)')
  console.log('  QAINATIVO  → 15% desconto INATIVO (deve dar erro)')

  console.log('\n📅 CONSULTAS CRIADAS:')
  console.log('  qa-appt-completed-carlos-ana  → COMPLETED (ontem 14:00) Carlos+Ana')
  console.log('  qa-appt-scheduled-maria-ana   → SCHEDULED (amanhã 10:00) Maria+Ana')
  console.log('  qa-appt-soon-carlos-ana       → SCHEDULED (hoje +2h) Carlos+Ana')
  console.log(`  qa-appt-iminent-carlos-joao   → SCHEDULED (+15min) Carlos+João`)
  console.log(`     🎥 Sala: http://localhost:3000/sala/qa-appt-iminent-carlos-joao`)
  console.log('  qa-appt-canceled-carlos-ana   → CANCELED (3 dias atrás) Carlos+Ana')

  console.log('\n💳 CARTÕES STRIPE PARA TESTE:')
  console.log('  4242 4242 4242 4242  → Pagamento aprovado')
  console.log('  4000 0000 0000 0002  → Cartão recusado')
  console.log('  4000 0025 0000 3155  → Requer autenticação 3DS')
  console.log('  CVC: qualquer 3 dígitos | Validade: qualquer data futura')
  console.log('═'.repeat(60) + '\n')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
