import { getPatientPublicEvolutions } from "@/lib/actions/evolutions"
import { ProntuarioClient } from "./prontuario-client"

export default async function PatientProntuarioPage() {
    const evolutions = await getPatientPublicEvolutions()

    return <ProntuarioClient evolutions={evolutions} />
}
