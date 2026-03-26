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
}

const RATE_LIMIT_ALLOWED = { success: true, limit: 20, remaining: 20, reset: 0 }

/**
 * Verifica se a requisição estourou o limite de taxa (Rate Limit).
 * @param identifier Um identificador único, geralmente o IP do usuário ou ID.
 * @returns Um objeto indicando o sucesso, e informações dos limites.
 */
export async function checkRateLimit(identifier: string) {
  if (!ratelimitInstance) {
    logger.warn(
      '[Rate Limiter] Chaves do Upstash ausentes, permitindo requisição por segurança de failover.'
    )
    return RATE_LIMIT_ALLOWED
  }

  try {
    return await ratelimitInstance.limit(identifier)
  } catch (err) {
    logger.error('Error in rate limit:', err)
    return RATE_LIMIT_ALLOWED
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
    logger.warn('[Rate Limiter] Auth limiters unavailable, allowing request.')
    return RATE_LIMIT_ALLOWED
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
    logger.error('Error in auth rate limit:', err)
    return RATE_LIMIT_ALLOWED
  }
}

/**
 * Rate limiting para recuperação de senha: 3 tentativas / 15 min por IP.
 */
export async function checkForgotPasswordRateLimit(ip: string) {
  if (!forgotPasswordRatelimitInstance) {
    logger.warn('[Rate Limiter] Forgot password limiter unavailable, allowing request.')
    return RATE_LIMIT_ALLOWED
  }

  try {
    return await forgotPasswordRatelimitInstance.limit(`ip:${ip}`)
  } catch (err) {
    logger.error('Error in forgot password rate limit:', err)
    return RATE_LIMIT_ALLOWED
  }
}

// ==========================================
// 3. Criptografia em Repouso (Para Dados de Saúde / LGPD)
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

// ==========================================
// 4. Validação de IDs (Prevenção de Injection)
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
