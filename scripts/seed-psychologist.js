
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function main() {
    const email = 'psicologo@test.com';
    const password = '123456789';
    const fullName = 'Dr. Admin Teste';

    console.log(`Checking if user ${email} exists...`);

    let userId = null;

    try {
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName
            }
        });

        if (error) {
            if (error.message.includes('already registered') || error.status === 422) {
                console.log('User already exists, fetching ID...');
                const { data: listData } = await supabase.auth.admin.listUsers();
                const foundUser = listData.users.find(u => u.email === email);
                if (foundUser) {
                    userId = foundUser.id;
                    console.log(`Found existing user ID: ${userId}`);
                } else {
                    console.error('Could not find existing user ID despite 422 error.');
                    // Try searching by email
                }
            } else {
                throw error;
            }
        } else {
            userId = data.user.id;
            console.log(`Created new user with ID: ${userId}`);
        }
    } catch (err) {
        console.error('Error managing auth user:', err);
        process.exit(1);
    }

    if (!userId) {
        console.error('Failed to obtain user ID.');
        process.exit(1);
    }

    console.log('Updating profile data for user:', userId);

    // 1. Update Profile (role)
    // Ensure we provide ID if creating new row
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: crypto.randomUUID(),
            user_id: userId,
            full_name: fullName,
            role: 'PSYCHOLOGIST',
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id', ignoreDuplicates: false });

    if (profileError) {
        console.error('Error updating public profile:', profileError);
    } else {
        console.log('Public profile updated.');
    }

    // 2. Create Psychologist Profile
    const { error: psychError } = await supabase
        .from('psychologist_profiles')
        .upsert({
            id: crypto.randomUUID(),
            userId: userId,
            crp: '12/34567',
            bio: 'Psicólogo de teste gerado automaticamente via script Admin.',
            specialties: ['Terapia Cognitivo-Comportamental', 'Ansiedade'],
            price_per_session: 150.00,
            is_verified: true,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'userId', ignoreDuplicates: false });

    if (psychError) {
        console.error('Error creating psychologist profile:', psychError);
    } else {
        console.log('Psychologist profile created/updated successfully.');
    }

    console.log('Done.');
}

main();
