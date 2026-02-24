'use server'

import { createClient } from '@/lib/supabase/server'
import { registrationSchema } from '@/lib/validations/registration'
import { loginSchema } from '@/lib/validations/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sanitizeText, checkRateLimit } from '@/lib/security'
import { headers } from 'next/headers'

export type ActionResult = {
    success: boolean
    error?: string
    fieldErrors?: Record<string, string[]>
}

export async function registerPatientSupabase(
    formData: FormData
): Promise<ActionResult> {
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

        // Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    role: 'PATIENT',
                    full_name: safeName,
                    phone: data.phone,
                    birth_date: data.birthDate,
                    document: data.document,
                },
            },
        })

        if (authError) {
            return {
                success: false,
                error: authError.message === 'User already registered'
                    ? 'E-mail já cadastrado. Tente fazer login ou recuperar sua senha.'
                    : 'Erro ao criar conta. Tente novamente mais tarde.',
            }
        }

        // Create profile in database if needed
        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    user_id: authData.user.id,
                    full_name: safeName,
                    avatar_url: null,
                })

            if (profileError) {
                console.error('Profile creation error:', profileError)
            }
        }

        revalidatePath('/')

        return {
            success: true,
        }
    } catch (error) {
        console.error('Registration error:', error)
        return {
            success: false,
            error: 'Erro ao criar conta. Tente novamente mais tarde.',
        }
    }
}

export async function loginSupabase(
    formData: FormData
): Promise<ActionResult> {
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
        console.error('Login error:', error)
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
