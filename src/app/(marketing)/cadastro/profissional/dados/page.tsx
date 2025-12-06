import { ProfessionalDataForm } from "./components/ProfessionalDataForm"
import { Stepper } from "@/components/ui/stepper"

const STEPS = [
  { id: 'dados', title: 'Dados Profissionais', description: 'Informações básicas' },
  { id: 'disponibilidade', title: 'Disponibilidade', description: 'Configure sua agenda' },
  { id: 'pagamento', title: 'Configuração de Pago', description: 'Dados bancários' },
]

export default function ProfessionalDataPage() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col py-12 px-4 bg-gray-50">
            <div className="professional-theme w-full max-w-4xl mx-auto space-y-8">
                <Stepper steps={STEPS} currentStep={1} />
                <ProfessionalDataForm />
            </div>
        </div>
    )
}

