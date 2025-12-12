import { RegistrationForm } from "@/components/auth/RegistrationForm"

export default function PatientRegistrationPage() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col py-12 px-4">
            <div className="w-full max-w-md mx-auto">
                <RegistrationForm />
            </div>
        </div>
    )
}





