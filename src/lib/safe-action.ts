import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import { z } from 'zod'

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

export type UserContext = { id: string; email: string; role: string }

/**
 * Overload for PUBLIC actions: authentication is NOT enforced.
 * The handler receives `UserContext | null`.
 */
export function createSafeAction<Schema extends z.ZodTypeAny, T>(
  schema: Schema,
  handler: (input: z.infer<Schema>, user: UserContext | null) => Promise<T>,
  options: { isPublic: true; requiredRole?: string | string[] }
): (input: z.infer<Schema>) => Promise<ActionResponse<T>>

/**
 * Overload for PROTECTED actions: authentication IS enforced.
 * The handler receives a guaranteed `UserContext`.
 */
export function createSafeAction<Schema extends z.ZodTypeAny, T>(
  schema: Schema,
  handler: (input: z.infer<Schema>, user: UserContext) => Promise<T>,
  options?: { isPublic?: false; requiredRole?: string | string[] }
): (input: z.infer<Schema>) => Promise<ActionResponse<T>>

/**
 * Implementation of createSafeAction.
 */
export function createSafeAction<Schema extends z.ZodTypeAny, T>(
  schema: Schema,
  handler: (input: z.infer<Schema>, user: any) => Promise<T>,
  options?: { isPublic?: boolean; requiredRole?: string | string[] }
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
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser && !options?.isPublic) {
        return {
          success: false,
          error: 'Não autenticado.',
          code: 'UNAUTHENTICATED',
        }
      }

      const role =
        (authUser?.user_metadata?.role as string) ||
        (authUser?.app_metadata?.role as string) ||
        'PATIENT'

      const userContext: UserContext | null = authUser
        ? {
            id: authUser.id,
            email: authUser.email!,
            role: role,
          }
        : null

      // 3. Optional Role Check
      if (options?.requiredRole && authUser) {
        const requiredRoles = Array.isArray(options.requiredRole)
          ? options.requiredRole
          : [options.requiredRole]

        if (!requiredRoles.includes(role)) {
          return {
            success: false,
            error: 'Acesso negado: permissão insuficiente.',
            code: 'FORBIDDEN',
          }
        }
      }

      // 4. Execute Handler
      const result = await handler(validationResult.data, userContext)

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
