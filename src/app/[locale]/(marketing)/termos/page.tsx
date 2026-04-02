import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso | Sentirz',
  description: 'Leia os termos de uso e condições da plataforma Sentirz.',
}

export default function TermosPage() {
  const lastUpdate = '19 de Março de 2026'

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
                intermediários, facilitando o agendamento, pagamento e a tecnologia de comunicação.
              </p>
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
                  O uso da plataforma por menores de 18 anos deve ser autorizado pelos responsáveis.
                </li>
                <li>
                  Você concorda em nos notificar imediatamente sobre qualquer acesso não autorizado
                  à sua conta.
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">4. Política de Pagamentos e Reembolsos</h2>
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
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">5. Responsabilidades do Profissional</h2>
              <p>
                Todos os profissionais cadastrados na Sentirz são responsáveis pela veracidade de
                seus dados e pela manutenção de sua inscrição ativa nos órgãos de classe (CRP). A
                plataforma realiza uma verificação inicial, mas a conduta ética e profissional é de
                inteira responsabilidade do psicólogo.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">6. Modificações dos Termos</h2>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Modificações
                entrarão em vigor imediatamente após sua publicação na plataforma. Seu uso
                continuado da plataforma após tais mudanças constituirá sua aceitação dos novos
                termos.
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
