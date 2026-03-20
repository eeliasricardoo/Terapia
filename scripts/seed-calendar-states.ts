import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Need service role for bypass RLS if needed, or just standard API key if RLS allows
)

async function main() {
  const psychId = '6f9ab176-a58e-4c35-81a4-d5ca092566bc'
  const userId = '0f441a14-b91e-4d74-a581-d66f6f1fac45'

  console.log('--- Seeding Calendar States for testing ---')

  // 1. Personalizado (Mar 21)
  await supabase.from('schedule_overrides').upsert(
    {
      psychologist_id: psychId,
      date: '2026-03-21',
      type: 'custom',
      slots: [{ start: '10:00', end: '12:00' }],
    },
    { onConflict: 'psychologist_id,date' }
  )

  // 2. Bloqueado (Mar 22)
  await supabase.from('schedule_overrides').upsert(
    {
      psychologist_id: psychId,
      date: '2026-03-22',
      type: 'blocked',
      slots: [],
    },
    { onConflict: 'psychologist_id,date' }
  )

  // 3. Agendamento (Mar 23)
  // Create an appointment for Mar 23
  const apptDate = new Date('2026-03-23T10:00:00Z')
  await prisma.appointment.upsert({
    where: { id: 'test-appt-mar-23' },
    update: { scheduledAt: apptDate, status: 'SCHEDULED' },
    create: {
      id: 'test-appt-mar-23',
      psychologistId: psychId,
      patientId: 'f251e420-401d-4085-adea-528b663c9f19', // Valid patient ID
      scheduledAt: apptDate,
      durationMinutes: 50,
      status: 'SCHEDULED',
      price: 150,
      sessionType: 'chat',
    },
  })

  console.log('✅ States seeded: Mar 21 (Custom), Mar 22 (Blocked), Mar 23 (Appointment)')
}

main().finally(() => prisma.$disconnect())
