import { RegistrationForm } from './components/RegistrationForm'

export default function ProfessionalRegistrationPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col py-6 sm:py-12 px-4">
      <div className="professional-theme w-full max-w-md mx-auto space-y-8">
        <RegistrationForm />
      </div>
    </div>
  )
}
