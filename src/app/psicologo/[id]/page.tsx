import { getPsychologistById } from "@/lib/actions/psychologists"
import { getPsychologistAvailability } from "@/lib/actions/availability"
import { notFound } from "next/navigation"
import { PsychologistProfileClient } from "./PsychologistProfileClient"

interface PageProps {
    params: {
        id: string
    }
}

export default async function PsychologistProfilePage({ params }: PageProps) {
    // Fetch psychologist data from database
    const psychologist = await getPsychologistById(params.id)

    // If psychologist not found, show 404
    if (!psychologist) {
        notFound()
    }

    // Pass data to client component for interactivity
    const availability = await getPsychologistAvailability(psychologist.id)

    return <PsychologistProfileClient psychologist={psychologist} availability={availability} />
}
