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
    <Card className="shadow-sm border-border overflow-hidden">
      <CardHeader className="bg-muted/30 pb-3">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
          <ShieldCheck className="h-5 w-5 text-secondary" />
          Planos de Saúde Aceitos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-2">
          {insurances.map((ins) => (
            <div
              key={ins.id}
              className="px-4 py-2 bg-white border border-border rounded-lg text-sm font-medium text-foreground shadow-sm hover:shadow-md hover:border-secondary/40 transition-all cursor-default flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
              {ins.name}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground italic">
          * A vinculação com o plano de saúde permite que as sessões sejam realizadas sem custo
          direto para o paciente, conforme as regras da operadora.
        </p>
      </CardContent>
    </Card>
  )
}
