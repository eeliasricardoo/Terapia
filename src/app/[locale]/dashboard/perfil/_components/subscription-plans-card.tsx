'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Package } from 'lucide-react'

export function SubscriptionPlansCard() {
  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Planos &amp; Assinaturas
          </CardTitle>
          <CardDescription>Gerencie seus planos e assinaturas ativas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum plano ativo</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Você não possui nenhum plano ou assinatura ativa no momento. Seus agendamentos são
              feitos por sessão avulsa.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            Métodos de Pagamento
          </CardTitle>
          <CardDescription>
            Seus pagamentos são processados de forma segura via Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <CreditCard className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500 max-w-sm">
              Os pagamentos são gerenciados diretamente pelo Stripe durante o agendamento. Não é
              necessário cadastrar cartões previamente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
