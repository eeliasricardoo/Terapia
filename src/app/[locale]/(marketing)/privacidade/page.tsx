import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Sentirz',
  description:
    'Saiba como a Sentirz protege sua privacidade e seus dados de saúde mental em conformidade com a LGPD.',
}

export default function PrivacidadePage() {
  const lastUpdate = '17 de Abril de 2026'

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
            <p className="text-sm text-slate-400 mt-2">
              Sentirz Tecnologia em Saúde LTDA — CNPJ: [a ser preenchido]
            </p>
          </header>

          <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-900 prose-li:text-slate-600">
            {/* 1. Compromisso */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">1. Nosso Compromisso com sua Privacidade</h2>
              <p>
                Na Sentirz, sua privacidade e o sigilo de suas informações de saúde mental são nossa
                prioridade máxima. Esta política detalha como coletamos, protegemos, utilizamos e
                compartilhamos seus dados pessoais em conformidade com a{' '}
                <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>, o{' '}
                <strong>
                  Código de Ética Profissional do Psicólogo (Resolução CFP nº 10/2005)
                </strong>{' '}
                e a <strong>Resolução CFP nº 11/2018</strong> sobre atendimento psicológico online.
              </p>
            </section>

            {/* 2. Controlador e DPO */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                2. Controlador de Dados e Encarregado (DPO)
              </h2>
              <p>
                Nos termos da LGPD, a <strong>Sentirz Tecnologia em Saúde LTDA</strong> é a{' '}
                <strong>controladora</strong> dos seus dados pessoais. O encarregado pela proteção
                de dados pessoais (DPO) pode ser contatado através do e-mail:
              </p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-3">
                <p className="text-sm font-medium text-slate-700 mb-0">
                  📧 Encarregado de Dados (DPO):{' '}
                  <a
                    href="mailto:privacidade@sentirz.com.br"
                    className="text-blue-600 font-bold hover:underline"
                  >
                    privacidade@sentirz.com.br
                  </a>
                </p>
              </div>
            </section>

            {/* 3. Dados Coletados */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">3. Dados que Coletamos</h2>
              <p>
                Coletamos apenas as informações estritamente necessárias para a prestação de nossos
                serviços (princípio da necessidade — LGPD Art. 6º, III):
              </p>

              <h3 className="text-lg font-bold mt-6 mb-3">3.1. Dados Pessoais</h3>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-sm md:text-base">
                <li>
                  <strong>Dados de Cadastro:</strong> Nome completo, e-mail, telefone, CPF e data de
                  nascimento.
                </li>
                <li>
                  <strong>Dados de Pagamento:</strong> Processados pelo Stripe (PCI-DSS nível 1).
                  Não armazenamos dados completos de cartão em nossos servidores.
                </li>
                <li>
                  <strong>Dados de Uso:</strong> Logs de acesso, horários de sessão e preferências
                  de navegação (para melhoria do serviço).
                </li>
              </ul>

              <h3 className="text-lg font-bold mt-6 mb-3">
                3.2. Dados Sensíveis de Saúde (LGPD Art. 11)
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3 mb-4">
                <p className="text-sm text-amber-800 font-medium mb-0">
                  ⚠️ Tratamos dados sensíveis de saúde com{' '}
                  <strong>consentimento explícito específico</strong> (LGPD Art. 11, I) e mediante{' '}
                  <strong>obrigação legal regulatória</strong> (LGPD Art. 11, II, &quot;a&quot;).
                </p>
              </div>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>
                  <strong>Prontuários e Evoluções:</strong> Anotações clínicas registradas pelo seu
                  psicólogo durante o tratamento. Visíveis apenas para o profissional responsável.
                </li>
                <li>
                  <strong>Diário Emocional:</strong> Registros de humor e emoções (preenchimento
                  voluntário pelo paciente).
                </li>
                <li>
                  <strong>Anamnese:</strong> Histórico familiar, medicações em uso e hipóteses
                  diagnósticas.
                </li>
                <li>
                  <strong>Vídeo e Áudio:</strong> Sessões de vídeo são criptografadas em trânsito
                  via Daily.co e <strong>NÃO são gravadas ou armazenadas</strong>.
                </li>
              </ul>
            </section>

            {/* 4. Base Legal */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">4. Base Legal para Tratamento</h2>
              <p>Tratamos seus dados com base nas seguintes hipóteses da LGPD:</p>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 font-bold text-slate-700 border-b">
                        Tipo de Dado
                      </th>
                      <th className="text-left p-3 font-bold text-slate-700 border-b">
                        Base Legal (LGPD)
                      </th>
                      <th className="text-left p-3 font-bold text-slate-700 border-b">
                        Finalidade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-3">Dados de cadastro</td>
                      <td className="p-3">Art. 7º, V — Execução de contrato</td>
                      <td className="p-3">Criar e gerenciar sua conta</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3">Dados de saúde</td>
                      <td className="p-3">Art. 11, I — Consentimento específico</td>
                      <td className="p-3">Atendimento psicológico</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3">Prontuários</td>
                      <td className="p-3">Art. 11, II, &quot;a&quot; — Obrigação regulatória</td>
                      <td className="p-3">Guarda obrigatória (Resolução CFP 001/2009)</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3">Dados de pagamento</td>
                      <td className="p-3">Art. 7º, V — Execução de contrato</td>
                      <td className="p-3">Processar pagamentos de sessões</td>
                    </tr>
                    <tr>
                      <td className="p-3">Dados de uso</td>
                      <td className="p-3">Art. 7º, IX — Legítimo interesse</td>
                      <td className="p-3">Melhorar a experiência do produto</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 5. Proteção */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">5. Como Protegemos seus Dados</h2>
              <p>
                Utilizamos medidas técnicas e organizacionais alinhadas ao estado da arte em
                segurança da informação:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-sm md:text-base">
                <li>
                  <strong>Criptografia em trânsito:</strong> TLS 1.3 para todas as comunicações
                  (HTTPS obrigatório com HSTS).
                </li>
                <li>
                  <strong>Criptografia em repouso:</strong> Dados sensíveis de saúde (prontuários,
                  evoluções, anamnese) são criptografados com AES-256-GCM antes de serem armazenados
                  no banco de dados.
                </li>
                <li>
                  <strong>Controle de Acesso:</strong> Row Level Security (RLS) no Supabase
                  garantindo que apenas você e seu psicólogo acessem seus dados clínicos.
                </li>
                <li>
                  <strong>Rate Limiting:</strong> Proteção contra ataques de força bruta com
                  limitação por IP e por conta, com fallback em memória.
                </li>
                <li>
                  <strong>Content Security Policy (CSP):</strong> Prevenção contra ataques XSS via
                  nonce dinâmico.
                </li>
                <li>
                  <strong>Monitoramento:</strong> Logs de auditoria imutáveis para rastrear acesso a
                  dados sensíveis.
                </li>
                <li>
                  <strong>Sanitização de Input:</strong> Todo input do usuário é sanitizado antes de
                  ser processado para prevenir injeção de código.
                </li>
              </ul>
            </section>

            {/* 6. Retenção */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">6. Retenção e Eliminação de Dados</h2>
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-3 font-bold text-slate-700 border-b">
                        Tipo de Dado
                      </th>
                      <th className="text-left p-3 font-bold text-slate-700 border-b">
                        Período de Retenção
                      </th>
                      <th className="text-left p-3 font-bold text-slate-700 border-b">
                        Fundamento
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-3">Dados de cadastro</td>
                      <td className="p-3">Enquanto a conta estiver ativa</td>
                      <td className="p-3">Execução de contrato</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3">Prontuários/Evoluções</td>
                      <td className="p-3 font-bold text-amber-700">
                        Mínimo 5 anos após último atendimento
                      </td>
                      <td className="p-3">Resolução CFP 001/2009</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3">Registros financeiros</td>
                      <td className="p-3">5 anos</td>
                      <td className="p-3">Código Tributário Nacional</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="p-3">Diário emocional</td>
                      <td className="p-3">Enquanto a conta estiver ativa</td>
                      <td className="p-3">Consentimento do titular</td>
                    </tr>
                    <tr>
                      <td className="p-3">Logs de auditoria</td>
                      <td className="p-3">5 anos</td>
                      <td className="p-3">Legítimo interesse / compliance</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm">
                Ao solicitar a exclusão da conta, seus dados pessoais são removidos imediatamente.
                Registros clínicos são <strong>anonimizados</strong> (não eliminados) para cumprir a
                obrigação legal de guarda.
              </p>
            </section>

            {/* 7. Direitos do Titular */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">
                7. Seus Direitos como Titular (LGPD Art. 18)
              </h2>
              <p>Você pode exercer os seguintes direitos a qualquer momento:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-sm md:text-base">
                <li>
                  <strong>Acesso:</strong> Solicitar uma cópia de todos os dados que mantemos sobre
                  você.
                </li>
                <li>
                  <strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados.
                </li>
                <li>
                  <strong>Exclusão:</strong> Solicitar a eliminação dos seus dados pessoais
                  (disponível em{' '}
                  <Link
                    href="/dashboard/ajustes"
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Configurações → Excluir Conta
                  </Link>
                  ).
                </li>
                <li>
                  <strong>Portabilidade:</strong> Solicitar a transferência dos seus dados para
                  outro fornecedor.
                </li>
                <li>
                  <strong>Revogação do Consentimento:</strong> Revogar o consentimento para
                  tratamento de dados sensíveis a qualquer momento.
                </li>
                <li>
                  <strong>Oposição:</strong> Opor-se ao tratamento baseado em legítimo interesse.
                </li>
                <li>
                  <strong>Informação:</strong> Ser informado sobre entidades públicas ou privadas
                  com as quais compartilhamos seus dados.
                </li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4">
                <p className="text-sm text-blue-800 font-medium mb-0">
                  Para exercer qualquer direito, entre em contato via{' '}
                  <a href="mailto:privacidade@sentirz.com.br" className="font-bold hover:underline">
                    privacidade@sentirz.com.br
                  </a>{' '}
                  ou diretamente nas configurações da sua conta. Respondemos dentro de{' '}
                  <strong>15 dias úteis</strong>.
                </p>
              </div>
            </section>

            {/* 8. Compartilhamento */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">8. Compartilhamento de Dados</h2>
              <p>
                <strong>Nunca vendemos seus dados para terceiros.</strong> O compartilhamento ocorre
                apenas com operadores essenciais para a prestação do serviço:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-sm md:text-base">
                <li>
                  <strong>Stripe Inc.:</strong> Processamento de pagamentos (PCI-DSS nível 1).
                </li>
                <li>
                  <strong>Supabase Inc.:</strong> Banco de dados e autenticação (SOC 2 Type II).
                </li>
                <li>
                  <strong>Daily.co:</strong> Infraestrutura de vídeo (criptografia end-to-end).
                </li>
                <li>
                  <strong>Resend:</strong> Envio de e-mails transacionais (confirmações, lembretes).
                </li>
                <li>
                  <strong>Sentry:</strong> Monitoramento de erros (dados pessoais são filtrados
                  antes do envio).
                </li>
                <li>
                  <strong>Vercel:</strong> Hospedagem e CDN (SOC 2 Type II).
                </li>
              </ul>
              <p className="mt-3 text-sm">
                Todos os operadores possuem cláusulas contratuais de proteção de dados e estão em
                conformidade com frameworks internacionais equivalentes à LGPD (GDPR, CCPA).
              </p>
            </section>

            {/* 9. Transferência Internacional */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">9. Transferência Internacional de Dados</h2>
              <p>
                Alguns de nossos operadores podem processar dados fora do Brasil (LGPD Art. 33). A
                transferência é permitida porque:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-sm md:text-base">
                <li>Os países de destino possuem legislação compatível (GDPR na Europa).</li>
                <li>
                  Os operadores oferecem garantias contratuais de proteção equivalente (Standard
                  Contractual Clauses).
                </li>
                <li>Dados sensíveis de saúde são criptografados antes da transferência.</li>
              </ul>
            </section>

            {/* 10. Cookies */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">10. Cookies e Tecnologias de Rastreamento</h2>
              <p>Utilizamos cookies estritamente necessários para:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-sm md:text-base">
                <li>
                  <strong>Autenticação:</strong> Manter sua sessão ativa de forma segura (Supabase
                  Auth).
                </li>
                <li>
                  <strong>Preferência de idioma:</strong> Lembrar sua escolha de idioma (pt/es).
                </li>
                <li>
                  <strong>Analytics:</strong> Vercel Analytics e Speed Insights para métricas
                  agregadas de performance (sem dados pessoais identificáveis).
                </li>
              </ul>
              <p className="mt-3 text-sm">
                Não utilizamos cookies de publicidade, remarketing ou rastreamento comportamental.
              </p>
            </section>

            {/* 11. Menores */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">11. Dados de Menores de Idade</h2>
              <p>
                O atendimento psicológico de menores de 18 anos deve ser autorizado pelo responsável
                legal, conforme Art. 14 da LGPD. O consentimento do responsável é coletado durante o
                processo de cadastro quando a data de nascimento indicar menor de idade.
              </p>
            </section>

            {/* 12. Incidentes */}
            <section className="mb-10">
              <h2 className="text-2xl font-bold mb-4">12. Incidentes de Segurança</h2>
              <p>
                Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos
                titulares, seguimos o procedimento previsto no Art. 48 da LGPD:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4 text-sm md:text-base">
                <li>
                  Comunicação à <strong>ANPD</strong> (Autoridade Nacional de Proteção de Dados) em
                  prazo razoável.
                </li>
                <li>
                  Notificação aos titulares afetados com descrição do incidente e medidas adotadas.
                </li>
                <li>Registro interno do incidente e ações corretivas.</li>
              </ul>
            </section>

            {/* 13. Alterações */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">13. Alterações nesta Política</h2>
              <p>
                Reservamo-nos o direito de atualizar esta política para refletir mudanças em nossas
                práticas ou em requisitos legais. Alterações significativas serão comunicadas por
                e-mail ou notificação na plataforma com <strong>30 dias de antecedência</strong>.
              </p>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-2">
              <p className="text-sm font-medium text-slate-500 mb-0">
                Questões sobre Privacidade? Fale com nosso encarregado de dados:
                <a
                  href="mailto:privacidade@sentirz.com.br"
                  className="text-blue-600 font-bold ml-1 hover:underline"
                >
                  privacidade@sentirz.com.br
                </a>
              </p>
              <p className="text-xs text-slate-400">
                Sentirz Tecnologia em Saúde LTDA — Esta política está em conformidade com a Lei nº
                13.709/2018 (LGPD).
              </p>
            </footer>
          </article>
        </div>
      </div>
    </div>
  )
}
