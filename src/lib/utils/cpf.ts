/**
 * Remove caracteres não numéricos do CPF
 */
export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, "")
}

/**
 * Aplica máscara de CPF (XXX.XXX.XXX-XX)
 */
export function maskCPF(value: string): string {
  const cleaned = cleanCPF(value)
  
  if (cleaned.length <= 3) {
    return cleaned
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
  } else if (cleaned.length <= 9) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
  } else {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
  }
}

/**
 * Valida se o CPF tem formato válido (11 dígitos)
 */
export function isValidCPFFormat(cpf: string): boolean {
  const cleaned = cleanCPF(cpf)
  return cleaned.length === 11
}

/**
 * Valida se todos os dígitos são iguais (CPF inválido)
 */
export function isRepeatedDigits(cpf: string): boolean {
  const cleaned = cleanCPF(cpf)
  return /^(\d)\1{10}$/.test(cleaned)
}

/**
 * Calcula o dígito verificador do CPF
 */
function calculateDigit(cpf: string, position: number): number {
  let sum = 0
  let weight = position + 1

  for (let i = 0; i < position; i++) {
    sum += parseInt(cpf[i]) * weight
    weight--
  }

  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

/**
 * Valida CPF brasileiro com dígito verificador
 * Retorna true se o CPF for válido
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cleanCPF(cpf)

  // Deve ter 11 dígitos
  if (cleaned.length !== 11) {
    return false
  }

  // Não pode ser todos os dígitos iguais
  if (isRepeatedDigits(cleaned)) {
    return false
  }

  // Validar primeiro dígito verificador
  const firstDigit = calculateDigit(cleaned, 9)
  if (firstDigit !== parseInt(cleaned[9])) {
    return false
  }

  // Validar segundo dígito verificador
  const secondDigit = calculateDigit(cleaned, 10)
  if (secondDigit !== parseInt(cleaned[10])) {
    return false
  }

  return true
}

