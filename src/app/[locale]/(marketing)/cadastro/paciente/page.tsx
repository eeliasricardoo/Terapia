import { RegistrationForm } from '@/components/auth/RegistrationForm'

export default function PatientRegistrationPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col py-6 sm:py-12 px-4">
      <div className="w-full mx-auto">
        <RegistrationForm />
      </div>
    </div>
  )
}
