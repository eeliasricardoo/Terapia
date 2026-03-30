/**
 * Este arquivo contém geradores de HTML para e-mails institucionais
 * Garantindo uma experiência visual premium para os usuários.
 */

export const getStyledEmailTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4a7c7c 0%, #3b82f6 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em; }
    .content { padding: 40px 30px; background: #ffffff; }
    .footer { padding: 20px; text-align: center; background: #f8fafc; font-size: 12px; color: #94a3b8; }
    .button { display: inline-block; padding: 12px 24px; background: #0f172a; color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Sentirz</h1>
    </div>
    <div class="content">
      <h2 style="color: #0f172a; margin-top: 0;">${title}</h2>
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Sentirz. Todos os direitos reservados.<br>
      Sua jornada de autocuidado começa aqui.
    </div>
  </div>
</body>
</html>
`

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
    <p>© ${new Date().getFullYear()} Sentirz. Todos os direitos reservados.</p>
    <p>Rua Digital, 123 - São Paulo, SP</p>
    <p><a href="#" style="color: #2563eb; text-decoration: none;">Termos de Uso</a> • <a href="#" style="color: #2563eb; text-decoration: none;">Política de Privacidade</a></p>
  </div>
`

export function getWelcomeEmailTemplate(name: string) {
  return `
    <div style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="background-color: #2563eb; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Bem-vindo à Sentirz! 🌊</h1>
        </div>
        
        <div style="padding: 40px;">
          <h2 style="color: #0f172a; margin-top: 0;">Olá, ${name}!</h2>
          <p>Estamos muito felizes em ter você conosco em sua jornada de autocuidado.</p>
          <p>Na Sentirz, nossa missão é conectar você aos melhores profissionais de saúde mental com total segurança e sigilo.</p>
          
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

export function getApprovalEmailTemplate(name: string, crp: string) {
  return `
    <div style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="background-color: #2563eb; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Conta Aprovada! 🩺</h1>
        </div>
        
        <div style="padding: 40px;">
          <h2 style="color: #0f172a; margin-top: 0;">Excelente notícia, ${name}!</h2>
          <p>A equipe da Sentirz verificou e aprovou seu cadastro (CRP: ${crp}).</p>
          <p>A partir de agora, seu perfil já está visível para agendamentos na plataforma.</p>
          
          <div style="margin: 30px 0; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; background-color: #f1f5f9;">
            <p style="margin-top: 0; font-weight: bold; color: #1e293b;">Próximos passos:</p>
            <ul style="margin-bottom: 0; padding-left: 20px;">
              <li>Configure sua grade de horários</li>
              <li>Complete sua bio e foto de perfil</li>
              <li>Defina seus valores por sessão</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenda" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 40px; text-decoration: none; font-weight: bold; display: inline-block;">
              Configurar minha Agenda
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

export function getRejectionEmailTemplate(name: string, reason: string) {
  return `
    <div style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="background-color: #ef4444; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Cadastro não Aprovado ❌</h1>
        </div>
        
        <div style="padding: 40px;">
          <h2 style="color: #0f172a; margin-top: 0;">Olá, ${name}.</h2>
          <p>Infelizmente não pudemos aprovar o seu cadastro profissional neste momento.</p>
          
          <div style="margin: 30px 0; border: 1px solid #fee2e2; border-radius: 16px; padding: 20px; background-color: #fef2f2;">
            <p style="margin-top: 0; font-weight: bold; color: #b91c1c;">Motivo da Recusa:</p>
            <p style="color: #991b1b; margin-bottom: 0;">${reason}</p>
          </div>

          <p>Você pode tentar se cadastrar novamente após corrigir os apontamentos acima ou entrar em contato com nosso suporte.</p>
          
          <div style="text-align: center; margin-top: 40px;">
            <a href="mailto:ajuda@mindcares.com.br" style="background-color: #f1f5f9; color: #475569; padding: 14px 28px; border-radius: 40px; text-decoration: none; font-weight: bold; display: inline-block; border: 1px solid #e2e8f0;">
              Falar com o Suporte
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
export function getCancellationEmailForPatient({
  patientName,
  psychologistName,
  dateFormatted,
  time,
}: {
  patientName: string
  psychologistName: string
  dateFormatted: string
  time: string
}) {
  return `
    <div style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="background-color: #dc2626; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Sessão Cancelada ❌</h1>
        </div>

        <div style="padding: 40px;">
          <h2 style="color: #0f172a; margin-top: 0;">Olá, ${patientName}!</h2>
          <p>Informamos que a seguinte sessão foi cancelada:</p>

          <div style="margin: 30px 0; border: 1px solid #fee2e2; border-radius: 16px; padding: 25px; background-color: #fef2f2;">
            <p style="margin: 0; font-size: 14px; color: #b91c1c; font-weight: bold; text-transform: uppercase;">Sessão Cancelada</p>
            <h3 style="margin: 10px 0 5px 0; color: #7f1d1d;">${psychologistName}</h3>
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #991b1b;">${dateFormatted} às ${time}</p>
          </div>

          <p style="color: #64748b;">Se precisar reagendar, acesse sua conta e escolha um novo horário disponível.</p>

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 40px; text-decoration: none; font-weight: bold; display: inline-block;">
              Acessar Minha Conta
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

export function getCancellationEmailForPsychologist({
  psychologistName,
  patientName,
  dateFormatted,
  time,
}: {
  psychologistName: string
  patientName: string
  dateFormatted: string
  time: string
}) {
  return `
    <div style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="background-color: #dc2626; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Sessão Cancelada ❌</h1>
        </div>

        <div style="padding: 40px;">
          <h2 style="color: #0f172a; margin-top: 0;">Olá, Dr(a). ${psychologistName}!</h2>
          <p>O paciente <strong>${patientName}</strong> cancelou a seguinte sessão:</p>

          <div style="margin: 30px 0; border: 1px solid #fee2e2; border-radius: 16px; padding: 25px; background-color: #fef2f2;">
            <p style="margin: 0; font-size: 14px; color: #b91c1c; font-weight: bold; text-transform: uppercase;">Sessão Cancelada</p>
            <h3 style="margin: 10px 0 5px 0; color: #7f1d1d;">${patientName}</h3>
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #991b1b;">${dateFormatted} às ${time}</p>
          </div>

          <p style="color: #64748b;">Este horário foi liberado automaticamente na sua agenda.</p>

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenda" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 40px; text-decoration: none; font-weight: bold; display: inline-block;">
              Ver Minha Agenda
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

export function getRescheduleEmailForPatient({
  patientName,
  psychologistName,
  oldDateFormatted,
  oldTime,
  newDateFormatted,
  newTime,
}: {
  patientName: string
  psychologistName: string
  oldDateFormatted: string
  oldTime: string
  newDateFormatted: string
  newTime: string
}) {
  return `
    <div style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="background-color: #d97706; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Sessão Reagendada 📅</h1>
        </div>

        <div style="padding: 40px;">
          <h2 style="color: #0f172a; margin-top: 0;">Olá, ${patientName}!</h2>
          <p>Sua sessão com <strong>${psychologistName}</strong> foi reagendada:</p>

          <div style="margin: 30px 0; border: 1px solid #fde68a; border-radius: 16px; padding: 25px; background-color: #fffbeb;">
            <p style="margin: 0; font-size: 13px; color: #92400e; text-decoration: line-through;">Antes: ${oldDateFormatted} às ${oldTime}</p>
            <p style="margin: 12px 0 0 0; font-size: 18px; font-weight: bold; color: #065f46;">Novo horário: ${newDateFormatted} às ${newTime}</p>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 40px; text-decoration: none; font-weight: bold; display: inline-block;">
              Ver Sessões
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

export function getRescheduleEmailForPsychologist({
  psychologistName,
  patientName,
  oldDateFormatted,
  oldTime,
  newDateFormatted,
  newTime,
}: {
  psychologistName: string
  patientName: string
  oldDateFormatted: string
  oldTime: string
  newDateFormatted: string
  newTime: string
}) {
  return `
    <div style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="background-color: #d97706; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Sessão Reagendada 📅</h1>
        </div>

        <div style="padding: 40px;">
          <h2 style="color: #0f172a; margin-top: 0;">Olá, Dr(a). ${psychologistName}!</h2>
          <p>O paciente <strong>${patientName}</strong> reagendou uma sessão:</p>

          <div style="margin: 30px 0; border: 1px solid #fde68a; border-radius: 16px; padding: 25px; background-color: #fffbeb;">
            <p style="margin: 0; font-size: 13px; color: #92400e; text-decoration: line-through;">Antes: ${oldDateFormatted} às ${oldTime}</p>
            <p style="margin: 12px 0 0 0; font-size: 18px; font-weight: bold; color: #065f46;">Novo horário: ${newDateFormatted} às ${newTime}</p>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenda" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 40px; text-decoration: none; font-weight: bold; display: inline-block;">
              Ver Minha Agenda
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

export function getPsychologistNewAppointmentTemplate({
  psychologistName,
  patientName,
  dateFormatted,
  time,
}: {
  psychologistName: string
  patientName: string
  dateFormatted: string
  time: string
}) {
  return `
    <div style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="background-color: #2563eb; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Novo Agendamento 📅</h1>
        </div>
        
        <div style="padding: 40px;">
          <h2 style="color: #0f172a; margin-top: 0;">Olá, Dr(a). ${psychologistName}!</h2>
          <p>Você tem um novo agendamento realizado através da plataforma:</p>
          
          <div style="margin: 30px 0; border: 1px solid #e2e8f0; border-radius: 16px; padding: 25px; background-color: #f8fafc;">
            <p style="margin: 0; font-size: 14px; color: #64748b; font-weight: bold; text-transform: uppercase;">Paciente</p>
            <h3 style="margin: 10px 0 20px 0; color: #0f172a; font-size: 20px;">${patientName}</h3>
            
            <p style="margin: 0; font-size: 14px; color: #64748b; font-weight: bold; text-transform: uppercase;">Horário</p>
            <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold; color: #2563eb;">${dateFormatted} às ${time}</p>
          </div>
          
          <p>Você pode acessar os detalhes do paciente e preparar o prontuário através do seu painel.</p>

          <div style="text-align: center; margin-top: 40px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenda" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; border-radius: 40px; text-decoration: none; font-weight: bold; display: inline-block;">
              Acessar minha Agenda
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

export function getReminderEmailForPatient({
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
        <div style="background-color: #7c3aed; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Lembrete de Sessão 🗓️</h1>
        </div>

        <div style="padding: 40px;">
          <h2 style="color: #0f172a; margin-top: 0;">Olá, ${patientName}!</h2>
          <p style="font-size: 16px;">Sua sessão de terapia é <strong>amanhã</strong>. Confira os detalhes:</p>

          <div style="background: #f5f3ff; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px;"><strong>Profissional:</strong> ${psychologistName}</p>
            <p style="margin: 0 0 8px;"><strong>Data:</strong> ${dateFormatted}</p>
            <p style="margin: 0;"><strong>Horário:</strong> ${time}</p>
          </div>

          ${
            meetingUrl
              ? `<div style="text-align: center; margin: 32px 0;">
              <a href="${meetingUrl}" style="background-color: #7c3aed; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px;">
                Acessar Sala Virtual
              </a>
            </div>`
              : ''
          }

          <p style="color: #64748b; font-size: 14px;">Veja sua <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/sessoes" style="color: #7c3aed;">agenda completa</a> no painel.</p>
        </div>

        <div style="border-top: 1px solid #f1f5f9;">
          ${footerContent}
        </div>
      </div>
    </div>
  `
}

export function getReminderEmailForPsychologist({
  psychologistName,
  patientName,
  dateFormatted,
  time,
}: {
  psychologistName: string
  patientName: string
  dateFormatted: string
  time: string
}) {
  return `
    <div style="${baseStyles}">
      <div style="${containerStyles}">
        <div style="background-color: #7c3aed; padding: 40px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Lembrete de Sessão 🗓️</h1>
        </div>

        <div style="padding: 40px;">
          <h2 style="color: #0f172a; margin-top: 0;">Olá, ${psychologistName}!</h2>
          <p style="font-size: 16px;">Você tem uma sessão agendada para <strong>amanhã</strong>:</p>

          <div style="background: #f5f3ff; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px;"><strong>Paciente:</strong> ${patientName}</p>
            <p style="margin: 0 0 8px;"><strong>Data:</strong> ${dateFormatted}</p>
            <p style="margin: 0;"><strong>Horário:</strong> ${time}</p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/agenda" style="background-color: #7c3aed; color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px;">
              Ver Agenda
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
