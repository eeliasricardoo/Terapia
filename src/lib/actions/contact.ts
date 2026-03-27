'use server'

import { logger } from '@/lib/utils/logger'

export async function sendContactForm(formData: FormData) {
  try {
    const name = formData.get('name')
    const email = formData.get('email')
    const subject = formData.get('subject')
    const message = formData.get('message')

    if (!name || !email || !subject || !message) {
      return { success: false, error: 'Todos os campos são obrigatórios' }
    }

    // In a real app, you would send an email here using Resend or similar
    logger.info('Contact Form Submission:', { name, email, subject, message })

    return { success: true }
  } catch (error: any) {
    logger.error('Error sending contact form:', error)
    return { success: false, error: 'Erro ao enviar mensagem. Tente novamente mais tarde.' }
  }
}
