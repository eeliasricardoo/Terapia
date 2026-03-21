const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER PUBLICATION supabase_realtime ADD TABLE notifications;')
    console.log('Realtime enabled for notifications table!')
  } catch (err) {
    console.error('Failed to enable realtime:', err.message)
    // If it's already there or publication not found, we ignore or report
  } finally {
    await prisma.$disconnect()
  }
}

main()
