import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true },
    where: { email: { contains: '@' } },
    take: 10,
  })

  const psychologists = await prisma.psychologistProfile.findMany({
    include: { user: true },
    take: 5,
  })

  let coupons = await prisma.coupon.findMany()

  if (coupons.length === 0 && psychologists.length > 0) {
    console.log('No coupons found. Creating test coupons...')
    await prisma.coupon.createMany({
      data: [
        {
          psychologistId: psychologists[0].id,
          code: 'TEST10',
          type: 'PERCENTAGE',
          value: 10,
          active: true,
        },
        {
          psychologistId: psychologists[0].id,
          code: 'FIXED50',
          type: 'FIXED',
          value: 50,
          active: true,
        },
      ],
    })
    coupons = await prisma.coupon.findMany()
  }

  console.log('--- TEST DATA ---')
  console.log('Users:', users)
  console.log('Psychologists with 08:00-18:00 availability (Mon-Fri):')
  psychologists.forEach((p) => {
    console.log(`- ${p.user.name} (${p.user.email}) | ID: ${p.id}`)
  })
  console.log(
    'Coupons:',
    coupons.map((c) => ({ code: c.code, value: c.value, type: c.type }))
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
