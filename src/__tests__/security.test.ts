jest.mock('@upstash/ratelimit', () => ({
    Ratelimit: jest.fn(),
}));
jest.mock('@upstash/redis', () => ({
    Redis: jest.fn(),
}));

import { sanitizeText, sanitizeHtml, encryptData, decryptData } from '../lib/security';

describe('security utilities', () => {
    describe('sanitization', () => {
        it('should strip all HTML tags from text when using sanitizeText', () => {
            const input = '<p>Hello <b>World</b><script>alert("xss")</script></p>';
            const result = sanitizeText(input);
            expect(result).toBe('Hello World');
        });

        it('should allow basic HTML tags when using sanitizeHtml', () => {
            const input = '<p>Hello <b>World</b><script>alert("xss")</script><a href="http://test.com">Link</a></p>';
            const result = sanitizeHtml(input);
            expect(result).toContain('<p>Hello <b>World</b>');
            expect(result).toContain('<a href="http://test.com">Link</a>');
            expect(result).not.toContain('<script>');
        });

        it('should return empty string for null/undefined input', () => {
            expect(sanitizeText(null)).toBe('');
            expect(sanitizeText(undefined)).toBe('');
            expect(sanitizeHtml(null)).toBe('');
        });
    });

    describe('encryption', () => {
        it('should encrypt and then decrypt back to original text', () => {
            const originalText = 'Sensitive data about patient history';
            const encrypted = encryptData(originalText);

            // Should be different from original
            expect(encrypted).not.toBe(originalText);
            // Should contain the IV separator
            expect(encrypted).toContain(':');

            const decrypted = decryptData(encrypted);
            expect(decrypted).toBe(originalText);
        });

        it('should handle non-encrypted strings gracefully in decryptData', () => {
            const plainText = 'Just some regular text';
            const result = decryptData(plainText);
            expect(result).toBe(plainText);
        });

        it('should return error message when decryption fails (e.g. invalid format)', () => {
            const invalidData = 'somehex:invaliddata';
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = decryptData(invalidData);
            expect(result).toBe('🔒 [Dados Criptografados - Chave Inválida]');
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        it('should handle empty input in encryption', () => {
            expect(encryptData('')).toBe('');
            expect(decryptData('')).toBe('');
        });
    });
});
