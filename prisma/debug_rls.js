const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugSQL() {
    try {
        const result = await prisma.$queryRawUnsafe(`
      SELECT 
        schemaname, tablename, rowsecurity 
      FROM 
        pg_tables 
      WHERE 
        schemaname = 'public' 
        AND tablename IN ('profiles', 'psychologist_profiles')
    `)
        console.log('--- RLS Status ---')
        console.table(result)

        const policies = await prisma.$queryRawUnsafe(`
      SELECT 
        * 
      FROM 
        pg_policies 
      WHERE 
        tablename IN ('profiles', 'psychologist_profiles', 'users')
    `)
        console.log('\n--- Active Policies ---')
        console.table(policies)
    } catch (e) { console.error(e) }

    await prisma.$disconnect()
}

debugSQL()
