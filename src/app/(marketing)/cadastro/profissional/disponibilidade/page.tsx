import { AvailabilityForm } from './components/AvailabilityForm'
import { Stepper } from '@/components/ui/stepper'

const STEPS = [
  { id: 'dados', title: 'Dados Profissionais', description: 'Informações básicas' },
  { id: 'disponibilidade', title: 'Disponibilidade', description: 'Configure sua agenda' },
  { id: 'pagamento', title: 'Configuração de Pagamento', description: 'Dados bancários' },
]

export default function AvailabilityPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col py-12 px-4 bg-gray-50">
      <div className="professional-theme w-full max-w-4xl mx-auto space-y-8">
        <Stepper steps={STEPS} currentStep={2} />
        <AvailabilityForm />
      </div>
    </div>
  )
}
