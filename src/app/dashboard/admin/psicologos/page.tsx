import { getAllPsychologists } from '@/lib/actions/admin'
import { PsychologistList } from '../_components/PsychologistList'

export const dynamic = 'force-dynamic'

export default async function PsychologistsPage() {
  const res = await getAllPsychologists()
  const allPsychologists = res.success ? res.data : []

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900">Gerenciar Psicólogos</h2>
        <p className="text-neutral-500 mb-6 font-medium">
          Lista de todos os psicólogos cadastrados na plataforma.
        </p>

        <PsychologistList psychologists={allPsychologists} />
      </div>
    </div>
  )
}
