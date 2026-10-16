import 'server-only';
import { db } from '@/lib/supabase/admin';

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
};
export type Filters = { type?: string; size?: string; role?: string; duration?: string; still?: string };

/** company-size buckets used by the public form; expert option labels ("51-200 employees") are mapped to the same buckets */
export function sizeBucket(label: string | null | undefined): string | null {
  if (!label) return null;
  if (['1-10', '11-50', '51-200', '201-500', '500+'].includes(label)) return label;
  const nums = (label.match(/\d[\d,]*/g) ?? []).map((n) => Number(n.replace(/,/g, '')));
  if (!nums.length) return null;
  const hi = nums[nums.length - 1];
  if (label.includes('+') && hi >= 500) return '500+';
  return hi <= 10 ? '1-10' : hi <= 50 ? '11-50' : hi <= 200 ? '51-200' : hi <= 500 ? '201-500' : '500+';
}

const PUB_COMP: Record<string, Status> = { out_of_box: 'ok', needed_help: 'partial', no: 'no', na: 'none' };
const EXP_COMP: Record<string, Status> = { worked: 'ok', custom: 'partial', failed: 'no', none: 'none' };

const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);
function top<T extends string>(xs: T[]): { value: T; n: number } | null {
  const m = new Map<T, number>(); xs.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1));
  let best: { value: T; n: number } | null = null;
  m.forEach((n, value) => { if (!best || n > best.n) best = { value, n }; });
  return best;
}
const worse: Status[] = ['no', 'partial', 'ok']; // on a tie, report the more cautious status

export async function loadProduct(slug: string, f: Filters, lang: 'en' | 'ar') {
  const { data: sw } = await db().from('rv_software').select('*').eq('slug', slug).maybeSingle();
  if (!sw) return null;
  const [{ data: cat }, { data: lkRows }, pubRes, expRes] = await Promise.all([
    db().from('rv_categories').select('id,name_en,name_ar,slug,parent_id').eq('id', sw.category_id).maybeSingle(),
    db().from('rv_lk_options').select('code,group_code,name_en,name_ar'),
    db().from('rv_reviews').select('*').eq('software_id', sw.id).eq('verified', true).eq('status', 'approved'),
    db().from('rv_expert_software_reviews').select('*').eq('software_id', sw.id).eq('is_complete', true).eq('status', 'approved'),
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
      id: 'u' + r.id, kind: 'user', date: r.created_at ?? r.updated_at ?? '', score: r.rating_overall, recommend: r.would_recommend ?? null,
      role: r.reviewer_role ?? '', roleCode: r.reviewer_role ?? null, size: r.company_size ?? null, duration: r.usage_duration ?? null, still: r.still_using ?? null,
      works: r.pros ?? '', doesnt: r.cons ?? '', compliance: comp, features: [], golive: null, cost: null, whoNot: null, movedTo: r.moved_to_software_id ?? null,
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
    const moved = typeof r.moved_to_software === 'string' && swName.has(r.moved_to_software) ? r.moved_to_software : null;
    items.push({
      id: 'e' + r.id, kind: 'expert', date: r.created_at ?? r.updated_at ?? '', score: r.overall_rating,
      recommend: r.recommended_code ? yes.has(r.recommended_code) : null,
      role: (p.professional_role_code && roleLabel.get(p.professional_role_code)) || p.professional_role_other || '', roleCode: null,
      size: sizeBucket(enLabel.get(r.company_size_code)), duration: r.usage_duration_code ?? null,
      still: noStill.has(r.still_using_code) ? false : yesStill.has(r.still_using_code) ? true : null,
      works: r.main_problem ?? '', doesnt: r.biggest_difficulty || r.wishlist || '', compliance: comp,
      features: Array.isArray(r.features_used) ? r.features_used : [], golive: r.golive_time_code ?? null, cost: r.annual_cost_code ?? null,
      whoNot: r.who_should_not_buy ?? null, movedTo: moved,
    });
  }

  // ---- rating summary: user score and expert score are NEVER blended ----
  const part = (kind: 'user' | 'expert') => {
    const xs = items.filter((i) => i.kind === kind);
    const enough = xs.length >= MIN_REVIEWS_TO_SCORE;
    return { count: xs.length, score: enough ? avg(xs.map((i) => i.score)) : null, enough };
  };
  const userP = part('user'), expertP = part('expert');
  const rec = items.filter((i) => i.recommend !== null);
  const recommendPct = rec.length >= MIN_REVIEWS_TO_SCORE ? Math.round((rec.filter((i) => i.recommend).length / rec.length) * 100) : null;

  // ---- compliance chips (ZATCA, WPS, GOSI, Qiwa): publish only at 5+ answers ----
  const chips = ['zatca', 'wps', 'gosi', 'qiwa'].map((k) => {
    const answers = items.map((i) => i.compliance[k]).filter((s): s is Status => !!s && s !== 'none');
    let status: Status = 'none';
    if (answers.length >= MIN_COMPLIANCE_ANSWERS) {
      const counts = new Map<Status, number>(); answers.forEach((a) => counts.set(a, (counts.get(a) ?? 0) + 1));
      const max = Math.max(...counts.values());
      status = worse.find((s) => counts.get(s) === max) ?? 'none';
    }
    return { key: k, status, answers: answers.length };
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
    total: items.length, userP, expertP, recommendPct, recommendBase: rec.length,
    chips, complianceBase, sizeTop, sizeBase: sizes.length,
    golive: golive && { ...golive, base: experts.filter((i) => i.golive).length },
    cost: cost && { ...cost, base: experts.filter((i) => i.cost).length },
    features, featuresBase: experts.filter((i) => i.features.length).length,
    leavers: leavers.length, movedTop: movedTop && { ...movedTop, name: swName.get(movedTop.value)?.name ?? '' },
    whoNot, list,
  };
}
