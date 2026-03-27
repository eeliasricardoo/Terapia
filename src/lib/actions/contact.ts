'use server'

import { logger } from '@/lib/utils/logger'
import { createSafeAction } from '@/lib/safe-action'
import { z } from 'zod'

const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(10),
})

export const sendContactForm = createSafeAction(
  contactFormSchema,
  async (data) => {
    // Audit submission in logger
    logger.info('Contact Form Submission received:', {
      name: data.name,
      email: data.email,
      subject: data.subject,
    })

    // In a production environment, dispatch email via Resend/SendGrid.
    // For now, return success.
    return { success: true }
  },
  { isPublic: true }
)
