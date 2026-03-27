import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

/**
 * A secure wrapper for Server Actions that enforces authentication,
 * validation, and standardized error handling.
 */
export function createSafeAction<Schema extends z.ZodTypeAny, T>(
  schema: Schema,
  handler: (
    input: z.infer<Schema>,
    user: { id: string; email: string; role: string }
  ) => Promise<T>,
  options?: { requiredRole?: 'PATIENT' | 'PSYCHOLOGIST' | 'COMPANY' | 'ADMIN' }
) {
  return async (input: z.infer<Schema>): Promise<ActionResponse<T>> => {
    try {
      // 1. Validate Input
      const validationResult = schema.safeParse(input)
      if (!validationResult.success) {
        return {
          success: false,
          error: 'Dados inválidos.',
          code: 'VALIDATION_ERROR',
        }
      }

      // 2. Check Authentication
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return {
          success: false,
          error: 'Não autenticado.',
          code: 'UNAUTHENTICATED',
        }
      }

      const role = (user.app_metadata?.role as string) || 'PATIENT'

      // 3. Optional Role Check
      if (options?.requiredRole && role !== options.requiredRole) {
        return {
          success: false,
          error: 'Acesso negado: permissão insuficiente.',
          code: 'FORBIDDEN',
        }
      }

      // 4. Execute Handler
      const result = await handler(validationResult.data, {
        id: user.id,
        email: user.email!,
        role: role,
      })

      return { success: true, data: result }
    } catch (error: any) {
      logger.error('SafeAction Error:', error)
      return {
        success: false,
        error: error.message || 'Ocorreu um erro inesperado.',
        code: error.code || 'INTERNAL_ERROR',
      }
    }
  }
}
