import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Sentirz',
  description: 'Saiba como a Sentirz protege sua privacidade e seus dados de saúde mental.',
}

export default function PrivacidadePage() {
  const lastUpdate = '19 de Março de 2026'

  return (
    <div className="bg-slate-50 min-h-screen py-16 md:py-24">
      <div className="container max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100">
          <header className="mb-12 border-b border-slate-100 pb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
              Política de Privacidade
            </h1>
            <p className="text-slate-500 font-medium">
              Última atualização: <span className="text-slate-900 font-bold">{lastUpdate}</span>
            </p>
          </header>

          <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900 prose-li:text-slate-600">
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">1. Nosso Compromisso com sua Privacidade</h2>
              <p>
                Na Sentirz, sua privacidade e o sigilo de suas informações de saúde mental são nossa
                prioridade máxima. Esta política detalha como coletamos, protegemos e utilizamos
                seus dados pessoais no cumprimento das leis vigentes, em especial a **LGPD (Lei
                Geral de Proteção de Dados)**.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">2. Dados que Coletamos</h2>
              <p>
                Coletamos apenas as informações necessárias para prestar nossos serviços de forma
                eficaz e segura:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-sm md:text-base">
                <li>
                  <strong>Informações de Cadastro:</strong> Nome completo, e-mail, telefone, CPF e
                  data de nascimento.
                </li>
                <li>
                  <strong>Dados de Saúde (Sensíveis):</strong> Anotações de prontuário, evoluções e
                  histórico de sessões (estas informações são visíveis apenas ao profissional
                  responsável pelo seu atendimento).
                </li>
                <li>
                  <strong>Vídeo e Áudio:</strong> Nossas chamadas de vídeo via Daily.co são
                  criptografadas e **não são gravadas**.
                </li>
                <li>
                  <strong>Dados de Pagamento:</strong> Processados de forma segura e criptografada
                  pelo Stripe. Não armazenamos os dados completos do seu cartão em nossos
                  servidores.
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">3. Como Protegemos seus Dados</h2>
              <p>Utilizamos tecnologias de ponta para garantir a segurança de suas informações:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-sm md:text-base">
                <li>Criptografia SSL/TLS em trânsito para todas as comunicações.</li>
                <li>Criptografia de dados sensíveis em repouso (Base de Dados Supabase).</li>
                <li>
                  Controle rigoroso de acesso (RLS - Row Level Security) garantindo que apenas você
                  e seu terapeuta acessem seus dados de consulta.
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">4. Seus Direitos como Titular</h2>
              <p>
                De acordo com a LGPD, você possui diversos direitos em relação aos seus dados
                pessoais, incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-sm md:text-base">
                <li>Acesso aos seus dados e correção de informações incompletas.</li>
                <li>
                  Eliminação dos dados (com exceção de prontuários que possuam períodos legais
                  mínimos de guarda conforme normas do CFP/CRM).
                </li>
                <li>Revogação do consentimento para tratamento de dados a qualquer momento.</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">5. Compartilhamento de Informações</h2>
              <p>
                <strong>Nunca vendemos seus dados para terceiros.</strong> O compartilhamento ocorre
                apenas com provedores de serviço necessários para a operação da plataforma (ex:
                Stripe para pagamentos, Resend para e-mails de sistema) e sempre sob acordos de
                confidencialidade rigorosos.
              </p>
            </section>

            <footer className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
              <p className="text-sm font-medium text-slate-500 mb-0">
                Questões sobre Privacidade? Fale com nosso encarregado de dados:
                <a
                  href="mailto:privacidade@sentirz.com.br"
                  className="text-blue-600 font-bold ml-1 hover:underline"
                >
                  privacidade@sentirz.com.br
                </a>
              </p>
            </footer>
          </article>
        </div>
      </div>
    </div>
  )
}
