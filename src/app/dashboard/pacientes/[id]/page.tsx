import { notFound } from 'next/navigation'
import { getPatientById } from '@/lib/actions/patients'
import { PatientProfilePage } from '@/components/dashboard/psychologist/patients/PatientProfilePage'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PacienteProfilePage({ params }: Props) {
  const { id } = await params
  const patient = await getPatientById(id)

  if (!patient) {
    notFound()
  }

  return <PatientProfilePage patient={patient} />
}
