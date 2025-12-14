
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Configurando integração Supabase Auth -> Prisma Users...')

    try {
        // 1. Criar a função handle_new_user
        console.log('1️⃣  Criando função handle_new_user()...')
        await prisma.$executeRawUnsafe(`
      create or replace function public.handle_new_user()
      returns trigger
      language plpgsql
      security definer set search_path = public
      as $$
      begin
        insert into public.users (id, email, name, role, "createdAt", "updatedAt")
        values (
          new.id,
          new.email,
          new.raw_user_meta_data ->> 'name',
          coalesce((new.raw_user_meta_data ->> 'role')::"UserRole", 'PATIENT'),
          now(),
          now()
        );
        return new;
      end;
      $$;
    `)
        console.log('✅ Função criada!')

        // 2. Criar o Trigger
        console.log('2️⃣  Configurando Trigger...')
        await prisma.$executeRawUnsafe(`
      drop trigger if exists on_auth_user_created on auth.users;
    `)

        await prisma.$executeRawUnsafe(`
      create trigger on_auth_user_created
        after insert on auth.users
        for each row execute procedure public.handle_new_user();
    `)
        console.log('✅ Trigger configurado com sucesso!')

        console.log('\n🎉 Tudo pronto! Novos usuários do Supabase Auth serão copiados automaticamente para sua tabela de Users.')

    } catch (error) {
        console.error('❌ Erro ao configurar:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
