import { logger } from './logger'
import { Resend } from 'resend'

// Cria o client do Resend passando a chave.
// Se a chave não existir no .env, será feito apenas um "mock" (simulação no terminal).
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    // Se não houver chave da Resend configurada, usamos o modo Simulado (Mock)
    if (!resend || !process.env.RESEND_API_KEY) {
      await new Promise((resolve) => setTimeout(resolve, 500))

      logger.info(`[EMAIL SIMULADO - Sem Chave Resend] Enviando para: ${to}`)
      logger.info(`[EMAIL SIMULADO] Assunto: ${subject}`)
      logger.info(`[EMAIL SIMULADO] Conteúdo: \n${html}\n`)

      return { success: true }
    }

    // Com a chave configurada, envia de fato pelo Resend
    const { data, error } = await resend.emails.send({
      // NOTA: 'onboarding@resend.dev' permite envio de testes apenas para o e-mail
      // do criador da conta Resend. Para enviar para qualquer e-mail real
      // (ex: carlos@exemplo.com), você precisará registrar seu próprio domínio na Resend
      from: 'Terapia Plataforma <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
    })

    if (error) {
      logger.error('[RESEND] Erro ao enviar email:', error)
      return { success: false, error: error.message }
    }

    logger.info(`[RESEND] Email oficial enviado com sucesso para: ${to} (ID: ${data?.id})`)
    return { success: true, data }
  } catch (error) {
    logger.error('Falha inesperada ao tentar enviar email:', error)
    return { success: false, error: 'Falha ao processar envio de e-mail' }
  }
}
