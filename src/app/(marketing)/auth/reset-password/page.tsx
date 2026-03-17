import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata = {
  title: 'Nova Senha | Terapia',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 px-4 bg-mesh">
      <ResetPasswordForm />
    </div>
  )
}
