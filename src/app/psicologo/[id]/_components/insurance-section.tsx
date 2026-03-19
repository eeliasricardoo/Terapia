import { ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Insurance {
  id: string
  name: string
}

interface InsuranceSectionProps {
  insurances?: Insurance[]
}

export function InsuranceSection({ insurances = [] }: InsuranceSectionProps) {
  if (insurances.length === 0) return null

  return (
    <Card className="shadow-sm border-slate-100 overflow-hidden">
      <CardHeader className="bg-slate-50/50 pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
          <ShieldCheck className="h-5 w-5 text-pink-500" />
          Planos de Saúde Aceitos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-2">
          {insurances.map((ins) => (
            <div
              key={ins.id}
              className="px-4 py-2 bg-white border border-slate-100 rounded-lg text-sm font-medium text-slate-700 shadow-sm hover:shadow-md hover:border-pink-200 transition-all cursor-default flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              {ins.name}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500 italic">
          * A vinculação com o plano de saúde permite que as sessões sejam realizadas sem custo
          direto para o paciente, conforme as regras da operadora.
        </p>
      </CardContent>
    </Card>
  )
}
