import 'server-only';
import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';
import { randomBytes, createHash } from 'node:crypto';

/**
 * Google and LinkedIn sign-in (OpenID Connect, authorization-code flow with PKCE).
 * Uses only `jose`, which the project already depends on for sessions: NO new library.
 */
export type Provider = 'google' | 'linkedin';

type Cfg = {
  authUrl: string; tokenUrl: string; jwks: string; issuers: string[]; scope: string;
  idEnv: string; secretEnv: string;
};
const CFG: Record<Provider, Cfg> = {
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth', tokenUrl: 'https://oauth2.googleapis.com/token',
    jwks: 'https://www.googleapis.com/oauth2/v3/certs', issuers: ['https://accounts.google.com', 'accounts.google.com'],
    scope: 'openid email profile', idEnv: 'GOOGLE_CLIENT_ID', secretEnv: 'GOOGLE_CLIENT_SECRET',
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization', tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    jwks: 'https://www.linkedin.com/oauth/openid/jwks', issuers: ['https://www.linkedin.com/oauth'],
    scope: 'openid profile email', idEnv: 'LINKEDIN_CLIENT_ID', secretEnv: 'LINKEDIN_CLIENT_SECRET',
  },
};

export const OAUTH_COOKIE = 'rv_oauth';
export const isProvider = (v: string): v is Provider => v === 'google' || v === 'linkedin';
export const providerConfigured = (p: Provider) => !!process.env[CFG[p].idEnv] && !!process.env[CFG[p].secretEnv];

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET ?? '');
const b64url = (b: Buffer) => b.toString('base64url');

/** Only same-site paths may be used as the "after sign-in" target. */
export const safeNext = (v: string | null | undefined): string =>
  v && v.startsWith('/') && !v.startsWith('//') && !v.includes('\\') ? v.slice(0, 300) : '';

export function redirectUri(origin: string, p: Provider) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/$/, '');
  return `${base}/auth/${p}/callback`;
}

/** Builds the provider URL and the signed, short-lived cookie that carries state + nonce + PKCE verifier. */
export async function startAuth(p: Provider, origin: string, next: string) {
  const c = CFG[p];
  const state = b64url(randomBytes(24)), nonce = b64url(randomBytes(24)), verifier = b64url(randomBytes(48));
  const challenge = b64url(createHash('sha256').update(verifier).digest());
  const cookie = await new SignJWT({ state, nonce, verifier, next, p })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('10m').sign(secret());
  const u = new URL(c.authUrl);
  u.search = new URLSearchParams({
    response_type: 'code', client_id: process.env[c.idEnv]!, redirect_uri: redirectUri(origin, p),
    scope: c.scope, state, nonce, code_challenge: challenge, code_challenge_method: 'S256',
  }).toString();
  return { url: u.toString(), cookie };
}

export type OAuthProfile = { email: string; name: string; picture: string };

/** Checks state, exchanges the code, verifies the id_token signature/issuer/audience/nonce. Throws on any problem. */
export async function finishAuth(p: Provider, origin: string, code: string, state: string, cookieValue: string | undefined) {
  const c = CFG[p];
  if (!cookieValue || !code || !state) throw new Error('missing');
  const { payload } = await jwtVerify(cookieValue, secret(), { algorithms: ['HS256'] });
  if (payload.p !== p || payload.state !== state) throw new Error('state');

  const res = await fetch(c.tokenUrl, {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'authorization_code', code, redirect_uri: redirectUri(origin, p),
      client_id: process.env[c.idEnv]!, client_secret: process.env[c.secretEnv]!, code_verifier: String(payload.verifier),
    }),
    cache: 'no-store',
  });
  const tok = (await res.json().catch(() => ({}))) as { id_token?: string };
  if (!res.ok || !tok.id_token) throw new Error('token');

  const { payload: id } = await jwtVerify(tok.id_token, createRemoteJWKSet(new URL(c.jwks)), {
    issuer: c.issuers, audience: process.env[c.idEnv]!,
  });
  if (id.nonce !== payload.nonce) throw new Error('nonce');
  const email = String(id.email ?? '').toLowerCase();
  // Linking by email is only safe when the provider says the email is verified.
  if (!email || (id.email_verified !== true && id.email_verified !== 'true')) throw new Error('email');
  const profile: OAuthProfile = {
    email, picture: typeof id.picture === 'string' ? id.picture : '',
    name: String(id.name ?? [id.given_name, id.family_name].filter(Boolean).join(' ') ?? '').trim() || email.split('@')[0],
  };
  return { profile, next: safeNext(String(payload.next ?? '')) };
}
