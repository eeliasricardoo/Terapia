const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const sql = `
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
    health_insurance_id,
    health_insurance_policy
  )
  VALUES (
    NEW.id,
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'PATIENT'),
    NEW.raw_user_meta_data->>'phone',
    (NEW.raw_user_meta_data->>'birth_date')::DATE,
    NEW.raw_user_meta_data->>'document',
    CASE 
      WHEN NEW.raw_user_meta_data->>'health_insurance_id' = 'none' THEN NULL 
      ELSE (NEW.raw_user_meta_data->>'health_insurance_id')::UUID 
    END,
    NEW.raw_user_meta_data->>'health_insurance_policy'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`

async function main() {
  console.log('Updating handle_new_user trigger...')
  try {
    await prisma.$executeRawUnsafe(sql)
    console.log('Update successful.')
  } catch (error) {
    console.error('Update failed:', error)
  }
}

main().finally(() => prisma.$disconnect())
