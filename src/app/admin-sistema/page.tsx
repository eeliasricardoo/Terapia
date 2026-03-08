import { getAdminStats, getPendingPsychologists } from '@/lib/actions/admin'
import { ApprovalList } from './_components/ApprovalList'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()
  const pending = await getPendingPsychologists()

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900">Visão Geral</h2>
        <p className="text-neutral-500 mb-6 font-medium">Métricas em tempo real da plataforma.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Pacientes" value={stats.totalPatients} />
          <StatCard title="Psicólogos" value={stats.totalPsychologists} />
          <StatCard title="Aguardando Aprovação" value={stats.pendingPsychologists} highlight />
          <StatCard title="Consultas Ativas" value={stats.activeAppointments} />
          <StatCard title="Ativos Hoje" value={stats.activeUsersToday} />
          <StatCard
            title="Receita Geração"
            value={`R$ ${stats.totalRevenue.toFixed(2).replace('.', ',')}`}
          />
        </div>
      </div>

      <div className="pt-8 border-t border-neutral-200">
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900">Aprovações Pendentes</h2>
        <p className="text-neutral-500 mb-6 font-medium">
          Os psicólogos abaixo aguardam verificação de documentos para atuar na plataforma.
        </p>

        {pending.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center bg-neutral-50">
            <p className="text-neutral-500">Não há psicólogos pendentes de aprovação no momento.</p>
          </div>
        ) : (
          <ApprovalList initialPending={pending} />
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  highlight = false,
}: {
  title: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div
      className={`p-6 rounded-lg border ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-white border-neutral-200'} shadow-sm`}
    >
      <p className="text-sm font-medium text-neutral-500">{title}</p>
      <div className={`mt-2 text-3xl font-bold ${highlight ? 'text-primary' : 'text-neutral-900'}`}>
        {value}
      </div>
    </div>
  )
}
