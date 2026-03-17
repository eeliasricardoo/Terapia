import { EmailVerificationForm } from '@/components/auth/EmailVerificationForm'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export const metadata = {
  title: 'Confirmar E-mail | Terapia',
  description: 'Confirme seu e-mail para ativar sua conta na Terapia.',
}

export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 px-4 bg-mesh">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <EmailVerificationForm />
      </Suspense>
    </div>
  )
}
