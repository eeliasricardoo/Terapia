
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🛠 Corrigindo função handle_new_user (inserção dupla + ON CONFLICT)...')

    try {
        await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        -- 1. Inserir na tabela public.users (se não existir)
        INSERT INTO public.users (id, email, name, role, "createdAt", "updatedAt")
        VALUES (
          NEW.id::text,
          NEW.email,
          NEW.raw_user_meta_data->>'full_name',
          COALESCE((NEW.raw_user_meta_data->>'role')::"UserRole", 'PATIENT'::"UserRole"),
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          "updatedAt" = NOW();

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
          NEW.id::text, -- Usando o mesmo ID do usuário para o perfil (comum e seguro)
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
        )
        ON CONFLICT (user_id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          role = EXCLUDED.role,
          phone = EXCLUDED.phone,
          birth_date = EXCLUDED.birth_date,
          document = EXCLUDED.document,
          updated_at = NOW();

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `)
        console.log('✅ Função handle_new_user corrigida com suporte a conflitos!')
    } catch (error) {
        console.error('❌ Erro ao atualizar trigger:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
