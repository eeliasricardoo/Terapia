
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🛠 Corrigindo função handle_new_user (adicionando updated_at e tratamento de tipos)...')

    try {
        // Primeiro vamos garantir que a função seja robusta
        await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
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
          NEW.id,
          NEW.id,
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
        console.log('✅ Função handle_new_user corrigida com sucesso!')
    } catch (error) {
        console.error('❌ Erro ao atualizar trigger:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
