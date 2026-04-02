import { getPatientPublicEvolutions } from '@/lib/actions/evolutions'
import { ProntuarioClient } from './prontuario-client'

export default async function PatientProntuarioPage() {
  const res = await getPatientPublicEvolutions()
  const evolutions = res.success ? res.data : []

  return <ProntuarioClient evolutions={evolutions} />
}
