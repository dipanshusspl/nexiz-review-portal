import { NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { db } from '@/lib/supabase/admin';
import { hashPassword } from '@/lib/auth/password';
import { SESSION_COOKIE, SESSION_HOURS, signSession } from '@/lib/auth/session';
import { OAUTH_COOKIE, finishAuth, isProvider } from '@/lib/auth/oauth';

export const dynamic = 'force-dynamic';

const FAILED = "Sign-in didn't complete. Your answers are still here. Please try again.";

/**
 * Provider -> us. One person = one account: the account is found by VERIFIED email, so Google, LinkedIn and
 * email+password all land on the same rv_users row. New people get the 'expert' role (same as /register).
 * Signing in never changes review status, publication, profile completion or verified-expert status.
 */
export async function GET(req: Request, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params;
  const url = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const jar = req.headers.get('cookie') ?? '';
  const cookieValue = jar.split(';').map((s) => s.trim()).find((s) => s.startsWith(OAUTH_COOKIE + '='))?.slice(OAUTH_COOKIE.length + 1);
  const failTo = (next = '') => {
    const base = next.startsWith('/') ? next.split('?')[0] : '/login';
    const res = NextResponse.redirect(new URL(`${base}?error=${encodeURIComponent(FAILED)}`, origin));
    res.cookies.delete({ name: OAUTH_COOKIE, path: '/auth' });
    return res;
  };

  if (!isProvider(provider) || url.searchParams.get('error')) return failTo();
  try {
    const { profile, next } = await finishAuth(provider, url.origin, url.searchParams.get('code') ?? '', url.searchParams.get('state') ?? '', cookieValue);

    let { data: u } = await db().from('rv_users').select('id,is_active').eq('email', profile.email).maybeSingle();
    if (u && !u.is_active) return failTo(next);
    if (!u) {
      const { data: role } = await db().from('rv_roles').select('id').eq('name', 'expert').maybeSingle();
      if (!role) return failTo(next);
      const ins = await db().from('rv_users').insert({
        email: profile.email, full_name: profile.name, role_id: role.id, is_active: true, field_agent: false,
        password_hash: await hashPassword(randomBytes(32).toString('hex')), // unusable: this person signs in with the provider
      }).select('id,is_active').single();
      if (ins.error || !ins.data) {
        const again = await db().from('rv_users').select('id,is_active').eq('email', profile.email).maybeSingle(); // double click race
        if (!again.data) return failTo(next);
        u = again.data;
      } else u = ins.data;
    }
    await db().from('rv_users').update({ last_login_at: new Date().toISOString(), failed_attempts: 0, locked_until: null }).eq('id', u!.id);
    // the provider picture is kept ONLY to prefill the profile photo (ignored if the column does not exist yet)
    if (profile.picture) await db().from('rv_users').update({ oauth_picture: profile.picture }).eq('id', u!.id);

    const res = NextResponse.redirect(new URL(next || '/expert', origin));
    res.cookies.set(SESSION_COOKIE, await signSession(u!.id), {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_HOURS * 3600,
    });
    res.cookies.delete({ name: OAUTH_COOKIE, path: '/auth' });
    return res;
  } catch (e) {
    console.error('oauth callback failed', provider, (e as Error).message);
    return failTo();
  }
}
