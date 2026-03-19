import { logger } from './logger'
import { Resend } from 'resend'

// Cria o client do Resend passando a chave.
// Se a chave não existir no .env, será feito apenas um "mock" (simulação no terminal).
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

/**
 * Internal email sending function (no retry logic)
 */
async function sendEmailInternal({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  // Se não houver chave da Resend configurada, usamos o modo Simulado (Mock)
  if (!resend || !process.env.RESEND_API_KEY) {
    await new Promise((resolve) => setTimeout(resolve, 500))

    logger.info(`[EMAIL SIMULADO - Sem Chave Resend] Enviando para: ${to}`)
    logger.info(`[EMAIL SIMULADO] Assunto: ${subject}`)
    logger.info(`[EMAIL SIMULADO] Conteúdo: \n${html}\n`)

    return { success: true }
  }

  // Default to 'onboarding@resend.dev' if no official from e-mail is configured.
  // NOTE: 'onboarding@resend.dev' works only for sends to the resend account owner.
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  const fromName = process.env.RESEND_FROM_NAME || 'Terapia Plataforma'

  const { data, error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
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
}

/**
 * Send email with retry logic and exponential backoff
 * @param maxRetries Maximum number of retry attempts (default: 3)
 * @param initialDelayMs Initial delay between retries in milliseconds (default: 1000)
 */
export async function sendEmail(
  {
    to,
    subject,
    html,
  }: {
    to: string
    subject: string
    html: string
  },
  maxRetries: number = 3,
  initialDelayMs: number = 1000
) {
  let lastError: any = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await sendEmailInternal({ to, subject, html })

      if (result.success) {
        if (attempt > 0) {
          logger.info(`[EMAIL RETRY] Email enviado com sucesso após ${attempt} tentativa(s)`)
        }
        return result
      }

      lastError = result.error
      logger.warn(
        `[EMAIL RETRY] Tentativa ${attempt + 1}/${maxRetries + 1} falhou: ${result.error}`
      )

      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        // Exponential backoff: delay doubles with each retry
        const delayMs = initialDelayMs * Math.pow(2, attempt)
        logger.info(`[EMAIL RETRY] Aguardando ${delayMs}ms antes da próxima tentativa...`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    } catch (error) {
      lastError = error
      logger.error(`[EMAIL RETRY] Falha inesperada na tentativa ${attempt + 1}:`, error)

      if (attempt < maxRetries) {
        const delayMs = initialDelayMs * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }

  // All retries failed
  logger.error(
    `[EMAIL RETRY] Todas as ${maxRetries + 1} tentativas falharam para: ${to}. Último erro:`,
    lastError
  )
  return {
    success: false,
    error: typeof lastError === 'string' ? lastError : 'Falha ao processar envio de e-mail',
  }
}
