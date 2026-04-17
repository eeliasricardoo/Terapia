import { z } from 'zod'

/**
 * Environment variables schema validation
 * This file validates all required environment variables at startup
 * to prevent runtime errors due to missing or invalid configuration
 */

const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database (Prisma)
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_URL: z.string().url('DIRECT_URL must be a valid URL').optional(),

  // Supabase Auth & Database
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Stripe Payments
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required'),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required'),
  PLATFORM_FEE_PERCENT: z
    .string()
    .default('15')
    .transform((val) => Number(val))
    .refine((n) => !isNaN(n) && n > 0 && n < 100, {
      message: 'PLATFORM_FEE_PERCENT must be a valid number between 1 and 99',
    }),

  // Daily.co Video Calls
  DAILY_API_KEY: z.string().min(1, 'DAILY_API_KEY is required'),

  // Upstash Redis (Rate Limiting) - Optional
  UPSTASH_REDIS_REST_URL: z.string().url('UPSTASH_REDIS_REST_URL must be a valid URL').optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Encryption (LGPD Compliance)
  ENCRYPTION_KEY: z
    .string()
    .length(32, 'ENCRYPTION_KEY must be exactly 32 characters')
    .refine((val) => /^[a-zA-Z0-9]+$/.test(val), {
      message: 'ENCRYPTION_KEY must contain only alphanumeric characters',
    }),

  // Email Service
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required').optional(),

  // Internal API secret (used by email-dispatch → /api/internal/send-email)
  INTERNAL_API_SECRET: z.string().min(16, 'INTERNAL_API_SECRET must be at least 16 characters'),

  // Cron job secret (Vercel sets this automatically; must also be in env)
  CRON_SECRET: z.string().min(16, 'CRON_SECRET must be at least 16 characters'),

  // Application URL
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url('NEXT_PUBLIC_APP_URL must be a valid URL')
    .refine((val) => !val.endsWith('/'), {
      message: 'NEXT_PUBLIC_APP_URL must not end with a slash',
    }),

  // Sentry (observability) - all optional; enable by setting DSN
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  SENTRY_DSN: z.string().url().optional().or(z.literal('')),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
})

/**
 * Validated environment variables
 * Use this instead of process.env for type safety
 */
export type Env = z.infer<typeof envSchema>

/**
 * Parse and validate environment variables
 * Throws an error if validation fails (except in test environment)
 */
function parseEnv(): Env {
  // Skip validation in test environment to allow mocking
  if (process.env.NODE_ENV === 'test') {
    return process.env as unknown as Env
  }

  try {
    const validatedEnv = envSchema.parse(process.env)

    // Additional production-only checks
    if (validatedEnv.NODE_ENV === 'production') {
      const placeholders = ['placeholder', 'your-', 'example', '...', 'temp']
      const secretsToCheck: (keyof Env)[] = [
        'STRIPE_SECRET_KEY',
        'DAILY_API_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'INTERNAL_API_SECRET',
        'CRON_SECRET',
        'ENCRYPTION_KEY',
      ]

      for (const key of secretsToCheck) {
        const val = String(validatedEnv[key]).toLowerCase()
        if (placeholders.some((p) => val.includes(p))) {
          throw new Error(
            `CRITICAL: Environment variable ${key} contains a placeholder value in production!`
          )
        }
      }
    }

    return validatedEnv
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => `  - ${err.path.join('.')}: ${err.message}`)

      console.error('❌ Invalid environment variables:\n' + missingVars.join('\n'))
      console.error('\n💡 Check your .env file and ensure all required variables are set.')

      throw new Error('Environment validation failed')
    }
    throw error
  }
}

/**
 * Validated and type-safe environment variables
 * Import this instead of using process.env directly
 *
 * @example
 * import { env } from '@/lib/env'
 * const apiKey = env.STRIPE_SECRET_KEY // Type-safe!
 */
export const env = parseEnv()

/**
 * Check if Redis is configured for rate limiting
 */
export const isRedisConfigured = Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN)

/**
 * Check if email service is configured
 */
export const isEmailConfigured = Boolean(env.RESEND_API_KEY)

/**
 * Check if Sentry observability is configured
 */
export const isSentryConfigured = Boolean(env.NEXT_PUBLIC_SENTRY_DSN || env.SENTRY_DSN)

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production'

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development'
