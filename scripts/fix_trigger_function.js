const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Fixing handle_new_user trigger function...')

    const sql = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users (NextAuth/Prisma Table)
  INSERT INTO public.users ("id", "email", "emailVerified", "role", "createdAt", "updatedAt")
  VALUES (
    NEW.id::text,
    NEW.email,
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN NEW.email_confirmed_at ELSE NULL END,
    COALESCE((NEW.raw_user_meta_data->>'role')::public."UserRole", 'PATIENT'::public."UserRole"),
    NOW(),
    NOW()
  )
  ON CONFLICT ("id") DO UPDATE SET
    "email" = EXCLUDED."email",
    "updatedAt" = NOW();

  -- Insert into public.profiles
  INSERT INTO public.profiles ("id", "user_id", "full_name", "role", "phone", "birth_date", "document", "created_at", "updated_at")
  VALUES (
    NEW.id::text,
    NEW.id::text,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::public."UserRole", 'PATIENT'::public."UserRole"),
    NEW.raw_user_meta_data->>'phone',
    (NEW.raw_user_meta_data->>'birth_date')::DATE,
    NEW.raw_user_meta_data->>'document',
    NOW(),
    NOW()
  )
  ON CONFLICT ("id") DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`

    try {
        await prisma.$executeRawUnsafe(sql)
        console.log('✅ Function updated successfully')
    } catch (e) {
        console.error('❌ Error updating function:', e)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
