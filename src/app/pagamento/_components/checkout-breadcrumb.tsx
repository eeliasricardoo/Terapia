'use client'

import { CheckCircle2 } from 'lucide-react'

export function CheckoutBreadcrumb() {
  const steps = [
    { name: 'Busca', status: 'complete' },
    { name: 'Perfil', status: 'complete' },
    { name: 'Pagamento', status: 'current' },
    { name: 'Confirmação', status: 'upcoming' },
  ]

  return (
    <div className="mb-12">
      <nav aria-label="Progress">
        <ol
          role="list"
          className="flex items-center justify-center sm:justify-start gap-4 sm:gap-8"
        >
          {steps.map((step, stepIdx) => (
            <li key={step.name} className="flex items-center gap-3">
              {step.status === 'complete' ? (
                <div className="flex items-center gap-2 group">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-900 hidden sm:inline">
                    {step.name}
                  </span>
                </div>
              ) : step.status === 'current' ? (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white border-4 border-blue-100">
                    <span className="text-xs font-black">{stepIdx + 1}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{step.name}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 opacity-40">
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                    <span className="text-xs font-bold">{stepIdx + 1}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-400 hidden sm:inline">
                    {step.name}
                  </span>
                </div>
              )}
              {stepIdx !== steps.length - 1 && <div className="h-px w-4 sm:w-8 bg-slate-200" />}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
