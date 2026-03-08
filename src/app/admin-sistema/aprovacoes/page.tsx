import { getPendingPsychologists } from '@/lib/actions/admin'
import { ApprovalList } from '../_components/ApprovalList'

export const dynamic = 'force-dynamic'

export default async function ApprovalsPage() {
  const pending = await getPendingPsychologists()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900">Aprovações Pendentes</h2>
        <p className="text-neutral-500 mb-6 font-medium">
          Os psicólogos abaixo aguardam verificação de documentos para atuar na plataforma.
        </p>

        {pending.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center bg-white shadow-sm">
            <p className="text-neutral-500 font-medium">
              Não há psicólogos pendentes de aprovação no momento.
            </p>
          </div>
        ) : (
          <ApprovalList initialPending={pending} />
        )}
      </div>
    </div>
  )
}
