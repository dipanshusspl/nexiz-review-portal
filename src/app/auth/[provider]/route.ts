import { NextResponse } from 'next/server';
import { OAUTH_COOKIE, isProvider, providerConfigured, safeNext, startAuth } from '@/lib/auth/oauth';

export const dynamic = 'force-dynamic';

/** GET /auth/google or /auth/linkedin  (optional ?next=/path) -> sends the visitor to the provider. */
export async function GET(req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  const url = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  if (!isProvider(provider) || !providerConfigured(provider)) {
    return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent('Sign-in with this provider is not available right now.'), origin));
  }
  const { url: target, cookie } = await startAuth(provider, url.origin, safeNext(url.searchParams.get('next')));
  const res = NextResponse.redirect(target);
  res.cookies.set(OAUTH_COOKIE, cookie, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/auth', maxAge: 600 });
  return res;
}
