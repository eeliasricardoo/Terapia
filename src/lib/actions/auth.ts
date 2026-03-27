import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { registrationSchema } from '@/lib/validations/registration'
import { cleanCPF } from '@/lib/utils/cpf'
import { cleanCRP } from '@/lib/utils/crp'
import { loginSchema } from '@/lib/validations/auth'
import { revalidatePath } from 'next/cache'
import {
  sanitizeText,
  checkRateLimit,
  checkLoginRateLimit,
  checkForgotPasswordRateLimit,
  validateCaptcha,
} from '@/lib/security'
import { headers } from 'next/headers'
import { logger } from '@/lib/utils/logger'
import { getStyledEmailTemplate } from '@/lib/utils/email-template'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'
import { env } from '@/lib/env'

/**
 * Public Actions (isPublic: true)
 */

export const registerPatientAction = createSafeAction(
  z.intersection(
    registrationSchema,
    z.object({
      captchaToken: z.string().min(1, 'Token de segurança é obrigatório'),
    })
  ),
  async (data) => {
    // 1. Security checks
    const ip = (await headers()).get('x-forwarded-for') || 'unknown_ip'
    const rateLimit = await checkRateLimit(`register_${ip}`)
    if (!rateLimit.success) {
      throw new Error('Muitas tentativas de cadastro. Tente novamente mais tarde.')
    }

    const isCaptchaValid = await validateCaptcha(data.captchaToken)
    if (!isCaptchaValid) {
      throw new Error('Falha na verificação de robô. Tente novamente.')
    }

    // 2. Data Preparation
    const safeName = sanitizeText(data.name) || 'Anônimo'
    const cleanedDocument = cleanCPF(data.document)

    // 3. Validation against DB
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email: data.email },
    })
    if (existingUserByEmail) throw new Error('Este e-mail já está cadastrado no sistema.')

    const existingProfile = await prisma.profile.findUnique({
      where: { document: cleanedDocument },
    })
    if (existingProfile) throw new Error('Este CPF já está cadastrado no sistema.')

    // 4. Supabase Auth Signup
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
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

    if (authError) {
      if (authError.message.includes('Error sending confirmation email')) {
        throw new Error('Erro ao enviar e-mail de confirmação. Tente novamente mais tarde.')
      }
      throw new Error(
        authError.message === 'User already registered'
          ? 'E-mail já cadastrado. Tente fazer login.'
          : authError.message
      )
    }

    // 5. Prisma Sync
    if (authData.user) {
      await prisma.user.upsert({
        where: { id: authData.user.id },
        update: { email: data.email, name: safeName },
        create: {
          id: authData.user.id,
          email: data.email,
          name: safeName,
          role: 'PATIENT',
        },
      })

      await supabase.from('profiles').insert({
        user_id: authData.user.id,
        full_name: safeName,
        avatar_url: null,
      })

      // 6. Welcome Email
      const { sendEmail } = await import('@/lib/utils/email')
      sendEmail({
        to: data.email,
        subject: 'Bem-vindo à Mind Cares! 🌊',
        html: getStyledEmailTemplate(
          `Olá, ${safeName}!`,
          `
          <p>Sua conta na <strong>Mind Cares</strong> foi criada com sucesso.</p>
          <p>Estamos muito felizes em ter você conosco em sua jornada de autocuidado.</p>
          <div style="text-align: center;">
            <a href="${env.NEXT_PUBLIC_APP_URL}/login/paciente" class="button" style="color: #ffffff;">Entrar na Plataforma</a>
          </div>
          <br/>
          <p>Atenciosamente,</p>
          <p>Equipe Mind Cares</p>
          `
        ),
      }).catch((e) => logger.error('Failed to send welcome email:', e))
    }

    revalidatePath('/')
    return { success: true }
  },
  { isPublic: true }
)

export const loginAction = createSafeAction(
  loginSchema,
  async (data) => {
    const ip = (await headers()).get('x-forwarded-for') || 'unknown_ip'
    const rateLimit = await checkLoginRateLimit(ip, data.email)
    if (!rateLimit.success) {
      throw new Error('Muitas tentativas de login. Tente novamente mais tarde.')
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.')
    }

    revalidatePath('/')
    return { success: true }
  },
  { isPublic: true }
)

export const registerPsychologistAction = createSafeAction(
  z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    professionalCard: z.string().min(5),
    captchaToken: z.string().min(1),
  }),
  async (data) => {
    const ip = (await headers()).get('x-forwarded-for') || 'unknown_ip'
    const rateLimit = await checkRateLimit(`register_psych_${ip}`)
    if (!rateLimit.success) throw new Error('Muitas tentativas de cadastro.')

    const isCaptchaValid = await validateCaptcha(data.captchaToken)
    if (!isCaptchaValid) throw new Error('Falha na verificação de robô.')

    const safeName = sanitizeText(data.name) || 'Psicólogo'
    const cleanedCRP = cleanCRP(data.professionalCard)

    const existingUser = await prisma.user.findUnique({ where: { email: data.email } })
    if (existingUser) throw new Error('Este e-mail já está cadastrado.')

    const existingPsych = await prisma.psychologistProfile.findUnique({
      where: { crp: cleanedCRP },
    })
    if (existingPsych) throw new Error('Este CRP já está cadastrado.')

    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { role: 'PSYCHOLOGIST', full_name: safeName },
      },
    })

    if (authError) throw new Error(authError.message)

    if (authData.user) {
      await prisma.user.upsert({
        where: { id: authData.user.id },
        update: { email: data.email, name: safeName, role: 'PSYCHOLOGIST' },
        create: {
          id: authData.user.id,
          email: data.email,
          name: safeName,
          role: 'PSYCHOLOGIST',
        },
      })

      await supabase.from('profiles').upsert({
        user_id: authData.user.id,
        full_name: safeName,
        role: 'PSYCHOLOGIST',
        updated_at: new Date().toISOString(),
      })

      await prisma.psychologistProfile.upsert({
        where: { userId: authData.user.id },
        update: { crp: cleanedCRP },
        create: {
          userId: authData.user.id,
          crp: cleanedCRP,
          isVerified: false,
        },
      })

      // Welcome Email
      const { sendEmail } = await import('@/lib/utils/email')
      sendEmail({
        to: data.email,
        subject: 'Bem-vindo à Mind Cares! 🌊',
        html: getStyledEmailTemplate(
          `Olá, Prof. ${safeName}!`,
          `
          <p>Sua conta de profissional na <strong>Mind Cares</strong> foi criada com sucesso.</p>
          <p>Nosso time revisará seus documentos em breve para ativar sua visibilidade.</p>
          <div style="text-align: center;">
            <a href="${env.NEXT_PUBLIC_APP_URL}/login/psicologo" class="button" style="color: #ffffff;">Configurar meu Perfil</a>
          </div>
          <br/>
          <p>Equipe Mind Cares</p>
          `
        ),
      }).catch((e) => logger.error('Failed to send psychologist welcome email:', e))
    }

    revalidatePath('/dashboard/admin/aprovacoes')
    return { success: true }
  },
  { isPublic: true }
)

export const recoverPasswordAction = createSafeAction(
  z.object({ email: z.string().email() }),
  async (data) => {
    const ip = (await headers()).get('x-forwarded-for') || 'unknown_ip'
    const rateLimit = await checkForgotPasswordRateLimit(ip)
    if (!rateLimit.success) throw new Error('Muitas tentativas. Aguarde.')

    const supabase = await createClient()
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    return { success: true } // Always return success for security
  },
  { isPublic: true }
)

/**
 * Authenticated Actions
 */

export const signOutAction = createSafeAction(z.void().optional(), async () => {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/')
  return { success: true }
})

export const updatePasswordAction = createSafeAction(
  z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(6),
  }),
  async (data, user) => {
    const supabase = await createClient()

    // Re-verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: data.currentPassword,
    })

    if (signInError) throw new Error('Senha atual incorreta.')

    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword,
    })

    if (updateError) throw new Error(updateError.message)

    return { success: true }
  }
)
