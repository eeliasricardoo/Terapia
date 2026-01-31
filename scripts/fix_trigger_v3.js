
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🛠 Corrigindo função handle_new_user (inserindo em users e profiles na ordem correta)...')

    try {
        await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        -- 1. Inserir na tabela public.users
        INSERT INTO public.users (id, email, name, role, "createdAt", "updatedAt")
        VALUES (
          NEW.id::text,
          NEW.email,
          NEW.raw_user_meta_data->>'full_name',
          COALESCE((NEW.raw_user_meta_data->>'role')::"UserRole", 'PATIENT'::"UserRole"),
          NOW(),
          NOW()
        );

        -- 2. Inserir na tabela public.profiles
        INSERT INTO public.profiles (
          id, 
          user_id, 
          full_name, 
          role, 
          phone, 
          birth_date, 
          document,
          created_at,
          updated_at
        )
        VALUES (
          gen_random_uuid()::text,
          NEW.id::text,
          NEW.raw_user_meta_data->>'full_name',
          COALESCE((NEW.raw_user_meta_data->>'role')::"UserRole", 'PATIENT'::"UserRole"),
          NULLIF(NEW.raw_user_meta_data->>'phone', ''),
          CASE 
            WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL AND NEW.raw_user_meta_data->>'birth_date' != '' 
            THEN (NEW.raw_user_meta_data->>'birth_date')::DATE 
            ELSE NULL 
          END,
          NULLIF(NEW.raw_user_meta_data->>'document', ''),
          NOW(),
          NOW()
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `)
        console.log('✅ Função handle_new_user corrigida com inserção dupla!')
    } catch (error) {
        console.error('❌ Erro ao atualizar trigger:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
