
import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Applying Storage Policies...')

        // 1. Create 'avatars' bucket if not exists
        await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('avatars', 'avatars', true)
      ON CONFLICT (id) DO NOTHING;
    `)
        console.log('✅ Bucket "avatars" ensured.')

        // 2. Drop existing policies to avoid conflicts
        await prisma.$executeRawUnsafe(`
      DROP POLICY IF EXISTS "Public Access" ON storage.objects;
      DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
      DROP POLICY IF EXISTS "Authenticated users can update avatars" ON storage.objects;
      DROP POLICY IF EXISTS "Authenticated users can select avatars" ON storage.objects; 
    `)
        console.log('✅ Old policies cleaned up.')

        // 3. Create Policies

        // Public Read
        await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Access"
      ON storage.objects FOR SELECT
      USING ( bucket_id = 'avatars' );
    `)
        console.log('✅ Policy "Public Access" created.')

        // Authenticated Upload
        await prisma.$executeRawUnsafe(`
      CREATE POLICY "Authenticated users can upload avatars"
      ON storage.objects FOR INSERT
      WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
    `)
        console.log('✅ Policy "Authenticated users can upload avatars" created.')

        // Authenticated Update
        await prisma.$executeRawUnsafe(`
      CREATE POLICY "Authenticated users can update avatars"
      ON storage.objects FOR UPDATE
      USING ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );
    `)
        console.log('✅ Policy "Authenticated users can update avatars" created.')

    } catch (error) {
        console.error('❌ Error applying policies:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
