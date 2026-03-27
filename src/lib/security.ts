import sanitizeHtmlModule from 'sanitize-html'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { env, isRedisConfigured } from './env'
import { logger } from './utils/logger'

// ==========================================
// 1. Sanitização de Input (Prevenção XSS)
// ==========================================

/**
 * Remove scripts perigosos, HTML malicioso e attributes on* (ex: onclick)
 * Use isto antes de salvar qualquer texto de campo aberto no banco de dados.
 */
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return ''
  return sanitizeHtmlModule(input, {
    allowedTags: [], // Apenas texto puro, sem HTML no banco se não for intencional
    allowedAttributes: {},
  }).trim()
}

/**
 * Parecido com sanitizeText, mas permite algumas tags HTML básicas
 * (útil se você usar um editor rico de texto para a bio dos psicólogos por exemplo)
 */
export function sanitizeHtml(input: string | undefined | null): string {
  if (!input) return ''
  return sanitizeHtmlModule(input, {
    allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'li', 'ol'],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
    },
  }).trim()
}

// ==========================================
// 2. Rate Limiting (Prevenção de Abuso e DDoS)
// ==========================================

// Variável para armazenar a instância do limitador
let ratelimitInstance: Ratelimit | null = null
let authIpRatelimitInstance: Ratelimit | null = null
let authEmailRatelimitInstance: Ratelimit | null = null
let forgotPasswordRatelimitInstance: Ratelimit | null = null
let appointmentRatelimitInstance: Ratelimit | null = null

/**
 * Fallback Rate Limiter (Simples, em memória)
 * Previne "fail-open" se o Redis/Upstash falhar.
 * Útil para processos críticos (Login, Registro).
 */
class MemoryRateLimit {
  private cache = new Map<string, { count: number; reset: number }>()

  async limit(identifier: string, limit: number, windowMs: number) {
    const now = Date.now()
    const entry = this.cache.get(identifier)

    if (!entry || now > entry.reset) {
      this.cache.set(identifier, { count: 1, reset: now + windowMs })
      return { success: true, remaining: limit - 1, reset: now + windowMs }
    }

    if (entry.count >= limit) {
      return { success: false, remaining: 0, reset: entry.reset }
    }

    entry.count++
    return { success: true, remaining: limit - entry.count, reset: entry.reset }
  }
}

const memoryFallback = new MemoryRateLimit()

// Só instanciamos se as chaves estiverem presentes
if (isRedisConfigured) {
  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
  })

  ratelimitInstance = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'), // Limite padrão: 20 requisições por minuto por IP
    analytics: true,
    prefix: '@terapia/ratelimit',
  })

  // Login por IP: 10 tentativas por 15 minutos (brute force via IP único)
  authIpRatelimitInstance = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '15 m'),
    analytics: true,
    prefix: '@terapia/auth-ip',
  })

  // Login por email: 5 tentativas por hora (brute force distribuído contra uma conta específica)
  authEmailRatelimitInstance = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
    prefix: '@terapia/auth-email',
  })

  // Recuperação de senha: 3 tentativas por 15 minutos por IP
  forgotPasswordRatelimitInstance = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, '15 m'),
    analytics: true,
    prefix: '@terapia/forgot-pw',
  })

  // Criação de agendamentos: 5 por hora por usuário (evita flood de agendamentos falsos)
  appointmentRatelimitInstance = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
    prefix: '@terapia/appointment',
  })
}

const RATE_LIMIT_ALLOWED = { success: true, limit: 20, remaining: 20, reset: 0 }

/**
 * Verifica se a requisição estourou o limite de taxa (Rate Limit).
 * @param identifier Um identificador único, geralmente o IP do usuário ou ID.
 * @returns Um objeto indicando o sucesso, e informações dos limites.
 */
export async function checkRateLimit(identifier: string) {
  if (!ratelimitInstance) {
    logger.warn('⚠️ [Rate Limiter] Upstash Redis down. Using Memory Fallback.')
    return await memoryFallback.limit(`general:${identifier}`, 20, 60 * 1000)
  }

  try {
    const result = await ratelimitInstance.limit(identifier)
    return result
  } catch (err) {
    logger.error('Error in rate limit, using memory fallback:', err)
    return await memoryFallback.limit(`general:${identifier}`, 10, 60 * 1000) // Restricted on error
  }
}

/**
 * Rate limiting específico para login — aplica dois limites:
 * 1. Por IP: 10 tentativas / 15 min (protege contra brute force de IP único)
 * 2. Por email: 5 tentativas / 1h (protege contra ataques distribuídos a uma conta)
 *
 * @returns { success: false } se qualquer dos dois limites for atingido.
 */
export async function checkLoginRateLimit(ip: string, email: string) {
  if (!authIpRatelimitInstance || !authEmailRatelimitInstance) {
    logger.warn('⚠️ [Rate Limiter] Auth limiters down. Using Memory Fallback.')
    const [ipRes, emailRes] = await Promise.all([
      memoryFallback.limit(`login_ip:${ip}`, 10, 15 * 60 * 1000),
      memoryFallback.limit(`login_email:${email.toLowerCase()}`, 5, 60 * 60 * 1000),
    ])
    return !ipRes.success ? ipRes : emailRes
  }

  try {
    const [ipResult, emailResult] = await Promise.all([
      authIpRatelimitInstance.limit(`ip:${ip}`),
      authEmailRatelimitInstance.limit(`email:${email.toLowerCase()}`),
    ])

    if (!ipResult.success) return ipResult
    if (!emailResult.success) return emailResult
    return ipResult
  } catch (err) {
    logger.error('Error in auth rate limit, using memory fallback:', err)
    return await memoryFallback.limit(`login_fallback:${ip}`, 5, 15 * 60 * 1000)
  }
}

/**
 * Rate limiting para recuperação de senha: 3 tentativas / 15 min por IP.
 */
export async function checkForgotPasswordRateLimit(ip: string) {
  if (!forgotPasswordRatelimitInstance) {
    logger.warn('⚠️ [Rate Limiter] Forgot PW limiter down. Using Memory Fallback.')
    return await memoryFallback.limit(`forgot_ip:${ip}`, 3, 15 * 60 * 1000)
  }

  try {
    return await forgotPasswordRatelimitInstance.limit(`ip:${ip}`)
  } catch (err) {
    logger.error('Error in forgot pw rate limit, using memory fallback:', err)
    return await memoryFallback.limit(`forgot_ip:${ip}`, 2, 15 * 60 * 1000)
  }
}

/**
 * Rate limiting para criação de agendamentos: 5 por hora por userId.
 * Previne flood de agendamentos falsos / spam contra psicólogos.
 */
export async function checkAppointmentRateLimit(userId: string) {
  if (!appointmentRatelimitInstance) {
    logger.warn('⚠️ [Rate Limiter] Appointment limiter down. Using Memory Fallback.')
    return await memoryFallback.limit(`appointment:${userId}`, 5, 60 * 60 * 1000)
  }

  try {
    return await appointmentRatelimitInstance.limit(`appointment:${userId}`)
  } catch (err) {
    logger.error('Error in appointment rate limit, using memory fallback:', err)
    return await memoryFallback.limit(`appointment:${userId}`, 3, 60 * 60 * 1000) // Restricted on error
  }
}

// ==========================================
// 3. Comparação de Segredos Resistente a Timing Attack
// ==========================================
import { timingSafeEqual, createHash } from 'crypto'

/**
 * Compara dois segredos em tempo constante para prevenir timing attacks.
 * Usa SHA-256 em ambos para normalizar o comprimento antes da comparação,
 * evitando vazamento de informação pelo tamanho da string.
 */
export function timingSafeCompare(received: string | null | undefined, expected: string): boolean {
  if (!received) return false
  const bufA = createHash('sha256').update(received).digest()
  const bufB = createHash('sha256').update(expected).digest()
  return timingSafeEqual(bufA, bufB)
}

// ==========================================
// 4. Criptografia em Repouso (Para Dados de Saúde / LGPD)
// ==========================================
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

/**
 * Obtem a chave de criptografia de forma segura.
 * Lê de env para garantir validação prévia.
 */
function getEncryptionKey(): string {
  return env.ENCRYPTION_KEY
}
const IV_LENGTH = 16

/**
 * Criptografa strings sensíveis (Prontuários, Laudos Médicos) antes de inserir no banco
 */
export function encryptData(text: string): string {
  if (!text) return text
  const key = getEncryptionKey()
  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY não configurada. Não é possível criptografar dados sensíveis de saúde. ' +
        'Defina ENCRYPTION_KEY no .env com exatamente 32 caracteres.'
    )
  }
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(key.padEnd(32).slice(0, 32)), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString('hex') + ':' + encrypted.toString('hex')
}

/**
 * Descriptografa as strings sensíveis vindas do banco de dados na hora de mostrar pro profissional.
 */
export function decryptData(text: string): string {
  if (!text || !text.includes(':')) return text // Retorna normal se não estiver criptografado
  const key = getEncryptionKey()
  if (!key) {
    return '🔒 [Dados Criptografados - Chave Não Configurada]'
  }
  try {
    const textParts = text.split(':')
    const iv = Buffer.from(textParts.shift() as string, 'hex')
    const encryptedText = Buffer.from(textParts.join(':'), 'hex')
    const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key.padEnd(32).slice(0, 32)), iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (error) {
    logger.error('Falha ao descriptografar dado sensível', error)
    return '🔒 [Dados Criptografados - Chave Inválida]'
  }
}

/**
 * Valida o token do Cloudflare Turnstile
 */
export async function validateCaptcha(token: string | null | undefined): Promise<boolean> {
  if (process.env.NODE_ENV === 'development' && !token) {
    logger.warn('⚠️ [Captcha] Skip validation in dev because no token was provided.')
    return true
  }

  if (!token) return false

  try {
    const formData = new FormData()
    formData.append(
      'secret',
      process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA'
    )
    formData.append('response', token)

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: formData,
      method: 'POST',
    })

    const outcome = await result.json()
    return outcome.success
  } catch (err) {
    logger.error('Captcha verification error:', err)
    return false
  }
}

// ==========================================
// 5. Validação de IDs (Prevenção de Injection)
// ==========================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Valida se uma string é um UUID v4 válido.
 * Use antes de queries que recebem IDs de parâmetros de URL ou inputs do cliente.
 */
export function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id)
}

/**
 * Valida e retorna o UUID, ou lança erro se inválido.
 * Útil para Server Actions que recebem IDs diretamente do cliente.
 */
export function assertValidUUID(id: string, label = 'ID'): string {
  if (!id || !isValidUUID(id)) {
    throw new Error(`${label} inválido: formato UUID esperado.`)
  }
  return id
}
