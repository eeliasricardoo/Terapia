
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const result = await prisma.$queryRaw`
    SELECT 
        trigger_name, 
        event_manipulation, 
        action_statement 
    FROM information_schema.triggers 
    WHERE event_object_table = 'users' AND event_object_schema = 'auth'
  `
    console.log(JSON.stringify(result, null, 2))
}

main().finally(() => prisma.$disconnect())
