import 'server-only';
import { createHash } from 'node:crypto';
import { db, IMAGE_BUCKET } from '@/lib/supabase/admin';
import type { CurrentUser } from '@/lib/auth/current-user';
import { extremeRatings } from '@/lib/review-rules';
import {
  ExpertInputError, SYSTEMS, COMPLIANCE_ROWS, COMPLIANCE_STATUS, UUID, all, arr, httpUrl, lookups, normalize, nul, obj, rating, resolvePhoto, txt, year,
} from '@/lib/expert';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;
type Opt = { code: string; ar: string; en: string };

/* ============================================================================================
 * Fixed lists from the client's change request
 * ========================================================================================== */
export const DURATIONS_V2: Opt[] = [
  { code: 'dur_lt6', en: '< 6 months', ar: 'أقل من 6 أشهر' }, { code: 'dur_6_12', en: '6 to 12 months', ar: 'من 6 إلى 12 شهرًا' },
  { code: 'dur_1_2', en: '1 to 2 years', ar: 'من سنة إلى سنتين' }, { code: 'dur_2_5', en: '2 to 5 years', ar: 'من 2 إلى 5 سنوات' },
  { code: 'dur_5p', en: '5+ years', ar: 'أكثر من 5 سنوات' },
];
export const SIZES_V2: Opt[] = [
  { code: 'size_1_10', en: '1 to 10', ar: '1 إلى 10' }, { code: 'size_11_50', en: '11 to 50', ar: '11 إلى 50' },
  { code: 'size_51_200', en: '51 to 200', ar: '51 إلى 200' }, { code: 'size_201_500', en: '201 to 500', ar: '201 إلى 500' },
  { code: 'size_500p', en: '500+', ar: 'أكثر من 500' },
];
export const INTEGRATION_OUTCOMES: Opt[] = [
  { code: 'worked', en: 'Worked well', ar: 'نجح بشكل جيد' }, { code: 'effort', en: 'Needed effort', ar: 'احتاج جهدًا' },
  { code: 'failed', en: 'Did not work', ar: 'لم ينجح' },
];
export type FnGroup = 'accounting' | 'erp' | 'pos';
export const FN_GROUPS: FnGroup[] = ['accounting', 'erp', 'pos'];

const codesOf = (l: Opt[]) => new Set(l.map((o) => o.code));
const OUTCOME_SET = codesOf(INTEGRATION_OUTCOMES);
const COMP_ROW_SET = codesOf(COMPLIANCE_ROWS);
const COMP_STATUS_SET = codesOf(COMPLIANCE_STATUS);

/* ============================================================================================
 * Text rules
 * ========================================================================================== */
/** True for very short or meaningless text in a SHORT field (e.g. "صیصص", "aaa", "..", "12"). */
export function badShort(s: string): boolean {
  const t = s.trim();
  if (t.length < 2) return true;
  const letters = [...t].filter((c) => /\p{L}/u.test(c));
  if (letters.length < 2) return true;
  const distinct = new Set([...t.toLowerCase()].filter((c) => /[\p{L}\p{N}]/u.test(c)));
  if (distinct.size < Math.min(3, letters.length)) return true;
  if (/(.)\1{2,}/u.test(t)) return true;
  return false;
}
const isUuid = (s: string) => UUID.test(s);

/* ============================================================================================
 * Function lists (admin editable) and catalogue for the screen
 * ========================================================================================== */
export async function functionLists(): Promise<Record<FnGroup, Opt[]>> {
  const rows = await all('rv_function_options', 'function_group,code,name_en,name_ar,sort_order,is_active');
  const by = (g: string) => rows.filter((r) => r.function_group === g && r.is_active !== false).map((r): Opt => ({ code: r.code, en: r.name_en, ar: r.name_ar }));
  const acct = by('accounting');
  return { accounting: acct, erp: [...acct, ...by('erp_extra')], pos: by('pos') };
}

export async function loadReviewCatalog() {
  const [lk, cats, sw, fns, reasons] = await Promise.all([
    lookups(),
    all('rv_categories', 'id,name_en,name_ar,is_live,function_group'),
    all('rv_software', 'id,category_id,name,display_name'),
    functionLists(),
    all('rv_reject_reasons', 'code,name_en,name_ar'),
  ]);
  const grp = new Map<string, FnGroup>(cats.map((c) => [c.id, (FN_GROUPS.includes(c.function_group) ? c.function_group : 'accounting') as FnGroup]));
  const liveCat = new Set(cats.filter((c) => c.is_live).map((c) => c.id));
  const options: Record<string, Opt[]> = {};
  for (const o of lk.options) (options[o.group_code] ??= []).push({ code: o.code, ar: o.ar, en: o.en });
  const pick = (g: string) => options[g] ?? [];
  return {
    SOFTWARE: sw.filter((s) => liveCat.has(s.category_id)).map((s) => ({ id: s.id, ar: s.display_name || s.name, en: s.display_name || s.name, group: grp.get(s.category_id) ?? 'accounting' })),
    FUNCTIONS: fns,
    DURATIONS: DURATIONS_V2, SIZES: SIZES_V2,
    OPTIONS: {
      business_type: pick('business_type'), decision_maker: pick('decision_maker'), golive_time: pick('golive_time'),
      longer_than_told: pick('longer_than_told'), implementer: pick('implementer'), annual_cost: pick('annual_cost'),
      still_using: pick('still_using'), would_choose_again: pick('would_choose_again'), recommend: pick('recommend'), relationship: pick('relationship'),
      cert_title: pick('cert_title'), cert_issuer: pick('cert_issuer'), project_type: pick('project_type'), project_role: pick('project_role'), industry: pick('industry'),
      professional_role: lk.roles, experience: lk.experience, expertise: lk.expertise, service: lk.services,
    },
    COMPLIANCE_ROWS, COMPLIANCE_STATUS, INTEGRATION_SYSTEMS: SYSTEMS.filter((s) => s.code !== 'other'), INTEGRATION_OUTCOMES,
    REJECT_REASONS: Object.fromEntries(reasons.map((r) => [r.code, { en: r.name_en, ar: r.name_ar }])),
  };
}

/* ============================================================================================
 * Review <-> row mapping
 * ========================================================================================== */
export type Answers = Record<string, any>;

function sanitizeAnswers(raw: unknown, lk: Awaited<ReturnType<typeof lookups>>, fns: Record<FnGroup, Opt[]>, softwareGroup: FnGroup | null): Answers {
  const a = obj(raw);
  const group = (g: string) => new Set(lk.options.filter((o) => o.group_code === g).map((o) => o.code));
  const one = (v: unknown, set: Set<string>) => { const s = txt(v, 60); return set.has(s) ? s : ''; };
  const roleSet = new Set(lk.roles.map((r) => r.code));
  const g = (softwareGroup ?? (FN_GROUPS.includes(a.custom_group) ? a.custom_group : 'accounting')) as FnGroup;
  const allowedFn = codesOf(fns[g]);
  const fnPicked = [...new Set(arr(a.functions).map((x) => txt(x, 40)).filter((x) => allowedFn.has(x) || x === 'other'))];
  const comp: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj(a.compliance))) if (COMP_ROW_SET.has(k) && COMP_STATUS_SET.has(String(v))) comp[k] = String(v);
  const integrations = arr(a.integrations).slice(0, 12).map(obj).map((x) => ({
    name: txt(x.name, 80), purpose: txt(x.purpose, 200), outcome: OUTCOME_SET.has(txt(x.outcome, 20)) ? txt(x.outcome, 20) : '', experience: txt(x.experience, 2000),
  })).filter((x) => x.name || x.purpose || x.outcome || x.experience);
  const rate = (v: unknown, allowUnrated: boolean) => (allowUnrated && v === 'unrated' ? 'unrated' : rating(v) ? String(rating(v)) : '');
  const role = txt(a.role, 120);
  return {
    software: isUuid(txt(a.software, 60)) ? txt(a.software, 60) : a.software === 'custom' ? 'custom' : '',
    custom_name: txt(a.custom_name, 120), custom_group: g,
    role: roleSet.has(role) ? role : role,
    duration: one(a.duration, codesOf(DURATIONS_V2)),
    functions: fnPicked, functions_other: txt(a.functions_other, 120),
    business_type: one(a.business_type, group('business_type')), business_name: txt(a.business_name, 120),
    company_size: one(a.company_size, codesOf(SIZES_V2)),
    deciders: [...new Set(arr(a.deciders).map((x) => txt(x, 60)).filter((x) => group('decision_maker').has(x)))],
    golive_time: one(a.golive_time, group('golive_time')), longer_than_told: one(a.longer_than_told, group('longer_than_told')),
    implementer: one(a.implementer, group('implementer')),
    integrations, no_integrations: a.no_integrations === true && integrations.length === 0,
    compliance: comp, difficulty: txt(a.difficulty, 2000), wishlist: txt(a.wishlist, 2000), who_not_buy: txt(a.who_not_buy, 2000),
    annual_cost: one(a.annual_cost, group('annual_cost')), previous_software: txt(a.previous_software, 120),
    still_using: one(a.still_using, group('still_using')), moved_to: txt(a.moved_to, 120), moved_reason: txt(a.moved_reason, 2000),
    overall: rate(a.overall, false), ease: rate(a.ease, false), support: rate(a.support, true), value: rate(a.value, true),
    choose_again: one(a.choose_again, group('would_choose_again')), recommend: one(a.recommend, group('recommend')),
    relationship: one(a.relationship, group('relationship')), relationship_detail: txt(a.relationship_detail, 600),
    declaration: a.declaration === true, anonymous: a.anonymous === true,
  };
}

/** Validation for SUBMIT. Returns { field: code }. Only REQUIRED fields that are missing or invalid are reported. */
export function validateForSubmit(a: Answers, fns: Record<FnGroup, Opt[]>, softwareKnown: boolean): Record<string, string> {
  const e: Record<string, string> = {};
  const short = (field: string, v: string, emptyCode = 'required') => { if (!v) e[field] = emptyCode; else if (badShort(v)) e[field] = 'short'; };
  // step 1
  if (!softwareKnown && a.software !== 'custom') e.software = 'software';
  if (a.software === 'custom') short('custom_name', a.custom_name, 'software');
  short('role', a.role, 'role');
  if (!a.duration) e.duration = 'duration';
  if (!a.functions.length) e.functions = 'functions';
  else if (a.functions.includes('other') && !a.functions_other) e.functions_other = 'other_fn';
  else if (a.functions.includes('other') && badShort(a.functions_other)) e.functions_other = 'short';
  // step 2
  if (!a.business_type) e.business_type = 'required';
  short('business_name', a.business_name);
  if (!a.company_size) e.company_size = 'required';
  if (!a.deciders.length) e.deciders = 'required';
  if (!a.golive_time) e.golive_time = 'required';
  if (!a.longer_than_told) e.longer_than_told = 'required';
  if (!a.no_integrations) {
    if (!a.integrations.length) e.integrations = 'int_none';
    a.integrations.forEach((x: Row, i: number) => {
      if (x.name && badShort(x.name)) e[`integrations.${i}.name`] = 'short';
      if (!x.name) e[`integrations.${i}.name`] = 'required';
      if (!x.purpose) e[`integrations.${i}.purpose`] = 'int_purpose'; else if (badShort(x.purpose)) e[`integrations.${i}.purpose`] = 'short';
      if (!x.outcome) e[`integrations.${i}.outcome`] = 'int_status';
    });
  }
  if (COMPLIANCE_ROWS.some((r) => !a.compliance[r.code])) e.compliance = 'compliance';
  if (a.wishlist.length < 30) e.wishlist = 'min30';
  if (a.who_not_buy.length < 30) e.who_not_buy = 'min30';
  if (!a.annual_cost) e.annual_cost = 'required';
  short('previous_software', a.previous_software);
  if (!a.still_using) e.still_using = 'required';
  if (a.moved_to && badShort(a.moved_to)) e.moved_to = 'short';
  // step 3
  if (!a.overall || !a.ease || !a.support || !a.value) e.ratings = 'ratings';
  if (!a.choose_again) e.choose_again = 'required';
  if (!a.recommend) e.recommend = 'required';
  if (!a.relationship) e.relationship = 'required';
  else if (a.relationship !== 'rel_none' && a.relationship_detail.length < 10) e.relationship_detail = 'min10';
  if (!a.declaration) e.declaration = 'declaration';
  return e;
}

function answersToRow(a: Answers): Row {
  const c = (k: string) => nul(a[k] ?? '');
  const rate = (v: string) => (v && v !== 'unrated' ? Number(v) : null);
  return {
    custom_software_name: a.software === 'custom' ? c('custom_name') : null,
    custom_function_group: a.software === 'custom' ? a.custom_group : null,
    role_when_used: c('role'), usage_duration_code: c('duration'),
    features_used: a.functions, features_other: a.functions.includes('other') ? c('functions_other') : null,
    business_type_code: c('business_type'), lead_company: c('business_name'), company_size_code: c('company_size'),
    decision_maker_codes: a.deciders, decision_maker_code: a.deciders[0] ?? null,
    golive_time_code: c('golive_time'), longer_than_told_code: c('longer_than_told'), implementer_code: c('implementer'),
    integrations: a.integrations, no_integrations: a.no_integrations,
    compliance: a.compliance, biggest_difficulty: c('difficulty'), wishlist: c('wishlist'), who_should_not_buy: c('who_not_buy'),
    annual_cost_code: c('annual_cost'), previous_software: c('previous_software'), still_using_code: c('still_using'),
    moved_to_software: c('moved_to'), moved_to_reason: c('moved_reason'),
    overall_rating: rate(a.overall), ease_rating: rate(a.ease),
    support_rating: rate(a.support), support_unrated: a.support === 'unrated',
    value_rating: rate(a.value), value_unrated: a.value === 'unrated',
    would_choose_again_code: c('choose_again'), recommended_code: c('recommend'),
    relationship_code: c('relationship'), relationship_detail: c('relationship_detail'),
    declaration_confirmed: a.declaration, anonymous: a.anonymous,
  };
}

function rowToAnswers(r: Row): Answers {
  const s = (v: unknown) => (v == null ? '' : String(v));
  const rt = (n: unknown, unrated: unknown) => (unrated ? 'unrated' : n == null ? '' : String(n));
  return {
    software: r.software_id ?? (r.custom_software_name ? 'custom' : ''), custom_name: s(r.custom_software_name), custom_group: s(r.custom_function_group),
    role: s(r.role_when_used), duration: s(r.usage_duration_code), functions: arr(r.features_used), functions_other: s(r.features_other),
    business_type: s(r.business_type_code), business_name: s(r.lead_company), company_size: s(r.company_size_code),
    deciders: arr(r.decision_maker_codes), golive_time: s(r.golive_time_code), longer_than_told: s(r.longer_than_told_code), implementer: s(r.implementer_code),
    integrations: arr(r.integrations), no_integrations: !!r.no_integrations,
    compliance: obj(r.compliance), difficulty: s(r.biggest_difficulty), wishlist: s(r.wishlist), who_not_buy: s(r.who_should_not_buy),
    annual_cost: s(r.annual_cost_code), previous_software: s(r.previous_software), still_using: s(r.still_using_code),
    moved_to: s(r.moved_to_software), moved_reason: s(r.moved_to_reason),
    overall: rt(r.overall_rating, false), ease: rt(r.ease_rating, false), support: rt(r.support_rating, r.support_unrated), value: rt(r.value_rating, r.value_unrated),
    choose_again: s(r.would_choose_again_code), recommend: s(r.recommended_code),
    relationship: s(r.relationship_code), relationship_detail: s(r.relationship_detail),
    declaration: !!r.declaration_confirmed, anonymous: !!r.anonymous,
  };
}

export type ReviewDTO = {
  id: string; status: 'draft' | 'pending' | 'approved' | 'rejected'; step: number; answers: Answers;
  software_name: string; reject_reason: { en: string; ar: string } | null; updated_at: string | null;
};

/* ============================================================================================
 * Load: everything the screen needs for this person (nothing is secret to the person themselves)
 * ========================================================================================== */
async function profileId(user: CurrentUser, lang: 'en' | 'ar', create: boolean): Promise<string | null> {
  const { data: p, error } = await db().from('rv_expert_profiles').select('id').eq('user_id', user.id).maybeSingle();
  if (error) throw new Error(error.message);
  if (p) return p.id as string;
  if (!create) return null;
  const { data: ins, error: e2 } = await db().from('rv_expert_profiles')
    .insert({ user_id: user.id, status: 'draft', language: lang, full_name: user.fullName, email: user.email }).select('id').single();
  if (e2 || !ins) {
    const again = await db().from('rv_expert_profiles').select('id').eq('user_id', user.id).maybeSingle(); // parallel request
    if (again.data) return again.data.id as string;
    throw new Error(e2?.message ?? 'profile create failed');
  }
  return ins.id as string;
}

export async function loadMyReviews(user: CurrentUser): Promise<ReviewDTO[]> {
  const pid = await profileId(user, 'ar', false);
  if (!pid) return [];
  const [{ data: rows, error }, { data: sws }, reasons] = await Promise.all([
    db().from('rv_expert_software_reviews').select('*').eq('profile_id', pid).order('created_at', { ascending: true }),
    db().from('rv_software').select('id,name,display_name'),
    all('rv_reject_reasons', 'code,name_en,name_ar'),
  ]);
  if (error) throw new Error(error.message);
  const name = new Map<string, string>(((sws ?? []) as Row[]).map((s) => [s.id, s.display_name || s.name]));
  const why = new Map<string, Row>(reasons.map((r) => [r.code, r]));
  return ((rows ?? []) as Row[]).map((r): ReviewDTO => ({
    id: r.id, status: (['draft', 'pending', 'approved', 'rejected'].includes(r.status) ? r.status : 'draft') as ReviewDTO['status'],
    step: Number(r.current_step) || 1, answers: rowToAnswers(r),
    software_name: (r.software_id && name.get(r.software_id)) || r.custom_software_name || '',
    reject_reason: r.status === 'rejected' && r.reject_reason_code && why.get(r.reject_reason_code)
      ? { en: why.get(r.reject_reason_code)!.name_en, ar: why.get(r.reject_reason_code)!.name_ar } : null,
    updated_at: r.updated_at ?? null,
  }));
}

/* ============================================================================================
 * Save a review (draft or submit). One review per person per product.
 * ========================================================================================== */
export type SaveResult = { ok: true; review: ReviewDTO } | { ok: false; errors: Record<string, string> };

export async function saveReview(user: CurrentUser, body: unknown): Promise<SaveResult> {
  const b = obj(body);
  const submit = b.submit === true;
  const lang = b.language === 'en' ? 'en' : 'ar';
  const lk = await lookups();
  const fns = await functionLists();

  // which software is it, and is it in the catalogue?
  const rawSoftware = txt(obj(b.answers).software, 60);
  let softwareGroup: FnGroup | null = null, softwareName = '';
  if (isUuid(rawSoftware)) {
    const { data: sw } = await db().from('rv_software').select('id,name,display_name,category_id').eq('id', rawSoftware).maybeSingle();
    if (!sw) throw new ExpertInputError(lang === 'ar' ? 'النظام غير موجود في القائمة.' : 'That software is not in the list.');
    const { data: cat } = await db().from('rv_categories').select('function_group').eq('id', sw.category_id).maybeSingle();
    softwareGroup = (FN_GROUPS.includes(cat?.function_group) ? cat?.function_group : 'accounting') as FnGroup;
    softwareName = sw.display_name || sw.name;
  }
  const a = sanitizeAnswers(b.answers, lk, fns, softwareGroup);
  if (!a.software) {
    if (submit) return { ok: false, errors: { software: 'software' } };
    throw new ExpertInputError(lang === 'ar' ? 'اختر النظام أولًا.' : 'Choose the software first.');
  }
  if (a.software === 'custom' && !a.custom_name) {
    if (submit) return { ok: false, errors: { custom_name: 'software' } };
    throw new ExpertInputError(lang === 'ar' ? 'اكتب اسم النظام.' : 'Write the name of the software.');
  }
  if (a.software === 'custom') softwareName = a.custom_name;

  const pid = (await profileId(user, lang, true))!;

  // existing review for this person + product (by id first, then by product)
  const wanted = txt(b.id, 60);
  let existing: Row | null = null;
  if (isUuid(wanted)) {
    const { data } = await db().from('rv_expert_software_reviews').select('*').eq('id', wanted).eq('profile_id', pid).maybeSingle();
    existing = data ?? null;
  }
  if (!existing) {
    const q = db().from('rv_expert_software_reviews').select('*').eq('profile_id', pid);
    const { data } = isUuid(rawSoftware) ? await q.eq('software_id', rawSoftware).maybeSingle() : await q.ilike('custom_software_name', a.custom_name.replace(/[%_\\]/g, (m: string) => '\\' + m)).maybeSingle();
    existing = data ?? null;
  }
  if (existing && (existing.status === 'pending' || existing.status === 'approved')) {
    throw new ExpertInputError(lang === 'ar' ? 'سبق أن أرسلت مراجعة لهذا النظام.' : 'You already submitted a review for this software.');
  }
  // a review already exists for the product chosen by a DIFFERENT row of the same person
  if (existing && isUuid(wanted) && existing.id !== wanted) throw new ExpertInputError(lang === 'ar' ? 'سبق أن بدأت مراجعة لهذا النظام.' : 'You already have a review for this software.');

  const base = answersToRow(a);
  const now = new Date().toISOString();
  const step = Math.min(3, Math.max(1, Number(b.step) || 1));
  const row: Row = { ...base, software_id: isUuid(rawSoftware) ? rawSoftware : null, current_step: step, updated_at: now };

  if (submit) {
    const errors = validateForSubmit(a, fns, !!softwareGroup);
    if (Object.keys(errors).length) return { ok: false, errors };
    const allFns = (softwareGroup ?? a.custom_group) && fns[(softwareGroup ?? a.custom_group) as FnGroup].map((o) => o.code);
    const everything = !!allFns && allFns.length > 0 && allFns.every((c: string) => a.functions.includes(c));
    const extreme = extremeRatings([row.overall_rating, row.ease_rating, row.support_rating, row.value_rating]);
    const { updated_at: _u, ...contentOnly } = row; void _u;
    Object.assign(row, {
      status: 'pending', is_complete: true, escalated: true,
      escalation_reason: everything ? 'all_functions' : extreme ? 'all_ratings_extreme' : 'expert',
      reviewed_by: null, reviewed_at: null, reject_reason_code: null, submitted_at: now, current_step: 3,
      content_sig: createHash('sha256').update(JSON.stringify(contentOnly)).digest('hex'),
    });
  } else {
    // a rejected review stays "Rejected" (with its reason) until it is resubmitted
    row.status = existing?.status === 'rejected' ? 'rejected' : 'draft';
    if (!existing) row.is_complete = false;
  }

  let saved: Row;
  if (existing) {
    const { data, error } = await db().from('rv_expert_software_reviews').update(row).eq('id', existing.id).select('*').single();
    if (error || !data) throw new Error(error?.message ?? 'update failed');
    saved = data;
  } else {
    const { count } = await db().from('rv_expert_software_reviews').select('id', { count: 'exact', head: true }).eq('profile_id', pid);
    const { data, error } = await db().from('rv_expert_software_reviews').insert({
      ...row, profile_id: pid, user_id: user.id, review_type: 'expert', sort_order: count ?? 0, is_complete: row.is_complete ?? false,
    }).select('*').single();
    if (error || !data) {
      if (error?.code === '23505') throw new ExpertInputError(lang === 'ar' ? 'سبق أن بدأت مراجعة لهذا النظام.' : 'You already have a review for this software.');
      throw new Error(error?.message ?? 'insert failed');
    }
    saved = data;
  }

  // software that is not in the catalogue waits for an admin (never goes into the catalogue by itself)
  if (a.software === 'custom') {
    const { data: p } = await db().from('rv_pending_software').select('id').eq('review_id', saved.id).maybeSingle();
    if (p) await db().from('rv_pending_software').update({ name: a.custom_name, function_group: a.custom_group }).eq('id', p.id);
    else await db().from('rv_pending_software').insert({ name: a.custom_name, function_group: a.custom_group, review_id: saved.id, user_id: user.id });
  }

  // time to complete (client sends the active time it measured); stored once, on submit
  if (submit) {
    try {
      const total = Math.round(Number(obj(b.timing).total_ms));
      if (Number.isFinite(total) && total > 0 && total < 4 * 3600_000) await db().from('rv_form_timing').insert({ form: 'expert', user_id: user.id, total_ms: total, field_ms: {} });
    } catch { /* best effort */ }
  }

  return { ok: true, review: (await loadMyReviews(user)).find((r) => r.id === saved.id) ?? {
    id: saved.id, status: saved.status, step, answers: a, software_name: softwareName, reject_reason: null, updated_at: now,
  } };
}

/* ============================================================================================
 * Profile (separate from reviews: saving it never touches a review, and reviews never touch it)
 * ========================================================================================== */
export function profileCompletion(p: Row): { pct: number; missing: string[] } {
  const checks: [string, boolean][] = [
    ['photo', !!p.avatar], ['full_name', !!p.full_name], ['email', !!p.email], ['phone', !!p.phone], ['role', !!p.professional_role],
    ['experience', !!p.experience_years], ['expertise', arr(p.specialties).length > 0], ['bio', !!p.consultant_bio], ['linkedin', !!p.linkedin_url],
  ];
  return { pct: Math.round((checks.filter(([, ok]) => ok).length / checks.length) * 100), missing: checks.filter(([, ok]) => !ok).map(([k]) => k) };
}

export async function loadProfileState(user: CurrentUser) {
  const pid = await profileId(user, 'ar', false);
  const { data: u } = await db().from('rv_users').select('oauth_picture').eq('id', user.id).maybeSingle();
  const blank = {
    profile: { language: 'ar', full_name: user.fullName, email: user.email, phone: '', professional_role: '', experience_years: '', linkedin_url: '', consultant_bio: '', consent_expert: false },
    avatar: (u?.oauth_picture as string) || '', avatar_from_provider: !!u?.oauth_picture,
    specialties: [] as string[], services: [] as string[], certificates: [] as Row[], projects: [] as Row[], saved: false,
  };
  if (!pid) return blank;
  const { data: p } = await db().from('rv_expert_profiles').select('*').eq('id', pid).single();
  const [exp, svc, certs, projs] = await Promise.all([
    db().from('rv_expert_profile_expertise').select('expertise_code,other_text').eq('profile_id', pid),
    db().from('rv_expert_profile_services').select('service_code,other_text').eq('profile_id', pid),
    db().from('rv_expert_certificates').select('*').eq('profile_id', pid).order('sort_order'),
    db().from('rv_expert_projects').select('*').eq('profile_id', pid).order('sort_order'),
  ]);
  const s = (v: unknown) => (v == null ? '' : String(v));
  const photo = s(p?.photo_url);
  return {
    profile: {
      language: p?.language === 'en' ? 'en' : 'ar', full_name: s(p?.full_name) || user.fullName, email: s(p?.email) || user.email, phone: s(p?.phone),
      professional_role: s(p?.professional_role_code ?? p?.professional_role_other), experience_years: s(p?.experience_range_code),
      linkedin_url: s(p?.linkedin_url), consultant_bio: s(p?.bio), consent_expert: !!p?.consent_expert,
    },
    avatar: photo || blank.avatar, avatar_from_provider: !photo && blank.avatar_from_provider,
    specialties: (exp.data ?? []).map((r: Row) => s(r.expertise_code ?? r.other_text)),
    services: (svc.data ?? []).map((r: Row) => s(r.service_code ?? r.other_text)),
    certificates: (certs.data ?? []).map((r: Row) => ({ title: s(r.title_code ?? r.title_other), issuer: s(r.issuer_code ?? r.issuer_other), year: s(r.year), link: s(r.link) })),
    projects: (projs.data ?? []).map((r: Row) => ({ title: s(r.title), type: s(r.type_code ?? r.type_other), role: s(r.role_code ?? r.role_other), industry: s(r.industry_code ?? r.industry_other), software: s(r.software_other), year: s(r.year), result: s(r.result) })),
    saved: true,
  };
}

/** Best effort: copy the Google/LinkedIn picture into our storage so the profile does not depend on the provider's URL. */
async function importProviderPhoto(userId: string, url: string): Promise<string | null> {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' || !(u.hostname.endsWith('googleusercontent.com') || u.hostname.endsWith('licdn.com'))) return null;
    const res = await fetch(u, { signal: AbortSignal.timeout(5000), cache: 'no-store' });
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length < 4 || bytes.length > 1_000_000 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null; // JPEG only
    const path = `experts/${userId}.jpg`;
    const { error } = await db().storage.from(IMAGE_BUCKET).upload(path, bytes, { contentType: 'image/jpeg', upsert: true });
    if (error) return null;
    return `${db().storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl}?v=${Date.now()}`;
  } catch { return null; }
}

export async function saveProfile(user: CurrentUser, body: unknown) {
  const b = obj(body), p = obj(b.profile);
  const lang = p.language === 'en' ? 'en' : 'ar';
  const T = (en: string, ar: string) => new ExpertInputError(lang === 'ar' ? ar : en);
  const lk = await lookups();
  const optGroup = new Map(lk.options.map((o) => [o.code, o.group_code]));
  const roleSet = new Set(lk.roles.map((o) => o.code)), expSet = new Set(lk.experience.map((o) => o.code));
  const expertiseSet = new Set(lk.expertise.map((o) => o.code)), serviceSet = new Set(lk.services.map((o) => o.code));
  const pick = (group: string, v: unknown) => { const s = txt(v, 120); return !s ? { code: null, other: null } : optGroup.get(s) === group ? { code: s, other: null } : { code: null, other: s }; };

  const fullName = txt(p.full_name, 120), email = txt(p.email, 254), roleRaw = txt(p.professional_role, 120), expRaw = txt(p.experience_years, 40);
  if (!fullName) throw T('Full name is required.', 'الاسم الكامل مطلوب.');
  if (badShort(fullName)) throw T('This doesn\'t look like a complete answer. Please check it.', 'تبدو هذه الإجابة غير مكتملة، يرجى مراجعتها.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw T('Enter a valid email address.', 'أدخل بريدًا إلكترونيًا صحيحًا.');
  if (!roleRaw) throw T('Professional role is required.', 'المسمى المهني مطلوب.');
  if (!roleSet.has(roleRaw) && badShort(roleRaw)) throw T('This doesn\'t look like a complete answer. Please check it.', 'تبدو هذه الإجابة غير مكتملة، يرجى مراجعتها.');
  if (!expSet.has(expRaw)) throw T('Years of experience is required.', 'سنوات الخبرة مطلوبة.');
  const linkedin = txt(p.linkedin_url, 400);
  if (linkedin && !(httpUrl(linkedin) && /(^|\.)linkedin\.com$/i.test(new URL(httpUrl(linkedin)!).hostname))) throw T('Enter your LinkedIn profile URL (linkedin.com).', 'أدخل رابط ملفك على LinkedIn (linkedin.com).');

  const pid = (await profileId(user, lang, true))!;
  const { data: existing } = await db().from('rv_expert_profiles').select('photo_url').eq('id', pid).single();

  const photoIn = typeof b.avatar === 'string' ? b.avatar : '';
  let photo_url: string | null;
  if (photoIn.startsWith('data:')) photo_url = await resolvePhoto(user.id, photoIn, existing?.photo_url ?? null);
  else if (/^https:\/\//.test(photoIn)) { // our own stored URL (keep) or the provider's picture (copy it once)
    const own = existing?.photo_url && photoIn.split('?')[0] === String(existing.photo_url).split('?')[0];
    photo_url = own ? existing!.photo_url : (await importProviderPhoto(user.id, photoIn)) ?? existing?.photo_url ?? null;
  } else photo_url = await resolvePhoto(user.id, '', existing?.photo_url ?? null); // empty = the person removed the photo

  const role = roleSet.has(roleRaw) ? { code: roleRaw, other: null } : { code: null, other: roleRaw };
  const complete = profileCompletion({ ...p, avatar: photo_url, professional_role: roleRaw, specialties: b.specialties });
  const { error: pErr } = await db().from('rv_expert_profiles').update({
    status: ['full_name', 'email', 'role', 'experience'].every((k) => !complete.missing.includes(k)) ? 'submitted' : 'draft', language: lang,
    full_name: fullName, email, phone: nul(txt(p.phone, 30)), professional_role_code: role.code, professional_role_other: role.other,
    experience_range_code: expSet.has(expRaw) ? expRaw : null, linkedin_url: linkedin ? httpUrl(linkedin) : null, bio: nul(txt(p.consultant_bio, 2000)),
    consent_expert: p.consent_expert === true, photo_url, updated_at: new Date().toISOString(),
  }).eq('id', pid);
  if (pErr) throw new Error(pErr.message);

  const tags = (list: unknown, valid: Set<string>, col: string) => {
    const out: Row[] = [], done = new Set<string>();
    for (const x of arr(list).slice(0, 40)) {
      const s = txt(x, 120);
      if (!s || done.has(s.toLowerCase())) continue;
      if (!valid.has(s) && badShort(s)) continue; // meaningless custom text is dropped
      done.add(s.toLowerCase());
      out.push(valid.has(s) ? { [col]: s, other_text: null } : { [col]: null, other_text: s });
    }
    return out;
  };
  const certRows = arr(b.certificates).slice(0, 50).map(obj).map((c, i) => {
    const title = pick('cert_title', c.title), issuer = pick('cert_issuer', c.issuer);
    return { title_code: title.code, title_other: title.other, issuer_code: issuer.code, issuer_other: issuer.other, year: year(c.year), link: httpUrl(c.link), sort_order: i };
  }).filter((r) => r.title_code || r.title_other || r.issuer_code || r.issuer_other || r.year || r.link);
  const projectRows = arr(b.projects).slice(0, 50).map(obj).map((pr, i) => {
    const type = pick('project_type', pr.type), prole = pick('project_role', pr.role), industry = pick('industry', pr.industry);
    return { title: nul(txt(pr.title, 120)), type_code: type.code, type_other: type.other, role_code: prole.code, role_other: prole.other,
      industry_code: industry.code, industry_other: industry.other, software_id: null, software_other: nul(txt(pr.software, 120)), year: year(pr.year), result: nul(txt(pr.result, 2000)), sort_order: i };
  }).filter((r) => r.title || r.type_code || r.type_other || r.role_code || r.role_other || r.industry_code || r.industry_other || r.software_other || r.year || r.result);

  // child rows of the PROFILE only. Reviews are never touched here.
  const del = await Promise.all(['rv_expert_profile_expertise', 'rv_expert_profile_services', 'rv_expert_certificates', 'rv_expert_projects'].map((t) => db().from(t).delete().eq('profile_id', pid)));
  for (const d of del) if (d.error) throw new Error(d.error.message);
  const withPid = (rows: Row[]) => rows.map((r) => ({ ...r, profile_id: pid }));
  const ex = tags(b.specialties, expertiseSet, 'expertise_code'), sv = p.consent_expert === true ? tags(b.services, serviceSet, 'service_code') : [];
  const ins = await Promise.all([
    ex.length ? db().from('rv_expert_profile_expertise').insert(withPid(ex)) : null, sv.length ? db().from('rv_expert_profile_services').insert(withPid(sv)) : null,
    certRows.length ? db().from('rv_expert_certificates').insert(withPid(certRows)) : null, projectRows.length ? db().from('rv_expert_projects').insert(withPid(projectRows)) : null,
  ]);
  for (const r of ins) if (r && r.error) throw new Error(r.error.message);
  return { photo_url, completion: profileCompletion({ ...p, avatar: photo_url, professional_role: roleRaw, specialties: ex.map((x) => x.expertise_code ?? x.other_text) }) };
}

/* ============================================================================================
 * Admin helper: median time to complete a FIRST expert review (the client asked for this number)
 * ========================================================================================== */
export async function medianFirstReviewMinutes(): Promise<{ minutes: number | null; people: number }> {
  const { data } = await db().from('rv_form_timing').select('*').eq('form', 'expert');
  const first = new Map<string, { at: string; ms: number }>();
  for (const r of (data ?? []) as Row[]) {
    if (!r.user_id || !Number.isFinite(Number(r.total_ms))) continue;
    const at = String(r.created_at ?? '');
    const cur = first.get(r.user_id);
    if (!cur || at < cur.at) first.set(r.user_id, { at, ms: Number(r.total_ms) });
  }
  const v = [...first.values()].map((x) => x.ms).sort((x, y) => x - y);
  if (!v.length) return { minutes: null, people: 0 };
  const mid = Math.floor(v.length / 2);
  const ms = v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
  return { minutes: Math.round((ms / 60000) * 10) / 10, people: v.length };
}
