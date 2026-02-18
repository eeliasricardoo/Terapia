
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    },
    global: {
        headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`
        }
    }
})

async function main() {
    const email = 'psicologo@test.com'
    console.log(`🔍 Looking for user: ${email}`)

    // 1. Get user from Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
        console.error('❌ Error listing users:', listError)
        return
    }

    const user = users.find(u => u.email === email)

    if (!user) {
        console.error('❌ User not found in Auth')
        return
    }

    console.log(`✅ Found user: ${user.id}`)

    // 2. Update Auth Metadata
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { user_metadata: { ...user.user_metadata, role: 'PSYCHOLOGIST' } }
    )

    if (updateError) {
        console.error('❌ Error updating auth metadata:', updateError)
    } else {
        console.log('✅ Updated Auth metadata role to PSYCHOLOGIST')
    }

    // 3. Update/Create Profile
    const { data: profile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (profile) {
        // Update existing
        const { error: updateProfileError } = await supabase
            .from('profiles')
            .update({ role: 'PSYCHOLOGIST' })
            .eq('user_id', user.id)

        if (updateProfileError) {
            console.error('❌ Error updating profile:', updateProfileError)
        } else {
            console.log('✅ Updated existing profile role to PSYCHOLOGIST')
        }
    } else {
        // Create new
        const { error: insertProfileError } = await supabase
            .from('profiles')
            .insert({
                id: user.id, // Assuming id matches user_id for simplicity or auto-gen? Schema says id is uuid. Often id=user_id in these designs.
                user_id: user.id,
                full_name: user.user_metadata?.full_name || 'Psicólogo Teste',
                role: 'PSYCHOLOGIST',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        if (insertProfileError) {
            console.error('❌ Error creating profile:', insertProfileError)
        } else {
            console.log('✅ Created new profile with role PSYCHOLOGIST')
        }
    }

    // 4. Update/Create Psychologist Profile
    // Check if it exists with 'user_id' column or 'userId' column?
    // In create-psychologists.js it uses 'userId'. In types.ts it says 'userId'.
    // Let's check types.ts again.
    // psychologist_profiles: { Row: { userId: string ... } }

    const { data: psychProfile, error: psychCheckError } = await supabase
        .from('psychologist_profiles')
        .select('*')
        .eq('userId', user.id)
        .single()

    if (!psychProfile) {
        const { error: insertPsychError } = await supabase
            .from('psychologist_profiles')
            .insert({
                id: user.id, // Explicit ID or auto-gen? Schema says id is string.
                userId: user.id,
                crp: '00/00000',
                bio: 'Psicólogo de teste',
                price_per_session: 150,
                is_verified: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })

        if (insertPsychError) {
            // Try without ID if it's auto-generated
            const { error: insertPsychError2 } = await supabase
                .from('psychologist_profiles')
                .insert({
                    userId: user.id,
                    crp: '00/00000',
                    bio: 'Psicólogo de teste',
                    price_per_session: 150,
                    is_verified: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
            if (insertPsychError2) {
                console.error('❌ Error creating psychologist profile:', insertPsychError2)
            } else {
                console.log('✅ Created default psychologist profile')
            }
        } else {
            console.log('✅ Created default psychologist profile')
        }
    } else {
        console.log('✅ Psychologist profile already exists')
    }
}

main()
