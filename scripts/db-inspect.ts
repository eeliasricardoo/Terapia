import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

async function main() {
  const result =
    await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'psychologist_profiles'`
  console.log('Columns in psychologist_profiles:', result)
}

main().finally(() => prisma.$disconnect())
