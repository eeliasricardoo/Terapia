import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata = {
  title: 'Recuperar Senha | Terapia',
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center py-6 sm:py-12 px-4 bg-mesh">
      <ForgotPasswordForm />
    </div>
  )
}
