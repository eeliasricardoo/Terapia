import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Checking Psychologist Profiles in Database ---')

  const psychs = await prisma.psychologistProfile.findMany({
    include: {
      user: {
        include: {
          profiles: true,
        },
      },
    },
  })

  console.log(`Found ${psychs.length} profiles.`)

  psychs.forEach((p: any) => {
    console.log('--------------------------------------------------')
    console.log(`Name: ${p.user?.profiles?.fullName || 'N/A'}`)
    console.log(`UserID: ${p.userId}`)
    console.log(`CRP: ${p.crp}`)
    console.log(`Bio: ${p.bio}`)
    console.log(`Years of Exp: ${p.yearsOfExperience}`)
    console.log(`Verified: ${p.isVerified}`)
  })

  console.log('--------------------------------------------------')
}

main()
  .catch((e) => {
    console.error('Error executing script:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
