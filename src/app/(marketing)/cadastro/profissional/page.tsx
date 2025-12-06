import { RegistrationForm } from "./components/RegistrationForm"

export default function ProfessionalRegistrationPage() {
    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    .prof-registration {
                        --primary: 340 72% 61%;
                        --primary-foreground: 0 0% 100%;
                        --ring: 340 72% 61%;
                    }
                `
            }} />
            <div className="flex min-h-[calc(100vh-4rem)] flex-col py-12 px-4">
                <div className="prof-registration w-full max-w-md mx-auto space-y-8">
                    <RegistrationForm />
                </div>
            </div>
        </>
    )
}

