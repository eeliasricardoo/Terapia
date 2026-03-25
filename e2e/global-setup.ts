import { chromium, FullConfig } from '@playwright/test'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import path from 'path'

export const PATIENT_AUTH_FILE = path.join(__dirname, 'fixtures/patient-auth.json')
export const PSYCHOLOGIST_AUTH_FILE = path.join(__dirname, 'fixtures/psychologist-auth.json')

async function ensureTestUsers() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('⚠️  Supabase admin keys not found — skipping user creation')
    return
  }

  const prisma = new PrismaClient()

  const psychologistEmail = process.env.TEST_PSYCHOLOGIST_EMAIL!
  const psychologistPassword = process.env.TEST_PSYCHOLOGIST_PASSWORD!
  const patientEmail = process.env.TEST_PATIENT_EMAIL!
  const patientPassword = process.env.TEST_PATIENT_PASSWORD!

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    // ─── Psychologist ─────────────────────────────────────────────────────
    const psychId = await ensureAuthUser(
      supabase,
      psychologistEmail,
      psychologistPassword,
      'Psicólogo Teste'
    )
    await ensureProfile(prisma, psychId, psychologistEmail, 'Psicólogo Teste', 'PSYCHOLOGIST')
    await ensurePsychologistProfile(prisma, psychId)

    // ─── Patient ──────────────────────────────────────────────────────────
    const patientId = await ensureAuthUser(
      supabase,
      patientEmail,
      patientPassword,
      'Paciente Teste'
    )
    await ensureProfile(prisma, patientId, patientEmail, 'Paciente Teste', 'PATIENT')
  } finally {
    await prisma.$disconnect()
  }
}

async function ensureAuthUser(
  supabase: SupabaseClient<any, any, any>,
  email: string,
  password: string,
  name: string
): Promise<string> {
  const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const existing = listData?.users.find((u) => u.email === email)

  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, { password, user_metadata: { name } })
    console.log(`✅ Auth user exists: ${email}`)
    return existing.id
  }

  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })
  if (error || !created?.user) throw new Error(`Failed to create user ${email}: ${error?.message}`)
  console.log(`✅ Created auth user: ${email}`)
  return created.user.id
}

async function ensureProfile(
  prisma: PrismaClient,
  userId: string,
  email: string,
  name: string,
  role: 'PSYCHOLOGIST' | 'PATIENT'
) {
  // Upsert the User record
  await prisma.user.upsert({
    where: { id: userId },
    update: { role, name, email, emailVerified: new Date() },
    create: { id: userId, role, name, email, emailVerified: new Date() },
  })

  // Upsert the Profile record
  await prisma.profile.upsert({
    where: { user_id: userId },
    update: { role, fullName: name },
    create: { user_id: userId, role, fullName: name },
  })
  console.log(`✅ Profile set to ${role}: ${email}`)
}

async function ensurePsychologistProfile(prisma: PrismaClient, userId: string) {
  await prisma.psychologistProfile.upsert({
    where: { userId },
    update: {},
    create: { userId },
  })
  console.log(`✅ PsychologistProfile ensured for: ${userId}`)
}

async function loginAndSave(
  baseURL: string,
  loginPath: string,
  email: string,
  password: string,
  storageFile: string
) {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto(`${baseURL}${loginPath}`)
  await page.waitForLoadState('domcontentloaded')

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Senha').fill(password)
  await page
    .getByRole('button', { name: /entrar/i })
    .last()
    .click()

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 20000 })

  await context.storageState({ path: storageFile })
  await browser.close()
  console.log(`✅ Auth saved: ${storageFile}`)
}

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000'

  const patientEmail = process.env.TEST_PATIENT_EMAIL
  const patientPassword = process.env.TEST_PATIENT_PASSWORD
  const psychologistEmail = process.env.TEST_PSYCHOLOGIST_EMAIL
  const psychologistPassword = process.env.TEST_PSYCHOLOGIST_PASSWORD

  if (!patientEmail || !patientPassword || !psychologistEmail || !psychologistPassword) {
    throw new Error(
      'Missing test credentials. Set TEST_PATIENT_EMAIL, TEST_PATIENT_PASSWORD, TEST_PSYCHOLOGIST_EMAIL, TEST_PSYCHOLOGIST_PASSWORD in .env.local'
    )
  }

  // Ensure test users exist in DB with correct roles
  await ensureTestUsers()

  // Log in as both users and save session cookies
  await Promise.all([
    loginAndSave(baseURL, '/login/paciente', patientEmail, patientPassword, PATIENT_AUTH_FILE),
    loginAndSave(
      baseURL,
      '/login/profissional',
      psychologistEmail,
      psychologistPassword,
      PSYCHOLOGIST_AUTH_FILE
    ),
  ])
}

export default globalSetup
