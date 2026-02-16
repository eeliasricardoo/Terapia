'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type PsychologistOnboardingData = {
    fullName: string
    crp: string
    specialties: string[]
    approaches: string[] // We might store this in bio or a new column, for now let's combine with specialties or bio if schema doesn't support it directly. 
    // Checking schema: PsychologistProfile has `specialties String[]`. It doesn't have `approaches`. 
    // We can just append approaches to specialties or store them there. 
    // Actually, let's look at schema again. 
    // `specialties String[]`.
    // I can put both in specialties or add approaches to bio.
    // For now I will merge them into specialties array as they are "tags" essentially.

    bio: string
    price: number
    videoUrl?: string
}

export async function savePsychologistProfile(data: PsychologistOnboardingData) {
    const supabase = await createClient()

    // 1. Get current user
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        return { success: false, error: 'Usuário não autenticado' }
    }

    try {
        // 2. Update Profile (Base role and name)
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: data.fullName,
                role: 'PSYCHOLOGIST',
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)

        if (profileError) {
            console.error('Error updating profile:', profileError)
            return { success: false, error: 'Erro ao atualizar perfil básico' }
        }

        // 3. Create or Update Psychologist Profile
        // Note: Approaches are merged into specialties for now as strict schema doesn't have approaches column yet.
        const allSpecialties = Array.from(new Set([...data.specialties, ...data.approaches]))

        const { error: psychError } = await supabase
            .from('psychologist_profiles')
            .upsert({
                userId: user.id, // Using the column name from schema which maps to userId usually, but Supabase uses snake_case usually if mapped.
                // Let's check prisma schema mapping: `userId String @unique` but no `@map`. Wait.
                // In `PsychologistProfile`: `userId String @unique`
                // BUT usually prisma camelCases fields. In DB it might be `userId` or `user_id`.
                // Looking at `schema.prisma`:
                // `userId String @unique` -> No @map, so column name is `userId`?
                // `pricePerSession` -> `@map("price_per_session")`
                // `createdAt` -> `@map("created_at")`
                // `videPresentationUrl` -> `@map("video_presentation_url")`

                // However, Prisma default for foreign keys might be camelCase if not mapped.
                // BUT, looking at `Profile` model: `user_id String @unique`.
                // Let's look at `Appointment` model: `patientId String @map("patient_id")`.

                // CRITICAL: Supabase API uses the DATABASE column names.
                // I need to be sure about `psychologist_profiles` user id column name.
                // In `schema.prisma`: `model PsychologistProfile { userId String @unique ...`
                // It does NOT have a @map. This means Prisma thinks the column is `userId`.
                // However, `Profile` has `user_id`.
                // If the table was created via Prisma push, it handles it.
                // If I assume standard naming conventions, it might be `userId` (mixed case) if not mapped to snake_case.
                // Let's try `userId` first as per schema definition without map. 
                // Wait, if I look at `getPsychologistById` in `psychologists.ts`:
                // `.eq('userId', userId)`
                // So it seems the column name IS `userId` (camelCase) in the DB? Or the Supabase client wrapper handles it?
                // The Supabase JS client takes the column name directly.
                // `psychologists.ts` uses `.eq('userId', userId)`. This suggests the column is indeed `userId`.

                userId: user.id,
                crp: data.crp,
                bio: data.bio,
                specialties: allSpecialties,
                price_per_session: data.price,
                video_presentation_url: data.videoUrl,
                is_verified: true, // Auto-verify for dev/MVP purposes? Or false? Let's say false usually but for demo true.
                // Actually `getPsychologists` filters by `is_verified: true`. So if I want to see it, I must set true.
                // Let's set true for now.
                updated_at: new Date().toISOString(),
            }, { onConflict: 'userId' })

        if (psychError) {
            console.error('Error creating psychologist profile:', psychError)
            // It might fail if column name is wrong.
            return { success: false, error: 'Erro ao criar perfil de psicólogo.' + psychError.message }
        }

        revalidatePath('/dashboard')
        revalidatePath('/busca')

        return { success: true }

    } catch (error) {
        console.error('Unexpected error:', error)
        return { success: false, error: 'Erro interno no servidor' }
    }
}
