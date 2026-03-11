/**
 * API Signature utilities — shared between frontend (browser crypto) and backend (Node crypto).
 * Uses HMAC-SHA256 over: timestamp + userAgent + hashedIP
 *
 * On the browser, uses SubtleCrypto (Web Crypto API).
 * On Node.js, uses the native `crypto` module.
 */

import { SIGNATURE_WINDOW_SECONDS } from '../constants/index.js';

// ---- Browser implementation (SubtleCrypto) ----

async function hmacSha256Browser(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', keyMaterial, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ---- Shared signature generation ----

export interface SignaturePayload {
  timestamp: number;
  userAgent: string;
  /** SHA-256 hex of the IP address — computed server-side and passed to validator */
  hashedIp: string;
}

/**
 * Generate an HMAC-SHA256 signature for the given payload.
 * Uses browser SubtleCrypto when `window` is defined, Node crypto otherwise.
 */
export async function generateSignature(
  payload: SignaturePayload,
  secret: string,
): Promise<string> {
  const message = `${payload.timestamp}:${payload.userAgent}:${payload.hashedIp}`;

  // Browser environment
  if (typeof window !== 'undefined' && typeof crypto !== 'undefined' && crypto.subtle) {
    return hmacSha256Browser(secret, message);
  }

  // Node.js environment (dynamic import to avoid bundling issues in browser)
  const { createHmac } = await import('crypto');
  return createHmac('sha256', secret).update(message).digest('hex');
}

/**
 * Validate that a timestamp is within the allowed window.
 */
export function isTimestampValid(timestamp: number): boolean {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const tsSecs = Math.floor(timestamp / 1000);
  return Math.abs(nowSeconds - tsSecs) <= SIGNATURE_WINDOW_SECONDS;
}

/**
 * Hash an IP address with SHA-256.
 * Node.js only — not meant for browser use.
 */
export async function hashIp(ip: string): Promise<string> {
  const { createHash } = await import('crypto');
  return createHash('sha256').update(ip).digest('hex');
}
