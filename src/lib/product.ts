import 'server-only';
import { db } from '@/lib/supabase/admin';
import { chipStatus, type Answer } from '@/lib/chip-status'; // Added by Prachi, 2026-11-03
import { SIZES_V2, RESOLVED } from '@/lib/expert-v2'; // 19 Nov: labels for the new expert answers
import { recommendSummary, scoreSummary, sizeBucket, top } from '@/lib/score-math'; // Added by Prachi, 2026-11-05
export { sizeBucket }; // Added by Prachi, 2026-11-05: other files may still import it from here

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export const MIN_REVIEWS_TO_SCORE = 5;   // under this: "too few reviews to score", no number
export const MIN_COMPLIANCE_ANSWERS = 5; // a compliance status publishes only at 5 answers
export const MIN_LEAVERS = 5;            // "moved to" shows only once 5 reviewers have left the product

export type Status = 'ok' | 'partial' | 'no' | 'none';
export type Item = {
  id: string; kind: 'expert' | 'user'; date: string; score: number;
  recommend: boolean | null; role: string; size: string | null; duration: string | null; still: boolean | null;
  works: string; doesnt: string; compliance: Record<string, Status>; features: string[]; golive: string | null; cost: string | null;
  whoNot: string | null; movedTo: string | null; roleCode: string | null;
  suits: string | null; resolved: string | null;
};
export type Filters = { type?: string; size?: string; role?: string; duration?: string; still?: string };

// Changed by Prachi, 2026-11-05 (gap 6.11): sizeBucket, avg, top and the score maths moved to lib/score-math.ts so they can be tested
const PUB_COMP: Record<string, Status> = { out_of_box: 'ok', needed_help: 'partial', no: 'no', na: 'none' };
const EXP_COMP: Record<string, Status> = { worked: 'ok', custom: 'partial', failed: 'no', none: 'none' };

// Changed by Prachi, 2026-11-03: the old "on a tie, report the more cautious status" rule is replaced by chipStatus() in lib/chip-status.ts,
// which reports "mixed" when reviewers disagree (Spec section 1.3: contradictions stay visible).

// Added by Prachi, 2026-11-05 (gap 6.13): the columns read from the review tables. If the database refuses one of them (for example a column
// was renamed), the problem is printed in the server log and the page falls back to all columns instead of showing no reviews.
const PUB_COLS = 'id,created_at,rating_overall,would_recommend,reviewer_role,company_size,usage_duration,still_using,pros,cons,zatca_status,moved_to_software_id';
const EXP_COLS = 'id,profile_id,created_at,overall_rating,recommended_code,company_size_code,usage_duration_code,still_using_code,main_problem,biggest_difficulty,wishlist,compliance,moved_to_software,features_used,golive_time_code,annual_cost_code,who_should_not_buy,extra';
async function readReviews(table: string, cols: string, filter: (q: any) => any) {
  const first = await filter(db().from(table).select(cols));
  if (!first.error) return first;
  console.error(`${table}: narrow select failed (${first.error.message}); using all columns`);
  return filter(db().from(table).select('*'));
}

export async function loadProduct(slug: string, f: Filters, lang: 'en' | 'ar') {
  const { data: sw } = await db().from('rv_software').select('*').eq('slug', slug).maybeSingle();
  if (!sw) return null;
  const [{ data: cat }, { data: lkRows }, pubRes, expRes] = await Promise.all([
    db().from('rv_categories').select('id,name_en,name_ar,slug,parent_id').eq('id', sw.category_id).maybeSingle(),
    db().from('rv_lk_options').select('code,group_code,name_en,name_ar'),
    // Changed by Prachi, 2026-11-05 (gap 6.13): only the columns this page uses, not select('*')
    readReviews('rv_reviews', PUB_COLS, (q) => q.eq('software_id', sw.id).eq('verified', true).eq('status', 'approved')),
    readReviews('rv_expert_software_reviews', EXP_COLS, (q) => q.eq('software_id', sw.id).eq('is_complete', true).eq('status', 'approved')),
  ]);
  const label = new Map<string, string>(((lkRows ?? []) as Row[]).map((o) => [o.code, (lang === 'ar' ? o.name_ar : o.name_en) || o.name_en]));
  const enLabel = new Map<string, string>(((lkRows ?? []) as Row[]).map((o) => [o.code, o.name_en]));

  const profIds = [...new Set(((expRes.data ?? []) as Row[]).map((r) => r.profile_id))];
  const [{ data: profs }, { data: roleRows }, { data: allSw }] = await Promise.all([
    profIds.length ? db().from('rv_expert_profiles').select('id,status,professional_role_code,professional_role_other').in('id', profIds) : Promise.resolve({ data: [] as Row[] }),
    db().from('rv_lk_professional_roles').select('code,name_en,name_ar'),
    db().from('rv_software').select('id,name,display_name,slug'),
  ]);
  const profMap = new Map<string, Row>(((profs ?? []) as Row[]).map((p) => [p.id, p]));
  const roleLabel = new Map<string, string>(((roleRows ?? []) as Row[]).map((r) => [r.code, (lang === 'ar' ? r.name_ar : r.name_en) || r.name_en]));
  const swName = new Map<string, { name: string; slug: string }>(((allSw ?? []) as Row[]).map((s) => [s.id, { name: s.display_name || s.name, slug: s.slug }]));

  const items: Item[] = [];
  for (const r of (pubRes.data ?? []) as Row[]) {
    const comp: Record<string, Status> = {};
    if (r.zatca_status && PUB_COMP[r.zatca_status]) comp.zatca = PUB_COMP[r.zatca_status];
    items.push({
      id: 'u' + r.id, kind: 'user', date: r.created_at ?? '', score: r.rating_overall, recommend: r.would_recommend ?? null,
      role: r.reviewer_role ?? '', roleCode: r.reviewer_role ?? null, size: r.company_size ?? null, duration: r.usage_duration ?? null, still: r.still_using ?? null,
      works: r.pros ?? '', doesnt: r.cons ?? '', compliance: comp, features: [], golive: null, cost: null, whoNot: null, movedTo: r.moved_to_software_id ?? null, suits: null, resolved: null,
    });
  }
  const yes = new Set(((lkRows ?? []) as Row[]).filter((o) => o.group_code === 'recommend' && /^(yes|نعم)/i.test(o.name_en ?? '')).map((o) => o.code));
  const noStill = new Set(((lkRows ?? []) as Row[]).filter((o) => o.group_code === 'still_using' && (/^no$/i.test(o.name_en ?? '') || o.name_ar === 'لا')).map((o) => o.code));
  const yesStill = new Set(((lkRows ?? []) as Row[]).filter((o) => o.group_code === 'still_using' && (/^yes$/i.test(o.name_en ?? '') || o.name_ar === 'نعم')).map((o) => o.code));
  for (const r of (expRes.data ?? []) as Row[]) {
    const p = profMap.get(r.profile_id);
    if (!p || p.status !== 'submitted') continue; // an expert profile must itself be submitted
    const comp: Record<string, Status> = {};
    for (const [k, v] of Object.entries((r.compliance ?? {}) as Record<string, string>)) if (EXP_COMP[v]) comp[k] = EXP_COMP[v];
    const ex = (r.extra && typeof r.extra === 'object' ? r.extra : {}) as Record<string, any>;
    const pick = (list: { code: string; en: string; ar: string }[], c: string) => { const o = list.find((x) => x.code === c); return o ? (lang === 'ar' ? o.ar : o.en) : ''; };
    const suitsParts = [
      ...(Array.isArray(ex.suits_types) ? ex.suits_types : []).map((c: string) => label.get(c) || ''),
      ...(Array.isArray(ex.suits_sizes) ? ex.suits_sizes : []).map((c: string) => pick(SIZES_V2, c)),
    ].filter(Boolean);
    const suitsWhy = typeof ex.suits_why === 'string' ? ex.suits_why.trim() : '';
    const suits = suitsParts.length || suitsWhy ? [suitsParts.join(' · '), suitsWhy].filter(Boolean).join(' — ') : null;
    const resolved = ex.no_problems === true ? null : (ex.problem_resolved ? pick(RESOLVED, ex.problem_resolved) || null : null);
    const moved = typeof r.moved_to_software === 'string' && swName.has(r.moved_to_software) ? r.moved_to_software : null;
    items.push({
      id: 'e' + r.id, kind: 'expert', date: r.created_at ?? '', score: r.overall_rating,
      recommend: r.recommended_code ? yes.has(r.recommended_code) : null,
      role: (p.professional_role_code && roleLabel.get(p.professional_role_code)) || p.professional_role_other || '', roleCode: null,
      size: sizeBucket(enLabel.get(r.company_size_code)), duration: r.usage_duration_code ?? null,
      still: noStill.has(r.still_using_code) ? false : yesStill.has(r.still_using_code) ? true : null,
      // 19 Nov: the new answers live in `extra`; older reviews keep using main_problem / wishlist. The reviewer's name is never read here (anonymity).
      works: ex.accomplished || r.main_problem || '', doesnt: r.biggest_difficulty || r.wishlist || '', compliance: comp,
      features: Array.isArray(r.features_used) ? r.features_used : [], golive: r.golive_time_code ?? null, cost: r.annual_cost_code ?? null,
      whoNot: r.who_should_not_buy ?? null, movedTo: moved, suits, resolved,
    });
  }

  // ---- rating summary: user score and expert score are NEVER blended ----
  // Changed by Prachi, 2026-11-05 (gap 6.11, 6.13): the maths lives in lib/score-math.ts. Recommend share is now worked out for users and
  // experts separately, so the two kinds of reviewer are not blended.
  const userP = scoreSummary(items, 'user', MIN_REVIEWS_TO_SCORE), expertP = scoreSummary(items, 'expert', MIN_REVIEWS_TO_SCORE);
  const recommendUser = recommendSummary(items.filter((i) => i.kind === 'user'), MIN_REVIEWS_TO_SCORE);
  const recommendExpert = recommendSummary(items.filter((i) => i.kind === 'expert'), MIN_REVIEWS_TO_SCORE);

  // ---- compliance chips (ZATCA, WPS, GOSI, Qiwa): publish only at 5+ answers ----
  // Changed by Prachi, 2026-11-03: status and counts now come from chipStatus(); a chip can be "mixed" and carries how many reviewers gave each answer
  const chips = ['zatca', 'wps', 'gosi', 'qiwa'].map((k) => {
    const answers = items.map((i) => i.compliance[k]).filter((s): s is Answer => !!s && s !== 'none');
    return { key: k, ...chipStatus(answers, MIN_COMPLIANCE_ANSWERS) };
  });
  const complianceBase = items.filter((i) => Object.keys(i.compliance).length > 0).length;

  // ---- at a glance (each shows its denominator) ----
  const sizes = items.filter((i) => i.size);
  const sizeCounts = new Map<string, number>(); sizes.forEach((i) => sizeCounts.set(i.size!, (sizeCounts.get(i.size!) ?? 0) + 1));
  const sizeTop = [...sizeCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const experts = items.filter((i) => i.kind === 'expert');
  const golive = top(experts.map((i) => i.golive).filter((x): x is string => !!x));
  const cost = top(experts.map((i) => i.cost).filter((x): x is string => !!x));
  const featCounts = new Map<string, number>(); experts.forEach((i) => i.features.forEach((x) => featCounts.set(x, (featCounts.get(x) ?? 0) + 1)));
  const features = [...featCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  // ---- moved off ----
  const leavers = items.filter((i) => i.still === false);
  const movedTop = top(leavers.map((i) => i.movedTo).filter((x): x is string => !!x));

  // ---- who should not buy ----
  const whoNot = experts.filter((i) => i.whoNot).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const suitsList = experts.filter((i) => i.suits).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  // ---- reviews list with filters (a filter excludes reviews that lack that field) ----
  let list = items.slice();
  if (f.type === 'expert' || f.type === 'user') list = list.filter((i) => i.kind === f.type);
  if (f.size) list = list.filter((i) => i.size === f.size);
  if (f.role) list = list.filter((i) => i.roleCode === f.role);
  if (f.duration) list = list.filter((i) => i.duration === f.duration);
  if (f.still === 'yes') list = list.filter((i) => i.still === true);
  if (f.still === 'no') list = list.filter((i) => i.still === false);
  list.sort((a, b) => b.date.localeCompare(a.date));

  return {
    sw: { ...sw, shownName: sw.display_name || sw.name } as Row, cat: cat as Row | null, label, swName,
    total: items.length, userP, expertP, recommendUser, recommendExpert,
    chips, complianceBase, sizeTop, sizeBase: sizes.length,
    golive: golive && { ...golive, base: experts.filter((i) => i.golive).length },
    cost: cost && { ...cost, base: experts.filter((i) => i.cost).length },
    features, featuresBase: experts.filter((i) => i.features.length).length,
    leavers: leavers.length, movedTop: movedTop && { ...movedTop, name: swName.get(movedTop.value)?.name ?? '' },
    whoNot, suitsList, list,
  };
}