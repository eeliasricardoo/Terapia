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

const testUser = {
    email: 'teste@terapia.com',
    password: 'Password123!',
    full_name: 'Usuario Teste'
}

async function createTestUser() {
    try {
        console.log(`Checking user ${testUser.email}...`)

        // List users to find if exists
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) {
            console.error('Error listing users:', listError)
            return
        }

        const existingUser = users?.find(u => u.email === testUser.email)
        let userId

        if (existingUser) {
            console.log('User already exists, updating password...')
            userId = existingUser.id
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                userId,
                { password: testUser.password, user_metadata: { full_name: testUser.full_name }, email_confirm: true }
            )
            if (updateError) {
                console.error('Error updating user:', updateError)
                return
            }
            console.log(`✅ User updated: ${userId}`)
        } else {
            // Create auth user
            console.log('Creating new user...')
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: testUser.email,
                password: testUser.password,
                email_confirm: true,
                user_metadata: {
                    full_name: testUser.full_name
                }
            })

            if (authError) {
                console.error(`❌ Error creating user ${testUser.email}:`, authError.message)
                return
            }
            userId = authData.user.id
            console.log(`✅ Created auth user: ${testUser.email} (${userId})`)
        }

        // Check profile
        const { data: existingProfile, error: profileFetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (profileFetchError && profileFetchError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error checking profile:', profileFetchError)
        }

        if (existingProfile) {
            console.log('✅ Profile exists and is linked properly.')
        } else {
            console.log('Profile missing (trigger might have failed), creating manually...')
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    user_id: userId,
                    full_name: testUser.full_name,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })

            if (profileError) {
                console.error(`❌ Error creating profile for ${testUser.email}:`, profileError.message)
                return
            }
            console.log(`✅ Created profile for ${testUser.full_name}`)
        }

        console.log('\n🎉 Test user ready!')
        console.log(`Email: ${testUser.email}`)
        console.log(`Password: ${testUser.password}`)

    } catch (error) {
        console.error(`❌ Unexpected error:`, error)
    }
}

createTestUser()
