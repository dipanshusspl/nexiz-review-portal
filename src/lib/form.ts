import 'server-only';
import { redirect } from 'next/navigation';

export const str = (fd: FormData, k: string, max = 200): string =>
  String(fd.get(k) ?? '').trim().slice(0, max);

export const optional = (fd: FormData, k: string, max = 200): string | null => str(fd, k, max) || null;

export function slugify(input: string): string {
  const s = input.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
  return s.slice(0, 80) || `item-${Date.now().toString(36)}`;
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;

/** Redirect back to a page with a flash message in the query string. */
export function back(path: string, kind: 'ok' | 'error', message: string): never {
  const sep = path.includes('?') ? '&' : '?';
  redirect(`${path}${sep}${kind}=${encodeURIComponent(message)}`);
}

/** Friendly text for common Postgres errors. */
export function dbMessage(err: { code?: string; message?: string } | null, fallback = 'Something went wrong.'): string {
  if (!err) return fallback;
  if (err.code === '23505') return 'That value already exists (it must be unique).';
  if (err.code === '23503') return 'It is still used by other records. Remove or move those first.';
  return `${fallback} (${err.message ?? 'database error'})`;
}
