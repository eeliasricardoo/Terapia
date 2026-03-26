'use server'

import { createClient } from '@/lib/supabase/server'
import { registrationSchema } from '@/lib/validations/registration'
import { cleanCPF } from '@/lib/utils/cpf'
import { cleanCRP } from '@/lib/utils/crp'
import { loginSchema } from '@/lib/validations/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sanitizeText, checkRateLimit } from '@/lib/security'
import { headers } from 'next/headers'
import { logger } from '@/lib/utils/logger'

export type ActionResult = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
  data?: any
}

export async function registerPatientSupabase(formData: FormData): Promise<ActionResult> {
  try {
    // Rate limiting by IP
    const ip = headers().get('x-forwarded-for') || 'unknown_ip'
    const rateLimit = await checkRateLimit(`register_${ip}`)
    if (!rateLimit.success) {
      return { success: false, error: 'Muitas tentativas de cadastro. Tente novamente mais tarde.' }
    }

    // Extract data from FormData
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      document: formData.get('document') as string,
      phone: formData.get('phone') as string,
      birthDate: formData.get('birthDate') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      terms: formData.get('terms') === 'true',
    }

    // Validate with Zod
    const validation = registrationSchema.safeParse(rawData)

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {}
      validation.error.errors.forEach((error) => {
        const field = error.path[0] as string
        if (!fieldErrors[field]) {
          fieldErrors[field] = []
        }
        fieldErrors[field].push(error.message)
      })
      return {
        success: false,
        fieldErrors,
      }
    }

    const data = validation.data
    const supabase = await createClient()

    // Anti-XSS nas informações que serão visíveis em perfis/telas
    const safeName = sanitizeText(data.name) || 'Anônimo'
    const cleanedDocument = cleanCPF(data.document)

    // 1. Check if document or email already exists locally (Prisma)
    const { prisma } = await import('@/lib/prisma')

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUserByEmail) {
      return {
        success: false,
        error: 'Este e-mail já está cadastrado no sistema.',
      }
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { document: cleanedDocument },
    })

    if (existingProfile) {
      return {
        success: false,
        error: 'Este CPF já está cadastrado no sistema.',
      }
    }

    let authData: any = null
    let authError: any = null

    // Sign up with Supabase Auth
    const signupResult = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: 'PATIENT',
          full_name: safeName,
          phone: data.phone,
          birth_date: data.birthDate,
          document: cleanedDocument,
        },
      },
    })

    authData = signupResult.data
    authError = signupResult.error

    // Fallback if SMTP fails (Common in Supabase development/free tier)
    if (authError && authError.message.includes('Error sending confirmation email')) {
      logger.info(
        '[AUTH] SMTP failure detected for patient, attempting fallback with Admin Client...'
      )
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = createAdminClient()
        const adminResult = await adminClient.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
          user_metadata: {
            role: 'PATIENT',
            full_name: safeName,
            phone: data.phone,
            birth_date: data.birthDate,
            document: cleanedDocument,
          },
        })

        if (!adminResult.error) {
          authData = adminResult.data
          authError = null
          logger.warn(
            '[AUTH][SECURITY] Patient registered with email_confirm=true because SMTP failed. ' +
              'Email verification was BYPASSED. Ensure SMTP is correctly configured in production.',
            { email: data.email }
          )
        } else {
          authError = adminResult.error
        }
      } catch (err) {
        logger.error('[AUTH] Fallback to Admin Client failed for patient:', err)
      }
    }

    if (authError) {
      return {
        success: false,
        error:
          authError.message === 'User already registered'
            ? 'E-mail já cadastrado. Tente fazer login ou recuperar sua senha.'
            : authError.message,
      }
    }

    // Create profile in database if needed
    if (authData.user) {
      // Sincronizar com a tabela de usuários do Prisma para evitar erros de FK em outras tabelas (Ex: Diario)
      try {
        const { prisma } = await import('@/lib/prisma')
        await prisma.user.upsert({
          where: { id: authData.user.id },
          update: {
            email: data.email,
            name: safeName,
          },
          create: {
            id: authData.user.id,
            email: data.email,
            name: safeName,
            role: 'PATIENT',
          },
        })
      } catch (err) {
        logger.error('Error syncing user to Prisma during registration:', err)
        // Não falhamos o registro se o Prisma falhar, mas logamos
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: authData.user.id,
        full_name: safeName,
        avatar_url: null,
      })

      if (profileError) {
        logger.error('Profile creation error:', profileError)
      }

      // 4. Send Welcome Email via Resend (Parallel, don't block registration)
      const { sendEmail } = await import('@/lib/utils/email')
      sendEmail({
        to: data.email,
        subject: 'Bem-vindo à Terapia! 🌊',
        html: `
          <h1>Olá, ${safeName}!</h1>
          <p>Sua conta na Terapia foi criada com sucesso.</p>
          <p>Estamos muito felizes em ter você conosco em sua jornada de autocuidado.</p>
          <p>Se você precisar de ajuda, estamos à disposição.</p>
          <br/>
          <p>Atenciosamente,</p>
          <p>Equipe Terapia</p>
        `,
      }).catch((e) => console.error('Failed to send welcome email:', e))
    }

    revalidatePath('/')

    return {
      success: true,
    }
  } catch (error: any) {
    logger.error('Registration error:', error)
    return {
      success: false,
      error: error.message || 'Erro ao criar conta. Tente novamente mais tarde.',
    }
  }
}

export async function loginSupabase(formData: FormData): Promise<ActionResult> {
  try {
    // Rate limiting by IP to prevent credential stuffing attacks
    const ip = headers().get('x-forwarded-for') || 'unknown_ip'
    const rateLimit = await checkRateLimit(`login_${ip}`)
    if (!rateLimit.success) {
      return { success: false, error: 'Muitas tentativas de login. Tente novamente mais tarde.' }
    }

    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    // Validate with Zod
    const validation = loginSchema.safeParse(rawData)

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {}
      validation.error.errors.forEach((error) => {
        const field = error.path[0] as string
        if (!fieldErrors[field]) {
          fieldErrors[field] = []
        }
        fieldErrors[field].push(error.message)
      })
      return {
        success: false,
        fieldErrors,
      }
    }

    const { email, password } = validation.data
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: 'Credenciais inválidas. Verifique seu e-mail e senha.',
      }
    }

    revalidatePath('/')

    return {
      success: true,
    }
  } catch (error) {
    logger.error('Login error:', error)
    return {
      success: false,
      error: 'Erro ao fazer login. Tente novamente mais tarde.',
    }
  }
}

export async function signOutSupabase() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/')
  redirect('/login/paciente')
}

export async function registerPsychologistSupabase(formData: FormData): Promise<ActionResult> {
  try {
    const ip = headers().get('x-forwarded-for') || 'unknown_ip'
    const rateLimit = await checkRateLimit(`register_psych_${ip}`)
    if (!rateLimit.success) {
      return {
        success: false,
        error: 'Muitas tentativas de cadastro. Tente novamente mais tarde.',
      }
    }

    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      professionalCard: formData.get('professionalCard') as string,
      terms: formData.get('terms') === 'true',
    }

    const { professionalRegistrationSchema } =
      await import('@/lib/validations/professional-registration')
    const validation = professionalRegistrationSchema.safeParse(rawData)

    if (!validation.success) {
      const fieldErrors: Record<string, string[]> = {}
      validation.error.errors.forEach((error) => {
        const field = error.path[0] as string
        if (!fieldErrors[field]) fieldErrors[field] = []
        fieldErrors[field].push(error.message)
      })
      return { success: false, fieldErrors }
    }

    const data = validation.data
    const supabase = await createClient()

    const safeName = sanitizeText(data.name) || 'Psicólogo'
    const cleanedCRP = cleanCRP(data.professionalCard)

    // 1. Check if CRP or email already exists
    const { prisma } = await import('@/lib/prisma')

    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUserByEmail) {
      return {
        success: false,
        error: 'Este e-mail já está cadastrado no sistema.',
      }
    }

    const existingPsych = await prisma.psychologistProfile.findUnique({
      where: { crp: cleanedCRP },
    })

    if (existingPsych) {
      return {
        success: false,
        error: 'Este CRP já está cadastrado no sistema.',
      }
    }

    let authData: any = null
    let authError: any = null

    // Attempt normal signup first
    const signupResult = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: 'PSYCHOLOGIST',
          full_name: safeName,
        },
      },
    })

    authData = signupResult.data
    authError = signupResult.error

    // Fallback if SMTP fails (Common in Supabase development/free tier)
    if (authError && authError.message.includes('Error sending confirmation email')) {
      logger.info('[AUTH] SMTP failure detected, attempting fallback with Admin Client...')
      try {
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const adminClient = createAdminClient()
        const adminResult = await adminClient.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
          user_metadata: {
            role: 'PSYCHOLOGIST',
            full_name: safeName,
          },
        })

        if (!adminResult.error) {
          authData = adminResult.data
          authError = null
          logger.warn(
            '[AUTH][SECURITY] Psychologist registered with email_confirm=true because SMTP failed. ' +
              'Email verification was BYPASSED. Ensure SMTP is correctly configured in production.',
            { email: data.email }
          )
        } else {
          authError = adminResult.error
        }
      } catch (err) {
        logger.error('[AUTH] Fallback to Admin Client failed:', err)
      }
    }

    if (authError) {
      return {
        success: false,
        error: authError.message.toLowerCase().includes('already registered')
          ? 'E-mail já cadastrado. Tente fazer login.'
          : authError.message,
      }
    }

    if (authData.user) {
      const { prisma } = await import('@/lib/prisma')

      // 1. Sync User to Prisma (CRITICAL for Admin views)
      await prisma.user.upsert({
        where: { id: authData.user.id },
        update: {
          email: data.email,
          name: safeName,
          role: 'PSYCHOLOGIST',
        },
        create: {
          id: authData.user.id,
          email: data.email,
          name: safeName,
          role: 'PSYCHOLOGIST',
        },
      })

      // 2. Initialize profiles entry (handled by trigger but we ensure it's correct)
      await supabase.from('profiles').upsert({
        user_id: authData.user.id,
        full_name: safeName,
        role: 'PSYCHOLOGIST',
        updated_at: new Date().toISOString(),
      })

      // 3. Initialize PsychologistProfile (Enables visibility in Admin)
      await prisma.psychologistProfile.upsert({
        where: { userId: authData.user.id },
        update: {
          crp: cleanedCRP,
        },
        create: {
          userId: authData.user.id,
          crp: cleanedCRP,
          isVerified: false,
        },
      })
    }

    // 4. Send Welcome Email via Resend (Parallel)
    const { sendEmail } = await import('@/lib/utils/email')
    sendEmail({
      to: data.email,
      subject: 'Bem-vindo à Terapia! 🌊',
      html: `
        <h1>Olá, Prof. ${safeName}!</h1>
        <p>Sua conta de profissional na Terapia foi criada com sucesso.</p>
        <p>Agora você pode completar seu perfil e configurar sua agenda para começar a atender.</p>
        <p>Nosso time revisará seus documentos em breve para ativar sua visibilidade na busca.</p>
        <br/>
        <p>Atenciosamente,</p>
        <p>Equipe Terapia</p>
      `,
    }).catch((e) => logger.error('Failed to send psychologist welcome email:', e))

    revalidatePath('/dashboard/admin/aprovacoes')
    return { success: true }
  } catch (error: any) {
    logger.error('Psychologist registration error:', error)
    return {
      success: false,
      error: error.message || 'Erro ao criar conta. Tente novamente mais tarde.',
    }
  }
}
