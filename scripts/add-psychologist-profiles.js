#!/usr/bin/env node

/**
 * Script to add psychologist profiles to existing users
 * Run this after users have been created
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const psychologistData = [
    {
        email: 'ana.rojas@terapia.com',
        crp: 'CRP 06/123456',
        bio: 'Psicóloga clínica com mais de 10 anos de experiência em Terapia Cognitivo-Comportamental (TCC).',
        specialties: ['Ansiedade', 'TCC', 'Depressão', 'Transtornos de Humor'],
        price: 150.00
    },
    {
        email: 'carlos.fuentes@terapia.com',
        crp: 'CRP 06/234567',
        bio: 'Especialista em terapia de casal e relacionamentos.',
        specialties: ['Relacionamentos', 'Comunicação', 'Terapia de Casal', 'Conflitos'],
        price: 180.00
    },
    {
        email: 'sofia.vergara@terapia.com',
        crp: 'CRP 06/345678',
        bio: 'Psicóloga infantil com formação em psicologia do desenvolvimento.',
        specialties: ['Crianças', 'Família', 'Adolescentes', 'Desenvolvimento'],
        price: 160.00
    },
    {
        email: 'isabella.gomez@terapia.com',
        crp: 'CRP 06/456789',
        bio: 'Especialista em depressão e práticas de mindfulness.',
        specialties: ['Depressão', 'Mindfulness', 'Autoconhecimento', 'Bem-estar'],
        price: 140.00
    },
    {
        email: 'juan.perez@terapia.com',
        crp: 'CRP 06/567890',
        bio: 'Terapeuta humanista focado em autoestima e crescimento pessoal.',
        specialties: ['Autoestima', 'Crescimento', 'Humanista', 'Propósito'],
        price: 170.00
    },
    {
        email: 'valentina.ortiz@terapia.com',
        crp: 'CRP 06/678901',
        bio: 'Neuropsicóloga especializada em avaliação cognitiva e TDAH.',
        specialties: ['Avaliação', 'TDAH', 'Neuropsicologia', 'Cognição'],
        price: 200.00
    }
]

async function addPsychologistProfile(data) {
    try {
        // Get user by email
        const { data: { users }, error: userError } = await supabase.auth.admin.listUsers()

        if (userError) {
            console.error(`❌ Error listing users:`, userError.message)
            return false
        }

        const user = users.find(u => u.email === data.email)

        if (!user) {
            console.error(`❌ User not found: ${data.email}`)
            return false
        }

        const userId = user.id

        // Check if psychologist profile already exists
        const { data: existing } = await supabase
            .from('psychologist_profiles')
            .select('userId')
            .eq('userId', userId)
            .single()

        if (existing) {
            console.log(`⚠️  Psychologist profile already exists for ${data.email}`)
            return true
        }

        // Create psychologist profile
        const { error: psychProfileError } = await supabase
            .from('psychologist_profiles')
            .insert({
                id: crypto.randomUUID(),  // Generate UUID for id
                userId: userId,
                crp: data.crp,
                bio: data.bio,
                specialties: data.specialties,
                price_per_session: data.price,
                is_verified: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        if (psychProfileError) {
            console.error(`❌ Error creating psychologist profile for ${data.email}:`, psychProfileError.message)
            return false
        }

        console.log(`✅ Created psychologist profile for ${data.email}`)
        return true

    } catch (error) {
        console.error(`❌ Unexpected error for ${data.email}:`, error)
        return false
    }
}

async function main() {
    console.log('🚀 Adding psychologist profiles...\n')

    let successCount = 0
    let failCount = 0

    for (const data of psychologistData) {
        const success = await addPsychologistProfile(data)
        if (success) {
            successCount++
        } else {
            failCount++
        }
    }

    console.log('\n📊 Summary:')
    console.log(`✅ Successfully created: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log('\n🎉 Done! Access /busca to see the psychologists.')
}

main().catch(console.error)
