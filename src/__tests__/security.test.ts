jest.mock('@upstash/ratelimit', () => ({
  Ratelimit: jest.fn(),
}))
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn(),
}))

// Set ENCRYPTION_KEY for tests (must be exactly 32 chars)
process.env.ENCRYPTION_KEY = 'test_encryption_key_32chars_ok12'

import {
  sanitizeText,
  sanitizeHtml,
  encryptData,
  decryptData,
  isValidUUID,
  assertValidUUID,
} from '../lib/security'

describe('security utilities', () => {
  describe('sanitization', () => {
    it('should strip all HTML tags from text when using sanitizeText', () => {
      const input = '<p>Hello <b>World</b><script>alert("xss")</script></p>'
      const result = sanitizeText(input)
      expect(result).toBe('Hello World')
    })

    it('should allow basic HTML tags when using sanitizeHtml', () => {
      const input =
        '<p>Hello <b>World</b><script>alert("xss")</script><a href="http://test.com">Link</a></p>'
      const result = sanitizeHtml(input)
      expect(result).toContain('<p>Hello <b>World</b>')
      expect(result).toContain('<a href="http://test.com">Link</a>')
      expect(result).not.toContain('<script>')
    })

    it('should return empty string for null/undefined input', () => {
      expect(sanitizeText(null)).toBe('')
      expect(sanitizeText(undefined)).toBe('')
      expect(sanitizeHtml(null)).toBe('')
    })
  })

  describe('encryption', () => {
    it('should encrypt and then decrypt back to original text', () => {
      const originalText = 'Sensitive data about patient history'
      const encrypted = encryptData(originalText)

      // Should be different from original
      expect(encrypted).not.toBe(originalText)
      // Should contain the IV separator
      expect(encrypted).toContain(':')

      const decrypted = decryptData(encrypted)
      expect(decrypted).toBe(originalText)
    })

    it('should handle non-encrypted strings gracefully in decryptData', () => {
      const plainText = 'Just some regular text'
      const result = decryptData(plainText)
      expect(result).toBe(plainText)
    })

    it('should return error message when decryption fails (e.g. invalid format)', () => {
      const invalidData = 'somehex:invaliddata'
      const result = decryptData(invalidData)
      // Accepts any of the sentinel error prefixes (GCM, CBC legacy, missing key)
      expect(result).toMatch(/🔒 \[(Dados Criptografados|Dados Corrompidos|Dados Legados)/)
    })

    it('should handle empty input in encryption', () => {
      expect(encryptData('')).toBe('')
      expect(decryptData('')).toBe('')
    })
  })

  describe('UUID validation', () => {
    it('should accept valid UUIDs', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true)
      expect(isValidUUID('F47AC10B-58CC-4372-A567-0E02B2C3D479')).toBe(true)
    })

    it('should reject invalid UUIDs', () => {
      expect(isValidUUID('')).toBe(false)
      expect(isValidUUID('not-a-uuid')).toBe(false)
      expect(isValidUUID('550e8400e29b41d4a716446655440000')).toBe(false) // no dashes
      expect(isValidUUID("'; DROP TABLE users; --")).toBe(false) // SQL injection
      expect(isValidUUID('<script>alert("xss")</script>')).toBe(false) // XSS
    })

    it('assertValidUUID should return the UUID if valid', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      expect(assertValidUUID(uuid)).toBe(uuid)
    })

    it('assertValidUUID should throw for invalid UUIDs', () => {
      expect(() => assertValidUUID('invalid')).toThrow('ID inválido')
      expect(() => assertValidUUID('', 'Patient ID')).toThrow('Patient ID inválido')
    })
  })
})
