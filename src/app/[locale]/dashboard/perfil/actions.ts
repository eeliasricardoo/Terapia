'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { checkRateLimit } from '@/lib/security'
import { headers } from 'next/headers'
import { logger } from '@/lib/utils/logger'

export async function uploadProfileImage(formData: FormData) {
  const supabase = await createClient()

  // 1. Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Usuário não autenticado' }
  }

  // Rate limiting
  const ip = (await headers()).get('x-forwarded-for') || 'unknown_ip'
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
          persistSession: false,
        },
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
        upsert: true,
      })

    if (uploadError) {
      logger.error('Upload Error:', uploadError)
      return { error: `Erro no upload: ${uploadError.message}` }
    }

    const {
      data: { publicUrl },
    } = adminSupabase.storage.from('avatars').getPublicUrl(filePath)

    // Try to update specifically first to check existence
    const { error: updateError, data: updateData } = await adminSupabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('user_id', user.id)
      .select()

    // If no row updated, try to insert/upsert
    if (updateError || !updateData || updateData.length === 0) {
      logger.info('Profile not found or update failed, attempting upsert...')

      const { error: upsertError } = await adminSupabase.from('profiles').upsert(
        {
          id: user.id, // Enforce 1:1 mapping for simplicity if missing
          user_id: user.id,
          full_name: user.user_metadata?.full_name || 'Usuário',
          role: (user.user_metadata?.role as string) || 'PATIENT',
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
          // created_at is automatic usually but safe to send
        },
        { onConflict: 'user_id' }
      )

      if (upsertError) {
        logger.error('Upsert Error:', upsertError)
        return { error: `Erro ao criar perfil: ${upsertError.message}` }
      }
    }

    // 5. Synchronize Auth User Metadata (important for Header/Sidebar components using useAuth)
    await adminSupabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, avatar_url: publicUrl },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/perfil')
    return { success: true, publicUrl }
  } catch (error: unknown) {
    logger.error('Unexpected Error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return { error: `Erro inesperado: ${msg}` }
  }
}

export async function updateUserProfile(data: {
  name: string
  phone: string
  birth_date?: string | null
  document?: string | null
  gender?: string | null
  profession?: string | null
  address_line?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
}) {
  const supabase = await createClient()

  // 1. Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Usuário não autenticado' }
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
          persistSession: false,
        },
      }
    )

    // 1. Update public profiles table
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({
        full_name: data.name,
        phone: data.phone,
        birth_date: data.birth_date,
        document: data.document,
        gender: data.gender,
        profession: data.profession,
        address_line: data.address_line,
        city: data.city,
        state: data.state,
        zip_code: data.zip_code,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (updateError) {
      logger.error('Update Error:', updateError)
      return { error: `Erro ao atualizar perfil: ${updateError.message}` }
    }

    // 2. Synchronize Auth User Metadata (important for Header/Sidebar components using useAuth)
    const { error: metaError } = await adminSupabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, full_name: data.name },
    })

    if (metaError) {
      logger.error('Metadata Update Error:', metaError)
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/perfil')
    return { success: true }
  } catch (error: unknown) {
    logger.error('Unexpected Error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return { error: `Erro inesperado: ${msg}` }
  }
}
