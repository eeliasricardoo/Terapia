const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('--- Seeding Mock Appointments ---')

  // 1. Find all psychologists
  const psychs = await prisma.psychologistProfile.findMany({
    include: {
      user: {
        include: {
          profiles: true,
        },
      },
    },
  })

  if (psychs.length === 0) {
    console.log('No psychologists found in database.')
    return
  }

  // 2. Mock patients
  const patientNames = [
    'Carlos Oliveira',
    'Mariana Santos',
    'Roberto Silva',
    'Luciana Lima',
    'Fernando Costa',
  ]
  const patients = []

  for (const name of patientNames) {
    const email = `mock_${name.toLowerCase().replace(' ', '_')}@example.com`
    let user = await prisma.user.findFirst({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: `mock_user_${Math.random().toString(36).substring(7)}`,
          email: email,
          name: name,
          role: 'PATIENT',
          password: 'mock_password',
          profiles: {
            create: {
              id: `mock_profile_${Math.random().toString(36).substring(7)}`,
              fullName: name, // Fixed camelCase
              role: 'PATIENT',
            },
          },
        },
      })
      console.log(`Created mock patient: ${name}`)
    } else {
      const profile = await prisma.profile.findUnique({ where: { user_id: user.id } })
      user.profiles = profile
    }
    patients.push(user)
  }

  const now = new Date()

  for (const psych of psychs) {
    console.log(`Seeding for: ${psych.user?.profiles?.fullName || 'N/A'} (ID: ${psych.id})`)

    // Days to seed
    const daysOffset = [0, 1, 3, 5, 10, 11, 14]
    const availableHours = [9, 10, 14, 15, 16]

    for (const offset of daysOffset) {
      const date = new Date(now)
      date.setDate(now.getDate() + offset)

      // Randomly pick a few hours for each day
      const dailyHours = availableHours
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1)

      for (const hour of dailyHours) {
        const appointmentDate = new Date(date)
        appointmentDate.setHours(hour, 0, 0, 0)
        appointmentDate.setSeconds(0)
        appointmentDate.setMilliseconds(0)

        // Check if appointment already exists (approximate match by hour)
        const nextHour = new Date(appointmentDate)
        nextHour.setHours(hour + 1)

        const existing = await prisma.appointment.findFirst({
          where: {
            psychologistId: psych.id,
            scheduledAt: {
              gte: appointmentDate,
              lt: nextHour,
            },
          },
        })

        if (!existing) {
          const patient = patients[Math.floor(Math.random() * patients.length)]
          await prisma.appointment.create({
            data: {
              id: `mock_appt_${Math.random().toString(36).substring(7)}`,
              psychologistId: psych.id,
              patientId: patient.id,
              scheduledAt: appointmentDate,
              durationMinutes: 50,
              status: 'SCHEDULED',
              sessionType: 'Terapia Individual',
              price: psych.price_per_session || 150,
            },
          })
          console.log(`  Added session on ${appointmentDate.toISOString()} for ${patient.name}`)
        }
      }
    }
  }

  console.log('--- Seeding Complete ---')
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
