'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { DUMMY_HASH, hashPassword, passwordProblem, verifyPassword } from '@/lib/auth/password';
import { SESSION_COOKIE, SESSION_HOURS, signSession } from '@/lib/auth/session';
// import { canOpenAdmin, getCurrentUser, requireUser } from '@/lib/auth/current-user';
import { LANG_COOKIE } from '@/lib/i18n';
import { back, str } from '@/lib/form';
import { canOpenAdmin, getCurrentUser, homePath, requireUser } from '@/lib/auth/current-user';


const MAX_FAILS = 5;
const LOCK_MINUTES = 15;

export async function login(fd: FormData) {
  const email = str(fd, 'email', 254).toLowerCase();
  const password = String(fd.get('password') ?? '').slice(0, 200);
  const fail = () => back('/login', 'error', 'Invalid email or password.');

  const { data: u } = await db().from('rv_users')
    .select('id,password_hash,is_active,failed_attempts,locked_until').eq('email', email).maybeSingle();

  if (!u) { await verifyPassword(password, DUMMY_HASH); return fail(); }
  if (u.locked_until && new Date(u.locked_until) > new Date()) {
    return back('/login', 'error', 'Too many failed attempts. Try again in a few minutes.');
  }
  const ok = await verifyPassword(password, u.password_hash);
  if (!ok || !u.is_active) {
    const attempts = (u.failed_attempts ?? 0) + 1;
    await db().from('rv_users').update({
      failed_attempts: attempts >= MAX_FAILS ? 0 : attempts,
      locked_until: attempts >= MAX_FAILS ? new Date(Date.now() + LOCK_MINUTES * 60000).toISOString() : null,
    }).eq('id', u.id);
    return fail();
  }
  await db().from('rv_users').update({
    failed_attempts: 0, locked_until: null, last_login_at: new Date().toISOString(),
  }).eq('id', u.id);

  (await cookies()).set(SESSION_COOKIE, await signSession(u.id), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: SESSION_HOURS * 3600,
  });
  const me = await getCurrentUser();
  // Admin-type users land on the admin dashboard (create roles/users...). Everyone else on the review screen.
  redirect(canOpenAdmin(me) && me?.roleName === 'admin' ? '/admin' : homePath(me));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect('/login');
}

export async function setLanguage(fd: FormData) {
  const lang = str(fd, 'lang', 2) === 'ar' ? 'ar' : 'en';
  (await cookies()).set(LANG_COOKIE, lang, { path: '/', maxAge: 365 * 86400, sameSite: 'lax' });
  redirect(str(fd, 'to', 300).startsWith('/') ? str(fd, 'to', 300) : '/review');
}

export async function changePassword(fd: FormData) {
  const me = await requireUser();
  const current = String(fd.get('current') ?? '');
  const next = String(fd.get('next') ?? '');
  const { data: u } = await db().from('rv_users').select('password_hash').eq('id', me.id).single();
  if (!u || !(await verifyPassword(current, u.password_hash))) {
    return back('/account/password', 'error', 'Current password is wrong.');
  }
  const problem = passwordProblem(next);
  if (problem) return back('/account/password', 'error', problem);
  await db().from('rv_users').update({ password_hash: await hashPassword(next) }).eq('id', me.id);
  return back('/account/password', 'ok', 'Password changed.');
}
