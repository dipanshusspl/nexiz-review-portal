'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/current-user';
import { back, str } from '@/lib/form';
import { liveEmail, rejectionEmail } from '@/lib/notify/templates';
import { notify, siteUrl } from '@/lib/notify';

/**
 * The reviewer can approve, reject (with a reason from the fixed list) or flag a vendor dispute.
 * There is deliberately NO action that edits review text: if Nexiz edited a reviewer's words the platform would no longer be independent.
 */
type Kind = 'user' | 'expert';
const table = (k: Kind) => (k === 'expert' ? 'rv_expert_software_reviews' : 'rv_reviews');

async function authorOf(kind: Kind, row: Record<string, any>): Promise<{ email: string; name: string } | null> { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (kind === 'expert') {
    const { data } = await db().from('rv_expert_profiles').select('email,full_name').eq('id', row.profile_id).maybeSingle();
    return data?.email ? { email: data.email, name: data.full_name || '' } : null;
  }
  if (row.source === 'field') return null; // the respondent is not an account; they were already emailed the confirmation
  const { data } = await db().from('rv_users').select('email,full_name').eq('id', row.user_id).maybeSingle();
  return data ? { email: data.email, name: data.full_name } : null;
}

async function productName(softwareId: string | null): Promise<{ name: string; slug: string }> {
  if (!softwareId) return { name: 'your product', slug: '' };
  const { data } = await db().from('rv_software').select('name,display_name,slug').eq('id', softwareId).maybeSingle();
  return { name: data?.display_name || data?.name || 'your product', slug: data?.slug ?? '' };
}

export async function approveReview(fd: FormData) {
  const me = await requirePermission('reviews.moderate');
  const kind = str(fd, 'kind', 6) === 'expert' ? 'expert' : 'user', id = str(fd, 'id', 60);
  const { data: row } = await db().from(table(kind)).select('*').eq('id', id).maybeSingle();
  if (!row) back('/admin/moderation', 'error', 'Review not found.');
  // rule from the client: a field review can never go live before the respondent has opened the confirmation link
  if (kind === 'user' && row.source === 'field' && !row.verified) back('/admin/moderation', 'error', 'This field review is not verified yet. The respondent must confirm first.');
  const { error } = await db().from(table(kind)).update({
    status: 'approved', reviewed_by: me.id, reviewed_at: new Date().toISOString(), reject_reason_code: null,
  }).eq('id', id);
  if (error) back('/admin/moderation', 'error', 'Could not approve.');
  if (kind === 'expert') { // "the expert is told the moment it is live"
    const a = await authorOf(kind, row), p = await productName(row.software_id);
    if (a) await notify(liveEmail(a.email, a.name, p.name, `${await siteUrl()}/product/${p.slug}`));
  }
  revalidatePath('/admin/moderation');
  back('/admin/moderation', 'ok', 'Approved.');
}

export async function rejectReview(fd: FormData) {
  const me = await requirePermission('reviews.moderate');
  const kind = str(fd, 'kind', 6) === 'expert' ? 'expert' : 'user', id = str(fd, 'id', 60), code = str(fd, 'reason', 40);
  const { data: reason } = await db().from('rv_reject_reasons').select('code,name_en,name_ar').eq('code', code).maybeSingle();
  if (!reason) back('/admin/moderation', 'error', 'Pick a rejection reason from the list.');
  const { data: row } = await db().from(table(kind)).select('*').eq('id', id).maybeSingle();
  if (!row) back('/admin/moderation', 'error', 'Review not found.');
  const { error } = await db().from(table(kind)).update({
    status: 'rejected', reject_reason_code: reason.code, reviewed_by: me.id, reviewed_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) back('/admin/moderation', 'error', 'Could not reject.');
  const a = await authorOf(kind, row), p = await productName(row.software_id);
  if (a) await notify(rejectionEmail(a.email, a.name, p.name, reason.name_en, reason.name_ar)); // the reason goes to the author
  revalidatePath('/admin/moderation');
  back('/admin/moderation', 'ok', 'Rejected. The reason was sent to the author.');
}

/** A vendor has disputed this review: always goes (back) to a person. */
export async function flagDispute(fd: FormData) {
  await requirePermission('reviews.moderate');
  const kind = str(fd, 'kind', 6) === 'expert' ? 'expert' : 'user', id = str(fd, 'id', 60);
  await db().from(table(kind)).update({ status: 'pending', escalated: true, escalation_reason: 'vendor_dispute' }).eq('id', id);
  revalidatePath('/admin/moderation');
  back('/admin/moderation?tab=pending', 'ok', 'Flagged as disputed and moved to the pending queue.');
}
