const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Enabling RLS and policies for notifications...')

    // We run them separately to be sure
    await prisma.$executeRawUnsafe('ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;')

    // Drop first if exists to be idempotent
    await prisma.$executeRawUnsafe(
      'DROP POLICY IF EXISTS "UserNotificationsPolicy" ON notifications;'
    )

    await prisma.$executeRawUnsafe(`
      CREATE POLICY "UserNotificationsPolicy" 
      ON notifications 
      FOR ALL 
      USING (auth.uid()::text = user_id::text)
      WITH CHECK (auth.uid()::text = user_id::text);
    `)

    // Ensure publication has it (idempotent usually)
    await prisma.$executeRawUnsafe('ALTER PUBLICATION supabase_realtime ADD TABLE notifications;')

    console.log('Realtime/RLS configured successfully!')
  } catch (err) {
    console.error('Configuration failed:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
