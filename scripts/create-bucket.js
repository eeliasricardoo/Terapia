
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config(); // fallback to .env
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Erro: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessários no .env.local para criar buckets.');
    console.log('Por favor, adicione sua SUPABASE_SERVICE_ROLE_KEY ao arquivo .env.local e tente novamente.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBuckets() {
    console.log('Verificando buckets do Storage...');

    const bucketName = 'avatars';

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('Erro ao listar buckets:', listError.message);
        return;
    }

    const avatarBucket = buckets.find(b => b.name === bucketName);

    if (avatarBucket) {
        console.log(`Bucket '${bucketName}' já existe.`);
    } else {
        console.log(`Criando bucket '${bucketName}'...`);
        const { data, error } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/*']
        });

        if (error) {
            console.error(`Erro ao criar bucket '${bucketName}':`, error.message);
        } else {
            console.log(`Bucket '${bucketName}' criado com sucesso!`);
        }
    }
}

createBuckets();
