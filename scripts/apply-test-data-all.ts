import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  console.log('--- Aplicando Massa de Teste para TODOS os Psicólogos ---')

  const psychologists = await prisma.psychologistProfile.findMany()
  console.log(`Encontrados ${psychologists.length} psicólogos.`)

  const patientId = 'f251e420-401d-4085-adea-528b663c9f19' // ID válido de paciente de teste

  for (const psych of psychologists) {
    console.log(`Processando: ${psych.userId}...`)

    // 1. Garantir Rotina Semanal Padrão (Seg-Sex)
    await prisma.psychologistProfile.update({
      where: { id: psych.id },
      data: {
        isVerified: true,
        weeklySchedule: {
          monday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
          tuesday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
          wednesday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
          thursday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
          friday: { enabled: true, slots: [{ start: '09:00', end: '18:00' }] },
          saturday: { enabled: false, slots: [] },
          sunday: { enabled: false, slots: [] },
          sessionDuration: '50',
          breakDuration: '10',
        },
      },
    })

    // 2. Personalizado (Mar 21) - Sábado com horário especial
    await supabase.from('schedule_overrides').upsert(
      {
        psychologist_id: psych.id,
        date: '2026-03-21',
        type: 'custom',
        slots: [{ start: '10:00', end: '14:00' }],
      },
      { onConflict: 'psychologist_id,date' }
    )

    // 3. Bloqueado (Mar 22) - Domingo bloqueado explicitamente (red dot)
    await supabase.from('schedule_overrides').upsert(
      {
        psychologist_id: psych.id,
        date: '2026-03-22',
        type: 'blocked',
        slots: [],
      },
      { onConflict: 'psychologist_id,date' }
    )

    // 4. Agendamento (Mar 23) - Segunda com paciente
    const apptId = `test-appt-${psych.id.slice(0, 8)}`
    await prisma.appointment.upsert({
      where: { id: apptId },
      update: { status: 'SCHEDULED' },
      create: {
        id: apptId,
        psychologistId: psych.id,
        patientId: patientId,
        scheduledAt: new Date('2026-03-23T10:00:00Z'),
        durationMinutes: 50,
        status: 'SCHEDULED',
        price: 150,
        sessionType: 'video',
      },
    })
  }

  console.log('--- Massa de teste aplicada com sucesso! ---')
}

main().finally(() => prisma.$disconnect())
