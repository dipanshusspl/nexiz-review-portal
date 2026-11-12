import 'server-only';
import { SignJWT, jwtVerify } from 'jose';

export const RESET_COOKIE = 'rv_pwreset';
export const OTP_MINUTES = 10;        // how long the emailed code is valid
export const MAX_OTP_ATTEMPTS = 5;    // wrong guesses before the code is thrown away
export const RESEND_SECONDS = 60;     // minimum gap between two codes for the same account
export const RESET_TOKEN_MINUTES = 15; // time allowed to type the new password after the code was verified

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error('SESSION_SECRET must be set and at least 32 characters long.');
  return new TextEncoder().encode(s);
}

/** Uniformly random 6-digit code (rejection sampling, no modulo bias). */
export function generateOtp(): string {
  const limit = 4294967296 - (4294967296 % 1000000);
  const buf = new Uint32Array(1);
  do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
  return String(buf[0] % 1000000).padStart(6, '0');
}

const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

/** HMAC-SHA256 of the code (bound to the user), so the plain code is never stored. */
export async function hashOtp(userId: string, otp: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', secret() as BufferSource, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${userId}:${otp}`)));
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** Short-lived token proving "this browser entered the right code". Carries the reset row id. */
export async function signResetToken(userId: string, resetId: string): Promise<string> {
  return new SignJWT({ purpose: 'pwreset', rid: resetId }).setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId).setIssuedAt().setExpirationTime(`${RESET_TOKEN_MINUTES}m`).sign(secret());
}

export async function verifyResetToken(token?: string | null): Promise<{ userId: string; resetId: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ['HS256'] });
    if (payload.purpose !== 'pwreset' || typeof payload.sub !== 'string' || typeof payload.rid !== 'string') return null;
    return { userId: payload.sub, resetId: payload.rid };
  } catch { return null; }
}
