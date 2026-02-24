import DOMPurify from 'isomorphic-dompurify';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ==========================================
// 1. Sanitização de Input (Prevenção XSS)
// ==========================================

/**
 * Remove scripts perigosos, HTML malicioso e attributes on* (ex: onclick)
 * Use isto antes de salvar qualquer texto de campo aberto no banco de dados.
 */
export function sanitizeText(input: string | undefined | null): string {
    if (!input) return '';
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [], // Apenas texto puro, sem HTML no banco se não for intencional
        ALLOWED_ATTR: [],
    }).trim();
}

/**
 * Parecido com sanitizeText, mas permite algumas tags HTML básicas 
 * (útil se você usar um editor rico de texto para a bio dos psicólogos por exemplo)
 */
export function sanitizeHtml(input: string | undefined | null): string {
    if (!input) return '';
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'li', 'ol'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
    }).trim();
}


// ==========================================
// 2. Rate Limiting (Prevenção de Abuso e DDoS)
// ==========================================

// Variável para armazenar a instância do limitador
let ratelimitInstance: Ratelimit | null = null;

// Só instanciamos se as chaves estiverem presentes 
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    ratelimitInstance = new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'), // Limite padrão: 20 requisições por minuto por IP
        analytics: true,
        prefix: '@terapia/ratelimit',
    });
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
        console.warn('⚠️ [Rate Limiter] Chaves do Upstash ausentes, permitindo requisição por segurança de failover.');
        return { success: true, limit: 20, remaining: 20, reset: 0 };
    }

    try {
        const result = await ratelimitInstance.limit(identifier);
        return result;
    } catch (err) {
        console.error('Error in rate limit:', err);
        return { success: true, limit: 20, remaining: 20, reset: 0 };
    }
}
