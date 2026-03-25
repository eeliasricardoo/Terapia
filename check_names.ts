import { prisma } from './src/lib/prisma'

async function check() {
  const appts = await prisma.appointment.findMany({
    include: {
      patient: { include: { profiles: true } },
      psychologist: {
        include: {
          user: { include: { profiles: true } },
        },
      },
    },
    take: 1
  })
  console.log(JSON.stringify(appts, null, 2))
}
check()
