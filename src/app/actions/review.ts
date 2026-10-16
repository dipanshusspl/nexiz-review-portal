'use server';

import { randomUUID } from 'node:crypto';
import { db } from '@/lib/supabase/admin';
import { can, requireUser } from '@/lib/auth/current-user';
import { COMPANY_SIZES, DURATIONS, ROLES, ZATCA } from '@/lib/i18n';
import { ZATCA_CATEGORY_SLUGS, categoryScopeIds } from '@/lib/data';
import { redirect } from 'next/navigation';
import { isEmail, str } from '@/lib/form';
import { extremeRatings, submittedTooFast } from '@/lib/review-rules';
import { confirmationEmail } from '@/lib/notify/templates';
import { notify, siteUrl } from '@/lib/notify';
import { swName } from '@/lib/data';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const inList = (list: readonly string[], v: string) => list.includes(v);
const rating15 = (v: FormDataEntryValue | null): number | null => {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
};
const isMobile = (s: string) => /^\+?[0-9\s-]{8,16}$/.test(s);

export async function submitReview(fd: FormData) {
  const me = await requireUser();
  const category = str(fd, 'category', 100);
  const software = str(fd, 'software', 100);
  const base = `/review?category=${encodeURIComponent(category)}&software=${encodeURIComponent(software)}`;
  if (!can(me, 'reviews.write')) redirect('/review?error=forbidden');

  // ---- core fields (P1, P2, P3, P5, A1, A2) ----
  const rating = rating15(fd.get('rating'));
  const duration = str(fd, 'duration', 20);
  const pros = str(fd, 'pros', 200);
  const cons = str(fd, 'cons', 200);
  const recommend = str(fd, 'would_recommend', 3);           // 'yes' | 'no'
  const role = str(fd, 'reviewer_role', 20);
  const size = str(fd, 'company_size', 20);
  const stillUsing = str(fd, 'still_using', 3);              // 'yes' | 'no'
  const movedTo = str(fd, 'moved_to', 60);
  const zatca = str(fd, 'zatca_status', 20);
  const anonymous = fd.get('anonymous') === 'on';
  const subs = {
    rating_ease: rating15(fd.get('rating_ease')),
    rating_support: rating15(fd.get('rating_support')),
    rating_value: rating15(fd.get('rating_value')),
  };

  const { data: cat } = await db().from('rv_categories').select('id,slug,is_live').eq('slug', category).maybeSingle();
  const { data: sw } = await db().from('rv_software').select('id,category_id').eq('slug', software).maybeSingle();
  if (!cat || !sw || !cat.is_live) redirect('/review?error=notfound');
  const scope = await categoryScopeIds(cat.id);
  if (!scope.includes(sw.category_id)) redirect('/review?error=notfound');

  const needsZatca = ZATCA_CATEGORY_SLUGS.includes(cat.slug);
  if (
    !rating || !inList(DURATIONS, duration) ||
    pros.length < 20 || cons.length < 20 ||
    !['yes', 'no'].includes(recommend) ||
    !inList(ROLES, role) || !inList(COMPANY_SIZES, size) ||
    !['yes', 'no'].includes(stillUsing) ||
    (needsZatca && !inList(ZATCA, zatca))
  ) redirect(`${base}&error=invalid`);

  // "moved to" must be a product in the same category (optional)
  let movedId: string | null = null;
  if (stillUsing === 'no' && UUID.test(movedTo) && movedTo !== sw.id) {
    const { data: m } = await db().from('rv_software').select('id').eq('id', movedTo).in('category_id', scope).maybeSingle();
    movedId = m?.id ?? null;
  }

  // ---- moderation rules (client answer 3): users publish automatically unless one of these fires ----
  const extreme = extremeRatings([rating, subs.rating_ease, subs.rating_support, subs.rating_value]);

  const row: Record<string, unknown> = {
    software_id: sw.id,
    review_type: 'user',
    rating_overall: rating, ...subs,
    usage_duration: duration,
    pros, cons,
    would_recommend: recommend === 'yes',
    reviewer_role: role, company_size: size,
    zatca_status: needsZatca ? zatca : null,
    still_using: stillUsing === 'yes',
    moved_to_software_id: stillUsing === 'no' ? movedId : null,
    anonymous,
    // legacy columns kept filled so old rows/reports keep working
    rating, duration, comment: `${pros}\n\n${cons}`,
    updated_at: new Date().toISOString(),
  };

  // ---- P7: field-collection mode (field agents only) ----
  const fieldMode = fd.get('field_mode') === 'on' && me.fieldAgent;
  if (fieldMode) {
    const rName = str(fd, 'resp_name', 120);
    const rContact = str(fd, 'resp_contact', 254);
    const rCompany = str(fd, 'resp_company', 120);
    if (!rName || !rCompany || !(isEmail(rContact) || isMobile(rContact))) redirect(`${base}&error=invalid`);

    // respondent is keyed by contact; the review is keyed to the RESPONDENT, not the agent (A6)
    const contact = rContact.toLowerCase();
    let { data: resp } = await db().from('rv_respondents').select('id').eq('contact', contact).maybeSingle();
    if (!resp) {
      const ins = await db().from('rv_respondents')
        .insert({ name: rName, contact, company: rCompany, created_by: me.id }).select('id').single();
      if (ins.error || !ins.data) redirect(`${base}&error=failed`);
      resp = ins.data;
    }
    const { data: dup } = await db().from('rv_reviews').select('id').eq('software_id', sw.id).eq('respondent_id', resp.id).maybeSingle();
    if (dup) redirect(`${base}&error=duplicate`);

    const token = randomUUID().replace(/-/g, '');
    // field reviews stay 'pending' + unverified until the respondent confirms; /confirm then publishes them
    const { data: created, error } = await db().from('rv_reviews').insert({
      ...row, user_id: me.id, source: 'field', verified: false, status: 'pending',
      escalated: extreme, escalation_reason: extreme ? 'all_ratings_extreme' : null,
      collected_by: me.id, respondent_id: resp.id, confirm_token: token,
    }).select('id').single();
    if (error || !created) redirect(`${base}&error=failed`);
    await saveTiming(fd, me.id, sw.id);

    // automatic channel: email (when the respondent gave an email). WhatsApp is sent by the agent from the page.
    let mail = 'skipped';
    if (isEmail(contact)) {
      const { data: swRow } = await db().from('rv_software').select('name,display_name').eq('id', sw.id).single();
      const url = `${await siteUrl()}/confirm?token=${token}`;
      const r = await notify(confirmationEmail(contact, rName, swRow ? swName(swRow) : software, url));
      mail = r.ok ? 'sent' : 'failed';
    }
    redirect(`${base}&ok=savedField&token=${token}&mail=${mail}`);
  }

  // ---- normal web review: one per account per product (A6) ----
  const { data: mine } = await db().from('rv_reviews').select('id,status')
    .eq('software_id', sw.id).eq('user_id', me.id).eq('source', 'web').maybeSingle();
  const burst = mine ? false : await submittedTooFast(me.id);
  const reason = extreme ? 'all_ratings_extreme' : burst ? 'burst' : null;
  // a previously rejected review that is edited goes back to a person, never straight to live
  const status = mine?.status === 'rejected' || reason ? 'pending' : 'approved';
  const moderation = { status, escalated: !!reason, escalation_reason: reason, reject_reason_code: null, reviewed_by: null, reviewed_at: null };
  const { error } = mine
    ? await db().from('rv_reviews').update({ ...row, ...moderation }).eq('id', mine.id)
    : await db().from('rv_reviews').insert({ ...row, ...moderation, user_id: me.id, source: 'web', verified: true });
  if (error) redirect(`${base}&error=failed`);
  await saveTiming(fd, me.id, sw.id);
  redirect(`${base}&ok=saved`);
}

/** Form timing (client answer 5): the browser sends {total_ms, fields:{name:ms}} in a hidden field. Best effort, never blocks a review. */
async function saveTiming(fd: FormData, userId: string, softwareId: string) {
  try {
    const t = JSON.parse(String(fd.get('timing') ?? '{}')) as { total_ms?: number; fields?: Record<string, number> };
    const total = Math.round(Number(t.total_ms));
    if (!Number.isFinite(total) || total <= 0 || total > 4 * 3600_000) return;
    const fields: Record<string, number> = {};
    for (const [k, v] of Object.entries(t.fields ?? {}).slice(0, 40)) if (/^[a-z_]{1,40}$/.test(k) && Number.isFinite(Number(v))) fields[k] = Math.round(Number(v));
    await db().from('rv_form_timing').insert({ form: 'public', user_id: userId, software_id: softwareId, total_ms: total, field_ms: fields });
  } catch { /* ignore */ }
}

/** Part 1: "Can't find your category? Tell us." — captures demand for the next categories. */
export async function submitCategoryRequest(fd: FormData) {
  const me = await requireUser();
  const text = str(fd, 'text', 300);
  if (text.length >= 2) await db().from('rv_category_requests').insert({ user_id: me.id, text });
  redirect('/review?ok=requested');
}
