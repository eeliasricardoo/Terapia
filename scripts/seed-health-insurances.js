const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const healthInsurances = [
  { name: 'Amil' },
  { name: 'Bradesco Saúde' },
  { name: 'Unimed' },
  { name: 'SulAmérica Saúde' },
  { name: 'NotreDame Intermédica' },
  { name: 'Porto Seguro Saúde' },
  { name: 'Golden Cross' },
  { name: 'Care Plus' },
  { name: 'Omint' },
  { name: 'Allianz Saúde' },
  { name: 'SAMP' },
  { name: 'Hapvida' },
  { name: 'Central Nacional Unimed' },
  { name: 'Seguros Unimed' },
  { name: 'Mediservice' },
]

async function main() {
  console.log('Seeding health insurances...')
  for (const insurance of healthInsurances) {
    await prisma.healthInsurance.upsert({
      where: { name: insurance.name },
      update: {},
      create: insurance,
    })
  }
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
