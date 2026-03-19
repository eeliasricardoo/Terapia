/**
 * Este arquivo contém geradores de HTML para e-mails institucionais
 * Garantindo uma experiência visual premium para os usuários.
 */

const baseStyles = `
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #334155;
  background-color: #f8fafc;
  padding: 40px 20px;
`

const containerStyles = `
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
`

const footerContent = `
  <div style="padding: 30px; text-align: center; font-size: 12px; color: #94a3b8;">
    <p>© ${new Date().getFullYear()} Terapia Plataforma. Todos os direitos reservados.</p>
    <p>Rua Digital, 123 - São Paulo, SP</p>
    <p><a href="#" style="color: #2563eb; text-decoration: none;">Termos de Uso</a> • <a href="#" style="color: #2563eb; text-decoration: none;">Política de Privacidade</a></p>
  </div>
`

export function getWelcomeEmailTemplate(name: string) {
  return `
    <div style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="background-color: #2563eb; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Bem-vindo à Terapia! 🌊</h1>
        </div>
        
        <div style="padding: 40px;">
          <h2 style="color: #0f172a; margin-top: 0;">Olá, ${name}!</h2>
          <p>Estamos muito felizes em ter você conosco em sua jornada de autocuidado.</p>
          <p>Na Terapia, nossa missão é conectar você aos melhores profissionais de saúde mental com total segurança e sigilo.</p>
          
          <div style="margin: 30px 0; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; background-color: #f1f5f9;">
            <p style="margin-top: 0; font-weight: bold; color: #1e293b;">O que fazer agora?</p>
            <ul style="margin-bottom: 0; padding-left: 20px;">
              <li>Explore nossa lista de psicólogos</li>
              <li>Realize seu quiz de preferências</li>
              <li>Agende sua primeira sessão experimental</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/busca" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 40px; text-decoration: none; font-weight: bold; display: inline-block;">
              Buscar Psicólogos Agora
            </a>
          </div>
        </div>

        <div style="border-top: 1px solid #f1f5f9;">
          ${footerContent}
        </div>
      </div>
    </div>
  `
}

export function getAppointmentConfirmedTemplate({
  patientName,
  psychologistName,
  dateFormatted,
  time,
  meetingUrl,
}: {
  patientName: string
  psychologistName: string
  dateFormatted: string
  time: string
  meetingUrl?: string
}) {
  return `
    <div style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="background-color: #059669; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Sessão Confirmada! ✅</h1>
        </div>
        
        <div style="padding: 40px;">
          <h2 style="color: #0f172a; margin-top: 0;">Olá, ${patientName}!</h2>
          <p>Seu agendamento foi realizado com sucesso. Aqui estão os detalhes da sua sessão:</p>
          
          <div style="margin: 30px 0; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; background-color: #f0fdf4;">
            <p style="margin: 0; font-size: 14px; color: #15803d; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Detalhes</p>
            <h3 style="margin: 10px 0 5px 0; color: #064e3b;">${psychologistName}</h3>
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #065f46;">${dateFormatted} às ${time}</p>
          </div>

          ${
            meetingUrl
              ? `
            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 14px; color: #64748b; margin-bottom: 15px;">A sala de atendimento estará disponível 15 minutos antes do horário:</p>
              <a href="${meetingUrl}" style="background-color: #059669; color: #ffffff; padding: 16px 32px; border-radius: 40px; text-decoration: none; font-weight: bold; display: inline-block; shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                Entrar na Sala Virtual
              </a>
            </div>
          `
              : `
            <p style="font-size: 14px; color: #64748b;">Você receberá o link da sala virtual 1 hora antes do início da sessão.</p>
          `
          }

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px dashed #cbd5e1;">
             <p style="font-size: 13px; color: #94a3b8;">Lembrete: Cancelamentos com menos de 24 horas de antecedência possuem taxa conforme nossos Termos de Uso.</p>
          </div>
        </div>

        <div style="border-top: 1px solid #f1f5f9;">
          ${footerContent}
        </div>
      </div>
    </div>
  `
}
