import sanitizeHtmlModule from 'sanitize-html'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

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

// Só instanciamos se as chaves estiverem presentes
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })

  ratelimitInstance = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'), // Limite padrão: 20 requisições por minuto por IP
    analytics: true,
    prefix: '@terapia/ratelimit',
  })
}

/**
 * Verifica se a requisição estourou o limite de taxa (Rate Limit).
 * @param identifier Um identificador único, geralmente o IP do usuário ou ID.
 * @returns Um objeto indicando o sucesso, e informações dos limites.
 */
export async function checkRateLimit(identifier: string) {
  if (!ratelimitInstance) {
    // Se as chaves do Upstash não foram configuradas, falha com graça
    // e alerta no console que a proteção não está ativa.
    console.warn(
      '⚠️ [Rate Limiter] Chaves do Upstash ausentes, permitindo requisição por segurança de failover.'
    )
    return { success: true, limit: 20, remaining: 20, reset: 0 }
  }

  try {
    const result = await ratelimitInstance.limit(identifier)
    return result
  } catch (err) {
    console.error('Error in rate limit:', err)
    return { success: true, limit: 20, remaining: 20, reset: 0 }
  }
}

// ==========================================
// 3. Criptografia em Repouso (Para Dados de Saúde / LGPD)
// ==========================================
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

/**
 * Obtem a chave de criptografia de forma segura.
 * Lê de process.env a cada chamada para compatibilidade com testes e serverless.
 */
function getEncryptionKey(): string | undefined {
  return process.env.ENCRYPTION_KEY
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
  const cipher = createCipheriv(
    'aes-256-cbc',
    Buffer.from(key.padEnd(32).slice(0, 32)),
    iv
  )
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
    const decipher = createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key.padEnd(32).slice(0, 32)),
      iv
    )
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    return decrypted.toString()
  } catch (error) {
    console.error('Falha ao descriptografar dado sensível', error)
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
