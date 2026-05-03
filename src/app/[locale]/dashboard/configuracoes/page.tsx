import { ServicesConfig } from '@/components/dashboard/psychologist/config/ServicesConfig'
import { PatientServicesView } from '@/components/dashboard/patient/services/PatientServicesView'
import { getCurrentUserProfile } from '@/lib/actions/profile'

import { DeleteAccountSection } from '@/components/dashboard/DeleteAccountSection'

export default async function ConfiguracoesPage() {
  const profile = await getCurrentUserProfile()
  const isPsychologist = profile?.role === 'PSYCHOLOGIST'

  return (
    <div className="container py-8 space-y-12">
      {isPsychologist ? <ServicesConfig /> : <PatientServicesView />}

      <div className="max-w-4xl mx-auto pt-8 border-t border-slate-100">
        <DeleteAccountSection />
      </div>
    </div>
  )
}
