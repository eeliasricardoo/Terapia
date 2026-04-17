import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Termos de Uso | Sentirz',
  description: 'Termos de uso e condições da plataforma Sentirz — telemedicina em saúde mental.',
}

export default function TermosPage() {
  const lastUpdate = '17 de Abril de 2026'

  return (
    <div className="bg-slate-50 min-h-screen py-16 md:py-24">
      <div className="container max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <header className="mb-12 border-b border-slate-100 pb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              Termos de Uso
            </h1>
            <p className="text-slate-500 font-medium">
              Última atualização: <span className="text-slate-900 font-bold">{lastUpdate}</span>
            </p>
          </header>

          <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900 prose-li:text-slate-600">
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e utilizar a plataforma Sentirz, você concorda em cumprir e estar
                vinculado aos seguintes Termos de Uso. Se você não concordar com qualquer parte
                destes termos, não deverá utilizar nossos serviços.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">2. Descrição do Serviço</h2>
              <p>
                Sentirz é uma plataforma tecnológica que conecta pacientes a profissionais de saúde
                mental (psicólogos) para a realização de sessões de vídeo-atendimento. Atuamos como
                intermediários tecnológicos, facilitando o agendamento, pagamento e a tecnologia de
                comunicação.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
                <p className="text-sm text-amber-800 font-medium mb-0">
                  ⚠️ <strong>Importante:</strong> A Sentirz NÃO é um serviço médico ou de
                  emergência. Em caso de crise ou emergência psicológica, ligue para o{' '}
                  <strong>CVV: 188</strong> ou procure atendimento presencial imediato.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">3. Cadastro e Segurança</h2>
              <p>
                Para utilizar a plataforma, é necessário criar uma conta fornecendo informações
                precisas e completas. Você é responsável por manter a confidencialidade de sua senha
                e por todas as atividades que ocorrem em sua conta.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>
                  O uso da plataforma por menores de 18 anos deve ser expressamente autorizado e
                  supervisionado pelos responsáveis legais, conforme Art. 14 da LGPD.
                </li>
                <li>
                  Você concorda em nos notificar imediatamente sobre qualquer acesso não autorizado
                  à sua conta.
                </li>
                <li>
                  Informações falsas ou fraudulentas podem resultar no cancelamento imediato da
                  conta.
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                4. Consentimento para Tratamento de Dados Sensíveis
              </h2>
              <p>
                Ao utilizar a Sentirz para sessões de terapia, você consente de forma{' '}
                <strong>específica, informada e destacada</strong> com o tratamento de dados
                sensíveis de saúde (LGPD Art. 11, I), incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>
                  Armazenamento de anotações de prontuário pelo seu psicólogo (criptografadas com
                  AES-256-GCM).
                </li>
                <li>Processamento de registros de evolução clínica.</li>
                <li>Armazenamento voluntário de diário emocional e dados de humor.</li>
              </ul>
              <p className="mt-3">
                Você pode revogar este consentimento a qualquer momento nas{' '}
                <Link href="/dashboard/ajustes" className="text-blue-600 font-bold hover:underline">
                  configurações da sua conta
                </Link>
                , ou entrando em contato com nosso DPO em{' '}
                <a
                  href="mailto:privacidade@sentirz.com.br"
                  className="text-blue-600 font-bold hover:underline"
                >
                  privacidade@sentirz.com.br
                </a>
                . Para detalhes completos, consulte nossa{' '}
                <Link href="/privacidade" className="text-blue-600 font-bold hover:underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">5. Política de Pagamentos e Reembolsos</h2>
              <p>Os pagamentos das sessões são processados de forma segura através do Stripe.</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>
                  <strong>Cancelamento:</strong> Sessões canceladas com mais de 24 horas de
                  antecedência são reembolsadas integralmente ou o crédito pode ser reutilizado.
                </li>
                <li>
                  <strong>Faltas:</strong> Em caso de falta sem aviso prévio ou cancelamento com
                  menos de 24 horas, será cobrada uma taxa de 50% do valor da sessão devido ao tempo
                  reservado pelo profissional.
                </li>
                <li>
                  <strong>Reembolsos:</strong> Processados via Stripe em até 5-10 dias úteis,
                  dependendo da operadora do cartão.
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">6. Responsabilidades do Profissional</h2>
              <p>
                Todos os profissionais cadastrados na Sentirz são responsáveis pela veracidade de
                seus dados e pela manutenção de sua inscrição ativa nos órgãos de classe (CRP). A
                plataforma realiza uma verificação inicial de documentos (CRP e diploma), mas a
                conduta ética e profissional é de inteira responsabilidade do psicólogo, nos termos
                da Resolução CFP nº 10/2005.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">7. Sigilo Profissional</h2>
              <p>
                A Sentirz garante a infraestrutura tecnológica para a manutenção do sigilo
                profissional previsto no Art. 9 do Código de Ética do Psicólogo. As sessões de vídeo
                são criptografadas, os prontuários são criptografados em repouso, e o acesso aos
                dados clínicos é restrito ao profissional responsável.
              </p>
              <p className="mt-2">
                A Sentirz, enquanto operadora de tecnologia, não acessa o conteúdo das sessões de
                vídeo nem o conteúdo dos prontuários dos pacientes.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">8. Exclusão de Conta e Dados</h2>
              <p>
                Conforme a LGPD Art. 18, você pode solicitar a exclusão da sua conta e dados
                pessoais a qualquer momento através das{' '}
                <Link href="/dashboard/ajustes" className="text-blue-600 font-bold hover:underline">
                  configurações da sua conta
                </Link>
                .
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-3">
                <p className="text-sm text-blue-800 font-medium mb-0">
                  <strong>Nota:</strong> Registros clínicos (prontuários e evoluções) serão
                  anonimizados conforme Resolução CFP 001/2009, que determina a guarda mínima de 5
                  anos. Dados pessoais identificáveis são removidos imediatamente.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">9. Modificações dos Termos</h2>
              <p>
                Reservamo-nos o direito de modificar estes termos. Modificações significativas serão
                comunicadas por e-mail ou notificação na plataforma com{' '}
                <strong>30 dias de antecedência</strong>. Seu uso continuado da plataforma após o
                período de aviso constituirá sua aceitação dos novos termos.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">10. Foro e Legislação Aplicável</h2>
              <p>
                Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer
                litígio será submetido ao foro da comarca de [a ser preenchido], Brasil, com
                renúncia a qualquer outro.
              </p>
            </section>

            <footer className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
              <p className="text-sm font-medium text-slate-500 mb-0">
                Dúvidas sobre os Termos? Entre em contato conosco através do e-mail:
                <a
                  href="mailto:ajuda@sentirz.com.br"
                  className="text-blue-600 font-bold ml-1 hover:underline"
                >
                  ajuda@sentirz.com.br
                </a>
              </p>
            </footer>
          </article>
        </div>
      </div>
    </div>
  )
}
