'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { hashPassword, strongPasswordProblem } from '@/lib/auth/password';
import {
  MAX_OTP_ATTEMPTS, OTP_MINUTES, RESEND_SECONDS, RESET_COOKIE, RESET_TOKEN_MINUTES,
  generateOtp, hashOtp, safeEqual, signResetToken, verifyResetToken,
} from '@/lib/auth/password-reset';
import { back, isEmail, str } from '@/lib/form';
import { notify } from '@/lib/notify';
import { gmailConfigured, sendGmail } from '@/lib/notify/gmail';
import { passwordResetOtpEmail } from '@/lib/notify/templates';

const verifyPath = (email: string) => `/forgot-password/verify?email=${encodeURIComponent(email)}`;
const SENT = 'We have sent a 6-digit code to your email.';
const NOT_FOUND = 'No account was found with this email.';
const WAIT = 'Please wait a minute before asking for another code.';
const FAILED = 'We could not send the email right now. Please try again later.';

type IssueResult = 'sent' | 'unknown' | 'wait' | 'failed';

/** Creates a fresh code for the account and emails it. Tells the caller what happened so the page can show a clear message. */
async function issueOtp(email: string): Promise<IssueResult> {
  const { data: u } = await db().from('rv_users').select('id,full_name,is_active').eq('email', email).maybeSingle();
  if (!u || !u.is_active) return 'unknown';

  const { data: last } = await db().from('rv_password_resets').select('created_at')
    .eq('user_id', u.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (last && Date.now() - new Date(last.created_at).getTime() < RESEND_SECONDS * 1000) return 'wait';

  const otp = generateOtp();
  await db().from('rv_password_resets').delete().eq('user_id', u.id); // only the newest code works
  const { error } = await db().from('rv_password_resets').insert({
    user_id: u.id, otp_hash: await hashOtp(u.id, otp),
    expires_at: new Date(Date.now() + OTP_MINUTES * 60000).toISOString(),
  });
  if (error) { console.error('[password-reset] insert failed', error); return 'failed'; }

  const msg = passwordResetOtpEmail(email, u.full_name ?? '', otp, OTP_MINUTES);
  const r = gmailConfigured() ? await sendGmail(msg) : await notify(msg);
  if (!r.ok) { console.error('[password-reset] email not sent:', r.note); return 'failed'; }
  return 'sent';
}

/** Step 1 - user typed their email. */
export async function requestPasswordReset(fd: FormData) {
  const email = str(fd, 'email', 254).toLowerCase();
  if (!isEmail(email)) return back('/forgot-password', 'error', 'Enter a valid email.');
  const r = await issueOtp(email);
  if (r === 'unknown') return back('/forgot-password', 'error', NOT_FOUND);
  if (r === 'wait') return back(verifyPath(email), 'error', WAIT);
  if (r === 'failed') return back('/forgot-password', 'error', FAILED);
  return back(verifyPath(email), 'ok', SENT);
}

export async function resendPasswordOtp(fd: FormData) {
  const email = str(fd, 'email', 254).toLowerCase();
  if (!isEmail(email)) return back('/forgot-password', 'error', 'Enter a valid email.');
  const r = await issueOtp(email);
  if (r === 'unknown') return back('/forgot-password', 'error', NOT_FOUND);
  if (r === 'wait') return back(verifyPath(email), 'error', WAIT);
  if (r === 'failed') return back(verifyPath(email), 'error', FAILED);
  return back(verifyPath(email), 'ok', SENT);
}

/** Step 2 - user typed the code from the email. */
export async function verifyPasswordOtp(fd: FormData) {
  const email = str(fd, 'email', 254).toLowerCase();
  const code = str(fd, 'code', 12).replace(/\s+/g, '');
  const bad = (m: string) => back(verifyPath(email), 'error', m);
  if (!isEmail(email)) return back('/forgot-password', 'error', 'Enter a valid email.');
  if (!/^\d{6}$/.test(code)) return bad('Enter the 6-digit code.');

  const { data: u } = await db().from('rv_users').select('id,is_active').eq('email', email).maybeSingle();
  if (!u || !u.is_active) return bad('Invalid or expired code.');
  const { data: r } = await db().from('rv_password_resets')
    .select('id,otp_hash,attempts,expires_at').eq('user_id', u.id).is('verified_at', null)
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!r || new Date(r.expires_at) < new Date()) return bad('Invalid or expired code.');

  if (r.attempts >= MAX_OTP_ATTEMPTS) {
    await db().from('rv_password_resets').delete().eq('id', r.id);
    return bad('Too many wrong attempts. Please request a new code.');
  }
  await db().from('rv_password_resets').update({ attempts: r.attempts + 1 }).eq('id', r.id);
  if (!safeEqual(await hashOtp(u.id, code), r.otp_hash)) return bad('Invalid or expired code.');

  await db().from('rv_password_resets').update({ verified_at: new Date().toISOString() }).eq('id', r.id);
  (await cookies()).set(RESET_COOKIE, await signResetToken(u.id, r.id), {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    path: '/forgot-password', maxAge: RESET_TOKEN_MINUTES * 60,
  });
  redirect('/forgot-password/reset');
}

/** Step 3 - code was correct; user chooses the new password. */
export async function resetPassword(fd: FormData) {
  const jar = await cookies();
  const t = await verifyResetToken(jar.get(RESET_COOKIE)?.value);
  if (!t) return back('/forgot-password', 'error', 'Your reset session expired. Please start again.');

  const password = String(fd.get('password') ?? '');
  const confirm = String(fd.get('confirm') ?? '');
  const problem = strongPasswordProblem(password);
  if (problem) return back('/forgot-password/reset', 'error', problem);
  if (password !== confirm) return back('/forgot-password/reset', 'error', 'Passwords do not match.');

  // The code must have been verified and still be unused (single use).
  const { data: r } = await db().from('rv_password_resets').select('id')
    .eq('id', t.resetId).eq('user_id', t.userId).not('verified_at', 'is', null).maybeSingle();
  if (!r) return back('/forgot-password', 'error', 'Your reset session expired. Please start again.');

  const { error } = await db().from('rv_users').update({
    password_hash: await hashPassword(password), failed_attempts: 0, locked_until: null,
  }).eq('id', t.userId);
  if (error) return back('/forgot-password/reset', 'error', 'Could not update the password. Please try again.');

  await db().from('rv_password_resets').delete().eq('user_id', t.userId);
  jar.delete({ name: RESET_COOKIE, path: '/forgot-password' });
  return back('/login', 'ok', 'Password updated. You can now sign in.');
}
