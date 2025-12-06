'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Clock, Rocket, Mail } from 'lucide-react';

const NEXT_STEPS = [
  {
    id: 'submitted',
    icon: CheckCircle2,
    title: 'Aplicação Enviada',
    status: 'Concluída',
    variant: 'completed' as const,
  },
  {
    id: 'analysis',
    icon: Clock,
    title: 'Análise pela Equipe',
    status: 'Em andamento',
    variant: 'in-progress' as const,
  },
  {
    id: 'onboarding',
    icon: Rocket,
    title: 'Aprovação e Onboarding',
    status: 'Pendente',
    variant: 'pending' as const,
  },
];

export default function SuccessPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardContent className="space-y-8 p-8 sm:p-12">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Sua aplicação foi recebida com sucesso!
            </h1>
            <p className="text-muted-foreground">
              Obrigado pelo seu interesse em juntar-se à nossa plataforma. Recebemos suas
              informações e nossa equipe irá analisá-las em breve. Uma confirmação também foi
              enviada para o seu e-mail.
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Próximos Passos</h2>
            <div className="space-y-3">
              {NEXT_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div
                      className={`rounded-full p-2 ${
                        step.variant === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : step.variant === 'in-progress'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Tempo estimado de análise
              </p>
              <p className="text-base">7-10 dias úteis</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">O que esperar</p>
              <p className="text-base">
                Fique de olho no seu e-mail para atualizações e prepare seus documentos para a
                próxima etapa.
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Dúvidas?</p>
              <p className="text-sm">
                Entre em contato conosco em{' '}
                <a
                  href="mailto:suporte@zenklub.com.co"
                  className="font-medium text-primary hover:underline"
                >
                  suporte@zenklub.com.co
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Enquanto isso</p>
              <p className="text-sm">
                Explore nosso blog para saber mais sobre nossa comunidade de profissionais.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={() => router.push('/')} className="w-full sm:w-auto">
              Voltar para a página inicial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

