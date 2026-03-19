import { getHealthInsurances } from '@/lib/actions/admin'
import { HealthInsuranceList } from '../_components/HealthInsuranceList'
import { HeartPulse } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HealthInsurancesPage() {
  const insurances = await getHealthInsurances()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <HeartPulse className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Planos de Saúde</h2>
        </div>
        <p className="text-neutral-500 font-medium max-w-2xl">
          Gerencie as operadoras de saúde aceitas na plataforma para facilitar o vínculo entre
          pacientes e psicólogos credenciados.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/30 p-1 shadow-inner">
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <HealthInsuranceList initialInsurances={insurances} />
        </div>
      </div>
    </div>
  )
}
