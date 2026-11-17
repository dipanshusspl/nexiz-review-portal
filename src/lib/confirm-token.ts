/**
 * Added by Prachi, 2026-11-05 (gap 6.15). How long a confirmation link stays valid. Pure functions.
 * A link with no recorded expiry counts as expired (fail closed); a moderator can send a new link.
 */
export const CONFIRM_TOKEN_DAYS = 14;

export const confirmExpiryFrom = (now: number = Date.now()): string =>
  new Date(now + CONFIRM_TOKEN_DAYS * 86_400_000).toISOString();

export function confirmTokenExpired(expiresAt: string | null | undefined, now: number = Date.now()): boolean {
  if (!expiresAt) return true;
  const t = new Date(expiresAt).getTime();
  return !Number.isFinite(t) || t <= now;
}