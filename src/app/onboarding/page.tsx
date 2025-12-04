import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard"


export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
                <OnboardingWizard />
            </main>
        </div>
    )
}
