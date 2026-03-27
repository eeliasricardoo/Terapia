const { PrismaClient } = require('@prisma/client')

async function checkDuplicates() {
  const prisma = new PrismaClient()
  try {
    const duplicates = await prisma.$queryRaw`
      SELECT stripe_account_id, COUNT(*)
      FROM psychologist_profiles
      WHERE stripe_account_id IS NOT NULL
      GROUP BY stripe_account_id
      HAVING COUNT(*) > 1
    `
    console.log('Duplicates:', JSON.stringify(duplicates, null, 2))
  } catch (error) {
    console.error('Error checking duplicates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDuplicates()
