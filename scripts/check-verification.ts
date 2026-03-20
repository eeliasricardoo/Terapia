import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

async function main() {
  const email = 'beatriz.a@mindcare.com'
  const user = await prisma.user.findUnique({
    where: { email },
    include: { psychologistProfile: true },
  })

  if (!user || !user.psychologistProfile) {
    console.log(`User ${email} or profile not found`)
    return
  }

  console.log(`User: ${user.email}`)
  console.log(`Verified in DB: ${user.psychologistProfile.isVerified}`)
}

main().finally(() => prisma.$disconnect())
