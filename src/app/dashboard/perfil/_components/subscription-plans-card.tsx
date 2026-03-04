'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function SubscriptionPlansCard() {
  return (
    <div className="space-y-6">
      <Card className="border-blue-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Ativo
          </span>
        </div>
        <CardHeader>
          <CardTitle className="text-xl text-blue-900">Plano Corporativo</CardTitle>
          <CardDescription>
            Benefício fornecido por <strong>Tech Solutions Inc.</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Créditos Disponíveis</p>
              <p className="text-3xl font-bold text-slate-900">
                4 <span className="text-sm font-normal text-slate-400">/ mês</span>
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Renovação</p>
              <p className="text-lg font-semibold text-slate-900">01/11/2024</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Cobertura</p>
              <p className="text-lg font-semibold text-slate-900">100%</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Histórico de Uso (Este mês)</h4>
            <div className="border rounded-md divide-y">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                      CP
                    </div>
                    <div>
                      <p className="font-medium">Sessão com Dr. Carlos Pereira</p>
                      <p className="text-xs text-muted-foreground">15 Out, 2024 • 14:00</p>
                    </div>
                  </div>
                  <span className="font-mono text-slate-600">-1 crédito</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50 border-t p-6 flex justify-between items-center">
          <p className="text-xs text-muted-foreground w-2/3">
            Para dúvidas sobre seu benefício corporativo, entre em contato com o RH da sua empresa
            ou nosso suporte.
          </p>
          <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
            Contato Suporte
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
          <CardDescription>Gerencie seus cartões para sessões extras.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-14 bg-slate-100 rounded flex items-center justify-center">
                <span className="font-bold text-slate-500 text-xs">RICO</span>
              </div>
              <div>
                <p className="font-medium text-sm">Cartão de Crédito **** 8899</p>
                <p className="text-xs text-muted-foreground">Expira em 12/28</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Remover
            </Button>
          </div>
          <Button variant="outline" className="w-full border-dashed">
            + Adicionar novo cartão
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
