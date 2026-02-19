
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserProfile() {
    console.log('Checking user profiles...');

    // List all users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
        console.error('Error listing users:', usersError);
        return;
    }

    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        console.log(`User: ${user.email} (${user.id})`);

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (profileError) {
            console.log(`  - No profile found: ${profileError.message}`);

            // Attempt to create profile if missing
            console.log(`  - Attempting to create profile...`);
            const { error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id, // Assuming id is same as user_id or uuid
                    user_id: user.id,
                    email: user.email, // If email column exists in profiles, otherwise check schema
                    role: user.user_metadata?.role || 'PATIENT',
                    full_name: user.user_metadata?.full_name || 'User',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });

            if (createError) {
                console.error(`  - Failed to create profile: ${createError.message}`);
                // Check if it failed because of missing columns, trying minimal insert
                const { error: minimalError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        user_id: user.id,
                        updated_at: new Date().toISOString()
                    });
                if (minimalError) console.error(`  - Minimal insert failed: ${minimalError.message}`);
                else console.log(`  - Profile created (minimal)!`);

            } else {
                console.log(`  - Profile created successfully!`);
            }

        } else {
            console.log(`  - Profile found: ${profile.full_name} (${profile.role})`);
            console.log(`  - Avatar URL: ${profile.avatar_url}`);
        }
    }
}

checkUserProfile();
