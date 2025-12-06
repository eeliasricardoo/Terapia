import { ProfessionalDataForm } from "./components/ProfessionalDataForm"

export default function ProfessionalDataPage() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col py-12 px-4 bg-gray-50">
            <div className="professional-theme w-full max-w-4xl mx-auto space-y-8">
                <ProfessionalDataForm />
            </div>
        </div>
    )
}

