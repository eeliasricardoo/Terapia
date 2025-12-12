/**
 * Remove caracteres não numéricos do CRP
 */
export function cleanCRP(crp: string): string {
  return crp.replace(/\D/g, "")
}

/**
 * Aplica máscara de CRP (XX/XXXXX)
 * Formato: 2 dígitos + / + 5 dígitos
 */
export function maskCRP(value: string): string {
  const cleaned = cleanCRP(value)
  
  if (cleaned.length <= 2) {
    return cleaned
  } else {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 7)}`
  }
}

/**
 * Valida formato do CRP (XX/XXXXX)
 */
export function isValidCRPFormat(crp: string): boolean {
  const cleaned = cleanCRP(crp)
  return cleaned.length === 7 // 2 dígitos + 5 dígitos
}

/**
 * Valida CRP completo
 * Formato: XX/XXXXX onde X são números
 */
export function isValidCRP(crp: string): boolean {
  if (!isValidCRPFormat(crp)) {
    return false
  }

  // Verificar formato com regex
  const crpRegex = /^\d{2}\/\d{5}$/
  return crpRegex.test(maskCRP(crp))
}

