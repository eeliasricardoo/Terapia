
const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Checking Realtime configuration for "profiles"...')

        // 1. Enable REPLICA IDENTITY FULL (often needed for full row updates in realtime)
        await prisma.$executeRawUnsafe(`ALTER TABLE profiles REPLICA IDENTITY FULL;`)
        console.log('✅ REPLICA IDENTITY FULL set for profiles.')

        // 2. Add to supabase_realtime publication
        // We use a safe block to avoid crashing if it's already there (though 'ADD TABLE' might throw if already present, 'SET TABLE' replaces)
        // Using simple approach: try to add, catch if error (or check existence)

        try {
            await prisma.$executeRawUnsafe(`ALTER PUBLICATION supabase_realtime ADD TABLE profiles;`)
            console.log('✅ Added profiles to supabase_realtime publication.')
        } catch (e) {
            if (e.message && e.message.includes('already in publication')) {
                console.log('ℹ️  profiles is already in supabase_realtime.')
            } else {
                console.log('⚠️  Could not add to publication (might be already added or permission issue):', e.message)
            }
        }

    } catch (error) {
        console.error('❌ Error configuring realtime:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
