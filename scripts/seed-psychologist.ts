
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') }); // Fallback

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

    // Check if user exists by email (via admin listUsers - simpler than getByEmail sometimes)
    // Actually admin.listUsers is cleaner
    // Or just try to create and catch error.

    let userId: string | null = null;

    try {
        // Try to sign up/create the user. 
        // verify: true sends email. We want auto confirm.
        // admin.createUser allows setting email_confirm: true
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName
            }
        });

        if (error) {
            // If error is "User already registered", we find the user
            if (error.message.includes('already registered') || error.status === 422) {
                console.log('User already exists, fetching ID...');
                // We can't easily get ID by email via admin API without listing.
                // But we can use listUsers
                const { data: listData } = await supabase.auth.admin.listUsers();
                const foundUser = listData.users.find(u => u.email === email);
                if (foundUser) {
                    userId = foundUser.id;
                    console.log(`Found existing user ID: ${userId}`);
                } else {
                    throw new Error('Could not find existing user ID despite 422 error.');
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

    console.log('Updating profile data...');

    // 1. Update Profile (role)
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            user_id: userId,
            full_name: fullName,
            role: 'PSYCHOLOGIST',
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' }); // Profile usually keyed by user_id

    if (profileError) {
        console.error('Error updating public profile:', profileError);
        // Don't exit, try to continue to psych profile
    } else {
        console.log('Public profile updated.');
    }

    // 2. Create Psychologist Profile
    // Using 'userId' as column name based on previous findings in codebase
    const { error: psychError } = await supabase
        .from('psychologist_profiles')
        .upsert({
            userId: userId,
            crp: '12/34567',
            bio: 'Psicólogo de teste gerado automaticamente para administração e validação do sistema.',
            specialties: ['Terapia Cognitivo-Comportamental', 'Ansiedade', 'Depressão'],
            price_per_session: 150.00,
            is_verified: true,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'userId' });

    if (psychError) {
        console.error('Error updating psychologist profile:', psychError);
    } else {
        console.log('Psychologist profile created/updated successfully.');
    }

    console.log('Done.');
}

main();
