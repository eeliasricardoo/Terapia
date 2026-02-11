const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
    console.log('Checking psychologist profiles...')

    const { data: psychs, error } = await supabase
        .from('psychologist_profiles')
        .select(`
            *,
            profile:profiles(*)
        `)

    if (error) {
        console.error('Error fetching:', error)
        return
    }

    console.log(`Found ${psychs.length} psychologist profiles.`)

    psychs.forEach(p => {
        console.log(`\nPsychologist ID: ${p.userId}`)
        console.log(`Verified: ${p.is_verified}`)
        console.log(`Profile linked: ${p.profile ? 'YES' : 'NO'}`)
        if (p.profile) {
            console.log(`Name: ${p.profile.full_name}`)
        } else {
            // Let's check if the profile exists but wasn't joined
            console.log('Checking profiles table directly...')
        }
    })
}

main()
