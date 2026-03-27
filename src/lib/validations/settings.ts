import { z } from 'zod'

export const NotificationSettingsSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  whatsapp: z.boolean(),
})

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>
