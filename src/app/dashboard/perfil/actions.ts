'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { checkRateLimit } from '@/lib/security'
import { headers } from 'next/headers'

export async function uploadProfileImage(formData: FormData) {
    const supabase = await createClient()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: 'Usuário não autenticado' }
    }

    // Rate limiting
    const ip = headers().get('x-forwarded-for') || 'unknown_ip'
    const rateLimit = await checkRateLimit(`upload_${ip}`)
    if (!rateLimit.success) {
        return { error: 'Muitos uploads enviados. Tente novamente mais tarde.' }
    }

    // 2. Get file from form data
    const file = formData.get('file') as File
    if (!file) {
        return { error: 'Nenhum arquivo enviado' }
    }

    // Security: Strict MIME type checking
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
        return { error: 'Tipo de arquivo inválido. Use JPG, PNG ou WEBP.' }
    }

    if (file.size > 5 * 1024 * 1024) {
        return { error: 'O arquivo deve ter no máximo 5MB' }
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { error: 'Configuração de servidor incompleta: Service Role Key ausente' }
    }

    try {
        const adminSupabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        )

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const { error: uploadError } = await adminSupabase.storage
            .from('avatars')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) {
            console.error('Upload Error:', uploadError)
            return { error: `Erro no upload: ${uploadError.message}` }
        }

        const { data: { publicUrl } } = adminSupabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        // Try to update specifically first to check existence
        const { error: updateError, data: updateData } = await adminSupabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('user_id', user.id)
            .select()

        // If no row updated, try to insert/upsert
        if (updateError || !updateData || updateData.length === 0) {
            console.log("Profile not found or update failed, attempting upsert...")

            const { error: upsertError } = await adminSupabase
                .from('profiles')
                .upsert({
                    id: user.id, // Enforce 1:1 mapping for simplicity if missing
                    user_id: user.id,
                    full_name: user.user_metadata?.full_name || 'Usuário',
                    role: (user.user_metadata?.role as any) || 'PATIENT',
                    avatar_url: publicUrl,
                    updated_at: new Date().toISOString(),
                    // created_at is automatic usually but safe to send
                }, { onConflict: 'user_id' })

            if (upsertError) {
                console.error('Upsert Error:', upsertError)
                return { error: `Erro ao criar perfil: ${upsertError.message}` }
            }
        }

        revalidatePath('/dashboard/perfil')
        return { success: true, publicUrl }

    } catch (error: any) {
        console.error('Unexpected Error:', error)
        return { error: `Erro inesperado: ${error.message || error}` }
    }
}
