/**
 * Server-side file validation by magic bytes (file signature).
 *
 * The browser-supplied `File.type` is trivially spoofable. Before persisting
 * any user-supplied file we read the first bytes of the buffer and verify
 * the actual content matches the declared MIME type. This blocks the common
 * "rename evil.exe to avatar.png" attack surface.
 */

export type AllowedKind = 'jpeg' | 'png' | 'webp' | 'pdf'

const SIGNATURES: Record<AllowedKind, { mime: string; check: (b: Uint8Array) => boolean }> = {
  jpeg: {
    mime: 'image/jpeg',
    check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  png: {
    mime: 'image/png',
    check: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  webp: {
    mime: 'image/webp',
    check: (b) =>
      b.length >= 12 &&
      b[0] === 0x52 && // R
      b[1] === 0x49 && // I
      b[2] === 0x46 && // F
      b[3] === 0x46 && // F
      b[8] === 0x57 && // W
      b[9] === 0x45 && // E
      b[10] === 0x42 && // B
      b[11] === 0x50, // P
  },
  pdf: {
    mime: 'application/pdf',
    check: (b) => b.length >= 4 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46, // %PDF
  },
}

export interface ValidationResult {
  ok: boolean
  /** safe-to-show message for end users */
  error?: string
  /** detected kind, when ok=true */
  kind?: AllowedKind
  /** validated buffer, returned to avoid double-reading the File */
  buffer?: Buffer
}

export interface ValidateOptions {
  maxBytes: number
  allow: AllowedKind[]
}

/**
 * Validates a File by:
 * 1. Size (cheap, fail fast).
 * 2. Declared MIME type matching the allow-list.
 * 3. Magic-byte signature matching the declared type.
 *
 * Returns the buffer when valid so callers don't read the stream twice.
 */
export async function validateUpload(
  file: File | null | undefined,
  opts: ValidateOptions
): Promise<ValidationResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: 'Nenhum arquivo enviado' }
  }

  if (file.size > opts.maxBytes) {
    const mb = Math.round(opts.maxBytes / (1024 * 1024))
    return { ok: false, error: `O arquivo deve ter no máximo ${mb}MB` }
  }

  const allowedMimes = opts.allow.map((k) => SIGNATURES[k].mime)
  if (!allowedMimes.includes(file.type)) {
    return { ok: false, error: 'Tipo de arquivo não permitido' }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const head = new Uint8Array(buffer.subarray(0, 16))

  const detected = opts.allow.find((kind) => SIGNATURES[kind].check(head))
  if (!detected) {
    return {
      ok: false,
      error: 'O conteúdo do arquivo não corresponde à extensão informada',
    }
  }

  if (SIGNATURES[detected].mime !== file.type) {
    return {
      ok: false,
      error: 'O conteúdo do arquivo não corresponde à extensão informada',
    }
  }

  return { ok: true, kind: detected, buffer }
}
