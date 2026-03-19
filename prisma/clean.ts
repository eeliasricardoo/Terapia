const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up all psychologist-related data...')

  // Clear appointments and all child objects first
  await prisma.appointment.deleteMany({})
  await prisma.psychologistInsurance.deleteMany({})
  await prisma.coupon.deleteMany({})
  await prisma.scheduleOverride.deleteMany({})
  await prisma.diaryEntry.deleteMany({})
  await prisma.evolution.deleteMany({})
  await prisma.patientPsychologistLink.deleteMany({})

  // Delete the psychologist profiles
  await prisma.psychologistProfile.deleteMany({})

  // Delete profiles and users with role PSYCHOLOGIST
  await prisma.profile.deleteMany({
    where: {
      OR: [{ role: 'PSYCHOLOGIST' }, { user_id: { startsWith: 'psych-' } }],
    },
  })

  await prisma.user.deleteMany({
    where: {
      OR: [{ role: 'PSYCHOLOGIST' }, { id: { startsWith: 'psych-' } }],
    },
  })

  console.log('Database cleaned. You can now run the seed.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
