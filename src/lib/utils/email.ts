import { logger } from './logger'

// In a real application, you would configure NodeMailer, Resend, SendGrid, etc. here.
// For now, this is a mock email sender that logs to the console for demonstration.
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
    // MOCK: Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    logger.info(`[EMAIL SIMULADO] Enviando para: ${to}`)
    logger.info(`[EMAIL SIMULADO] Assunto: ${subject}`)
    logger.info(`[EMAIL SIMULADO] Conteúdo: \n${html}\n`)

    return { success: true }
  } catch (error) {
    logger.error('Failed to send email:', error)
    return { success: false, error: 'Falha ao enviar e-mail' }
  }
}
