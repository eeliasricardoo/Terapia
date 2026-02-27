import { getPsychologistPatients } from "@/lib/actions/patients"
import { PatientsManager } from "@/components/dashboard/psychologist/patients/PatientsManager"

export default async function PacientesPage() {
    const patients = await getPsychologistPatients()

    return (
        <div className="container py-8">
            <PatientsManager initialPatients={patients} />
        </div>
    )
}
