/**
 * Logger utility for the application
 * In development: logs to console
 * In production: can be extended to send to monitoring service (e.g., Sentry, LogRocket)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

// Lista de chaves de objetos que NUNCA devem aparecer limpas nos logs (LGPD / PII)
const SENSITIVE_KEYS = [
  'password',
  'senha',
  'token',
  'cpf',
  'document',
  'email',
  'phone',
  'telefone',
  'creditcard',
  'card',
  'secret',
  'anamnesis',
  'publicSummary',
  'privateNotes',
  'mood',
  'emotions',
]

class Logger {
  private get isDevelopment() {
    return process.env.NODE_ENV === 'development'
  }

  /**
   * Remove/mascara recursivamente informações sensíveis de objetos
   * antes de imprimi-los ou enviá-los para serviços de monitoramento.
   */
  private sanitizeData(data: unknown): unknown {
    if (!data) return data

    if (typeof data === 'string') {
      // Mascarando caso venha em string pura (opcional para e-mails e cpfs no texto)
      return data
    }

    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map((item) => this.sanitizeData(item))
      }

      const sanitizedObject: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        const lowerKey = key.toLowerCase()
        const isSensitive = SENSITIVE_KEYS.some((sensitiveInfo) =>
          lowerKey.includes(sensitiveInfo.toLowerCase())
        )

        if (isSensitive) {
          sanitizedObject[key] = '[MASCARADO PELO LOGGER (LGPD)]'
        } else {
          sanitizedObject[key] = this.sanitizeData(value)
        }
      }
      return sanitizedObject
    }

    return data
  }

  private log(level: LogLevel, message: string, data?: unknown) {
    if (!this.isDevelopment && level === 'debug') {
      return // Skip debug logs in production
    }

    const timestamp = new Date().toISOString()
    const safeData = data ? this.sanitizeData(data) : ''

    if (this.isDevelopment) {
      // Em dev: formato amigável para leitura no terminal local
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`
      switch (level) {
        case 'error':
          console.error(prefix, message, safeData)
          break
        case 'warn':
          console.warn(prefix, message, safeData)
          break
        case 'info':
        case 'debug':
          console.log(prefix, message, safeData)
          break
      }
    } else {
      // Em produção: formato JSON para Datadog/CloudWatch analisar mais fácil
      const logPayload = {
        level,
        timestamp,
        message,
        data: safeData,
      }
      console.log(JSON.stringify(logPayload))
    }
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data)
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data)
  }

  error(message: string, data?: unknown) {
    this.log('error', message, data)
  }

  debug(message: string, data?: unknown) {
    this.log('debug', message, data)
  }
}

export const logger = new Logger()
