
const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')
dotenv.config()
const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Fixing Public Schema Permissions...')

        await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO anon, authenticated;`)

        // Grant access to tables.
        // Note: GRANT ALL might be too permissive but RLS should restrict access.
        // If you want to be more specific: SELECT, INSERT, UPDATE, DELETE
        await prisma.$executeRawUnsafe(`GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;`)
        await prisma.$executeRawUnsafe(`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;`)
        await prisma.$executeRawUnsafe(`GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;`)

        console.log('✅ Permissions granted.')

    } catch (error) {
        console.error('❌ Error fixing permissions:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
