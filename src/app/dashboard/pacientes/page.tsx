import { getPsychologistPatients } from '@/lib/actions/patients'
import { PatientsManager } from '@/components/dashboard/psychologist/patients/PatientsManager'

export default async function PacientesPage() {
  const res = await getPsychologistPatients(undefined)

  return (
    <div className="container py-8">
      <PatientsManager initialPatients={res.success ? res.data : []} />
    </div>
  )
}
