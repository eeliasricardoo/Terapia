import { z } from "zod"
import { isValidCRP, cleanCRP } from "@/lib/utils/crp"

export const professionalRegistrationSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "E-mail inválido.",
  }),
  password: z.string()
    .min(8, { message: "A senha deve ter pelo menos 8 caracteres." })
    .regex(/[A-Z]/, { message: "A senha deve conter pelo menos uma letra maiúscula." })
    .regex(/[a-z]/, { message: "A senha deve conter pelo menos uma letra minúscula." })
    .regex(/[0-9]/, { message: "A senha deve conter pelo menos um número." })
    .regex(/[\W_]/, { message: "A senha deve conter pelo menos um caractere especial." }),
  professionalCard: z.string()
    .min(1, {
      message: "O número da carteira profissional é obrigatório.",
    })
    .refine((value) => {
      const cleaned = cleanCRP(value)
      return cleaned.length === 7
    }, {
      message: "CRP deve ter o formato XX/XXXXX (2 dígitos + / + 5 dígitos).",
    })
    .refine((value) => isValidCRP(value), {
      message: "CRP inválido. Verifique o formato.",
    }),
  terms: z.boolean().refine((value) => value === true, {
    message: "Você deve aceitar os termos de serviço.",
  }),
})

export type ProfessionalRegistrationInput = z.infer<typeof professionalRegistrationSchema>

