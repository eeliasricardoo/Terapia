
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const result = await prisma.$queryRaw`
    SELECT id, user_id FROM profiles LIMIT 5
  `
    console.log(JSON.stringify(result, null, 2))
}

main().finally(() => prisma.$disconnect())
