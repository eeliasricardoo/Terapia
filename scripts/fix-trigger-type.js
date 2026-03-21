const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const sql = `
CREATE OR REPLACE FUNCTION public.check_appointment_overlap()
 RETURNS trigger
 LANGUAGE plpgsql
 AS $function$
 DECLARE
     overlap_exists BOOLEAN;
 BEGIN
     -- 1. Correct conflict check for both psychologist and patient
     -- 2. Ensure type compatibility by avoiding redundant UUID casts on TEXT columns
     SELECT EXISTS (
         SELECT 1 FROM appointments
         WHERE 
             -- We want to ignore the current record (if it's an update)
             -- We use COALESCE with a string because the ID column is TEXT
             id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000') AND
             (psychologist_id = NEW.psychologist_id OR patient_id = NEW.patient_id) AND
             status != 'CANCELED' AND
             (
                 (scheduled_at, scheduled_at + (duration_minutes || ' minutes')::interval) OVERLAPS
                 (NEW.scheduled_at, NEW.scheduled_at + (NEW.duration_minutes || ' minutes')::interval)
             )
     ) INTO overlap_exists;

     IF overlap_exists THEN
         RAISE EXCEPTION 'Conflito de agendamento detectado (Database Guard). Um dos participantes já possui um compromisso neste horário.';
     END IF;

     RETURN NEW;
 END;
 $function$;
`

async function main() {
  console.log('Applying fix to check_appointment_overlap trigger function...')
  try {
    await prisma.$executeRawUnsafe(sql)
    console.log('Trigger function updated successfully.')
  } catch (error) {
    console.error('Failed to update trigger function:', error)
    process.exit(1)
  }
}

main().finally(() => prisma.$disconnect())
