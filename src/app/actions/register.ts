'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { hashPassword, strongPasswordProblem } from '@/lib/auth/password';
import { SESSION_COOKIE, SESSION_HOURS, signSession } from '@/lib/auth/session';
import { dbMessage, isEmail, str } from '@/lib/form';

/** Back to the register form with an error, keeping name + email (never the passwords). */
function fail(msg: string, name: string, email: string): never {
  const q = new URLSearchParams({ error: msg });
  if (name) q.set('name', name);
  if (email) q.set('email', email);
  redirect(`/register?${q.toString()}`);
}

export async function registerExpert(fd: FormData) {
  const name = str(fd, 'full_name', 120);
  const email = str(fd, 'email', 254).toLowerCase();
  const password = String(fd.get('password') ?? '');
  const confirm = String(fd.get('confirm') ?? '');

  if (!name) fail('Full name is required.', name, email);
  if (!isEmail(email)) fail('Enter a valid email.', name, email);
  const problem = strongPasswordProblem(password);
  if (problem) fail(problem, name, email);
  if (password !== confirm) fail('Passwords do not match.', name, email);

  // role_id is set here automatically - the visitor never chooses it.
  const { data: role } = await db().from('rv_roles').select('id').eq('name', 'expert').maybeSingle();
  if (!role) fail('Registration is not available right now. Please contact the administrator.', name, email);

  const { data: user, error } = await db().from('rv_users').insert({
    email, full_name: name, role_id: role.id,
    password_hash: await hashPassword(password), is_active: true, field_agent: false,
  }).select('id').single();

  if (error || !user) {
    fail(error?.code === '23505' ? 'An account with this email already exists. Please sign in.' : dbMessage(error), name, email);
  }

  // Sign the new expert in straight away and send them to the Expert panel.
  (await cookies()).set(SESSION_COOKIE, await signSession(user.id), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: SESSION_HOURS * 3600,
  });
  redirect('/expert');
}
