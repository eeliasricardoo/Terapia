import { ServicesConfig } from '@/components/dashboard/psychologist/config/ServicesConfig'
import { PatientServicesView } from '@/components/dashboard/patient/services/PatientServicesView'
import { getCurrentUserProfile } from '@/lib/actions/profile'

export default async function ConfiguracoesPage() {
  const profile = await getCurrentUserProfile()
  const isPsychologist = profile?.role === 'PSYCHOLOGIST'

  return (
    <div className="container py-8">
      {isPsychologist ? <ServicesConfig /> : <PatientServicesView />}
    </div>
  )
}
