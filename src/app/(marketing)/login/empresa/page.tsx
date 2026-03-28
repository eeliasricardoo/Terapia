import { LoginForm } from '@/components/auth/LoginForm'

export default function CompanyLoginPage() {
  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100dvh-80px)] py-6 sm:py-12">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2 mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Portal Empresa</h1>
          <p className="text-slate-500 font-medium">Acesse o painel de gestão da sua organização</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
