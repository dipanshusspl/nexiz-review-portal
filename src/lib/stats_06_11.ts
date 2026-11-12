import 'server-only';
import { db } from '@/lib/supabase/admin';

/** Published = verified + approved (public) or complete + approved (expert). Only these are ever counted or shown. */
export async function publishedCountsBySoftware(): Promise<Map<string, number>> {
  const [pub, exp] = await Promise.all([
    db().from('rv_reviews').select('software_id').eq('verified', true).eq('status', 'approved'),
    db().from('rv_expert_software_reviews').select('software_id').eq('is_complete', true).eq('status', 'approved').not('software_id', 'is', null),
  ]);
  const m = new Map<string, number>();
  for (const r of [...(pub.data ?? []), ...(exp.data ?? [])] as { software_id: string }[]) m.set(r.software_id, (m.get(r.software_id) ?? 0) + 1);
  return m;
}

export type CategoryStat = { products: number; reviews: number };

/** Products + published reviews per TOP-LEVEL category; sub-tag categories (restaurants) are folded into their parent. */
export async function categoryStats(): Promise<Map<string, CategoryStat>> {
  const [{ data: cats }, { data: sw }, counts] = await Promise.all([
    db().from('rv_categories').select('id,parent_id'),
    db().from('rv_software').select('id,category_id'),
    publishedCountsBySoftware(),
  ]);
  const top = new Map<string, string>((cats ?? []).map((c: { id: string; parent_id: string | null }) => [c.id, c.parent_id ?? c.id]));
  const out = new Map<string, CategoryStat>();
  for (const s of (sw ?? []) as { id: string; category_id: string }[]) {
    const k = top.get(s.category_id) ?? s.category_id;
    const cur = out.get(k) ?? { products: 0, reviews: 0 };
    cur.products += 1; cur.reviews += counts.get(s.id) ?? 0;
    out.set(k, cur);
  }
  return out;
}

/** Figures for the trust bar. Never rounded, never includes unverified or unapproved reviews. */
export async function trustFigures(): Promise<{ products: number; verified: number }> {
  const [{ count }, counts] = await Promise.all([
    db().from('rv_software').select('id', { count: 'exact', head: true }),
    publishedCountsBySoftware(),
  ]);
  let verified = 0; counts.forEach((n) => { verified += n; });
  return { products: count ?? 0, verified };
}

export const GO_LIVE_MIN_PRODUCTS = 5;
export const GO_LIVE_MIN_REVIEWS = 3;
