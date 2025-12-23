#!/usr/bin/env node

/**
 * Script to create sample psychologist users in Supabase
 * Uses Supabase Admin API to create auth users and profiles
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

const psychologists = [
    {
        email: 'ana.rojas@terapia.com',
        password: 'Senha123!',
        full_name: 'Dra. Ana María Rojas',
        crp: 'CRP 06/123456',
        bio: 'Psicóloga clínica com mais de 10 anos de experiência em Terapia Cognitivo-Comportamental (TCC). Especializada no tratamento de ansiedade, depressão e transtornos de humor.',
        specialties: ['Ansiedade', 'TCC', 'Depressão', 'Transtornos de Humor'],
        price: 150.00
    },
    {
        email: 'carlos.fuentes@terapia.com',
        password: 'Senha123!',
        full_name: 'Dr. Carlos Fuentes',
        crp: 'CRP 06/234567',
        bio: 'Especialista em terapia de casal e relacionamentos. Trabalho com casais e indivíduos para melhorar a comunicação, resolver conflitos e fortalecer vínculos.',
        specialties: ['Relacionamentos', 'Comunicação', 'Terapia de Casal', 'Conflitos'],
        price: 180.00
    },
    {
        email: 'sofia.vergara@terapia.com',
        password: 'Senha123!',
        full_name: 'Dra. Sofia Vergara',
        crp: 'CRP 06/345678',
        bio: 'Psicóloga infantil com formação em psicologia do desenvolvimento. Trabalho com crianças e adolescentes, auxiliando famílias a navegarem desafios emocionais e comportamentais.',
        specialties: ['Crianças', 'Família', 'Adolescentes', 'Desenvolvimento'],
        price: 160.00
    },
    {
        email: 'isabella.gomez@terapia.com',
        password: 'Senha123!',
        full_name: 'Dra. Isabella Gómez',
        crp: 'CRP 06/456789',
        bio: 'Especialista em depressão e práticas de mindfulness. Combino abordagens tradicionais de psicoterapia com técnicas de atenção plena para promover bem-estar emocional.',
        specialties: ['Depressão', 'Mindfulness', 'Autoconhecimento', 'Bem-estar'],
        price: 140.00
    },
    {
        email: 'juan.perez@terapia.com',
        password: 'Senha123!',
        full_name: 'Dr. Juan David Pérez',
        crp: 'CRP 06/567890',
        bio: 'Terapeuta humanista focado em autoestima e crescimento pessoal. Minha abordagem é centrada na pessoa, criando um espaço seguro para exploração e desenvolvimento do potencial humano.',
        specialties: ['Autoestima', 'Crescimento', 'Humanista', 'Propósito'],
        price: 170.00
    },
    {
        email: 'valentina.ortiz@terapia.com',
        password: 'Senha123!',
        full_name: 'Dra. Valentina Ortiz',
        crp: 'CRP 06/678901',
        bio: 'Neuropsicóloga especializada em avaliação cognitiva e TDAH. Realizo avaliações neuropsicológicas completas e ofereço suporte terapêutico para pessoas com dificuldades de atenção.',
        specialties: ['Avaliação', 'TDAH', 'Neuropsicologia', 'Cognição'],
        price: 200.00
    }
]

async function createPsychologist(psychologist) {
    try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: psychologist.email,
            password: psychologist.password,
            email_confirm: true,
            user_metadata: {
                full_name: psychologist.full_name
            }
        })

        if (authError) {
            console.error(`❌ Error creating user ${psychologist.email}:`, authError.message)
            return false
        }

        const userId = authData.user.id
        console.log(`✅ Created auth user: ${psychologist.email} (${userId})`)

        // Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                userId: userId,
                full_name: psychologist.full_name,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        if (profileError) {
            console.error(`❌ Error creating profile for ${psychologist.email}:`, profileError.message)
            return false
        }

        console.log(`✅ Created profile for ${psychologist.full_name}`)

        // Create psychologist profile
        const { error: psychProfileError } = await supabase
            .from('psychologist_profiles')
            .insert({
                userId: userId,
                crp: psychologist.crp,
                bio: psychologist.bio,
                specialties: psychologist.specialties,
                price_per_session: psychologist.price,
                is_verified: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        if (psychProfileError) {
            console.error(`❌ Error creating psychologist profile for ${psychologist.email}:`, psychProfileError.message)
            return false
        }

        console.log(`✅ Created psychologist profile for ${psychologist.full_name}`)
        console.log('')
        return true

    } catch (error) {
        console.error(`❌ Unexpected error for ${psychologist.email}:`, error)
        return false
    }
}

async function main() {
    console.log('🚀 Creating sample psychologist users...\n')

    let successCount = 0
    let failCount = 0

    for (const psychologist of psychologists) {
        const success = await createPsychologist(psychologist)
        if (success) {
            successCount++
        } else {
            failCount++
        }
    }

    console.log('📊 Summary:')
    console.log(`✅ Successfully created: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log('')
    console.log('🎉 Done! You can now access /busca to see the psychologists.')
}

main().catch(console.error)
