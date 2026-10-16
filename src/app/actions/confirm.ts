'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';

/**
 * The respondent taps "Confirm my review". Verification happens ONLY here (a POST), never when the page is opened,
 * so email scanners that pre-open links cannot verify a review by accident.
 * Rule from the client: the Verified badge never appears on a field review before this runs.
 */
export async function confirmReview(fd: FormData) {
  const token = String(fd.get('token') ?? '');
  if (!/^[0-9a-f]{32}$/.test(token)) redirect('/confirm?bad=1');
  const { data: rev } = await db().from('rv_reviews').select('id,escalated')
    .eq('confirm_token', token).eq('source', 'field').maybeSingle();
  if (!rev) redirect('/confirm?bad=1');
  await db().from('rv_reviews').update({
    verified: true, verified_at: new Date().toISOString(), confirm_token: null,
    // goes live by itself unless a rule escalated it to a person
    status: rev.escalated ? 'pending' : 'approved',
  }).eq('id', rev.id);
  redirect('/confirm?done=1');
}
