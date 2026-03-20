/**
 * Remove caracteres não numéricos do CRP
 */
export function cleanCRP(crp: string): string {
  return crp.replace(/\D/g, '')
}

/**
 * Aplica máscara de CRP (XX/XXXXX ou XX/XXXXXX)
 * Formato: 2 dígitos + / + 5-6 dígitos
 */
export function maskCRP(value: string): string {
  const cleaned = cleanCRP(value)

  if (cleaned.length <= 2) {
    return cleaned
  } else {
    // Permite até 8 dígitos (2 de região + 6 de número)
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 8)}`
  }
}

/**
 * Valida formato do CRP (XX/XXXXX ou XX/XXXXXX)
 */
export function isValidCRPFormat(crp: string): boolean {
  const cleaned = cleanCRP(crp)
  // CRPs podem ter 5 ou 6 dígitos após o código da região (2 dígitos)
  return cleaned.length >= 7 && cleaned.length <= 8
}

/**
 * Valida CRP completo
 * Formato: XX/XXXXX ou XX/XXXXXX onde X são números
 */
export function isValidCRP(crp: string): boolean {
  if (!isValidCRPFormat(crp)) {
    return false
  }

  // Verificar formato com regex (2 dígitos + / + 5 a 6 dígitos)
  const crpRegex = /^\d{2}\/\d{5,6}$/
  return crpRegex.test(maskCRP(crp))
}
