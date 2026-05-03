import { z } from 'zod'

export const videoTokenSchema = z.object({
  appointmentId: z.string().uuid('ID do agendamento inválido'),
})

export const sendEmailSchema = z.object({
  to: z.string().email('E-mail do destinatário inválido'),
  subject: z.string().min(1, 'Assunto é obrigatório'),
  html: z.string().min(1, 'Conteúdo HTML é obrigatório'),
})

export const logsSchema = z.object({
  level: z.enum(['info', 'warn', 'error', 'debug']),
  message: z.string().min(1),
  data: z.any().optional(),
})
