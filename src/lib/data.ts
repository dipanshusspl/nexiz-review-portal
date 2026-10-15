import 'server-only';
import { db } from '@/lib/supabase/admin';
import type { Lang } from '@/lib/i18n';

export type Category = { id: string; slug: string; name_en: string; name_ar: string | null; image_url: string | null; sort_order: number; is_live: boolean; parent_id: string | null };
export type Software = { id: string; category_id: string; slug: string; name: string; display_name: string | null; website: string | null; description: string | null; image_url: string | null; sort_order: number };
export type Review = {
  id: string; software_id: string; rating_overall: number; usage_duration: string;
  pros: string | null; cons: string | null; would_recommend: boolean | null;
  reviewer_role: string | null; company_size: string | null; zatca_status: string | null;
  still_using: boolean | null; moved_to_software_id: string | null;
  rating_ease: number | null; rating_support: number | null; rating_value: number | null;
  anonymous: boolean; verified: boolean;
};

/** A4: always show display_name (fixed casing), fall back to name. */
export const swName = (s: Pick<Software, 'name' | 'display_name'>) => s.display_name || s.name;

/** Categories where the ZATCA question is shown (P4). Matched by slug. */
export const ZATCA_CATEGORY_SLUGS = ['accounting-invoicing', 'erp', 'pos-restaurant', 'ecommerce'];

export const catName = (c: Pick<Category, 'name_en' | 'name_ar'>, lang: Lang) =>
  (lang === 'ar' && c.name_ar) || c.name_en;

/** Public grid: only live, top-level categories (the restaurant sub-categories are folded into POS & Restaurants). Admin passes {all:true}. */
export async function listCategories(opts: { all?: boolean } = {}): Promise<Category[]> {
  let q = db().from('rv_categories').select('*').order('sort_order').order('name_en');
  if (!opts.all) q = q.eq('is_live', true).is('parent_id', null);
  const { data } = await q;
  return (data ?? []) as Category[];
}
/** Category ids whose software is reviewed under this category (itself + its sub-tag children). */
export async function categoryScopeIds(categoryId: string): Promise<string[]> {
  const { data } = await db().from('rv_categories').select('id').eq('parent_id', categoryId);
  return [categoryId, ...((data ?? []) as { id: string }[]).map((r) => r.id)];
}
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data } = await db().from('rv_categories').select('*').eq('slug', slug).maybeSingle();
  return (data as Category) ?? null;
}
export async function listSoftware(categoryId?: string): Promise<Software[]> {
  let q = db().from('rv_software').select('*').order('sort_order').order('name');
  if (categoryId) q = q.in('category_id', await categoryScopeIds(categoryId));
  const { data } = await q;
  return (data ?? []) as Software[];
}
export async function getSoftwareBySlug(slug: string): Promise<Software | null> {
  const { data } = await db().from('rv_software').select('*').eq('slug', slug).maybeSingle();
  return (data as Software) ?? null;
}
/** The user's reviews, limited to the given software ids. */
export async function listUserReviews(userId: string, softwareIds: string[]): Promise<Review[]> {
  if (!softwareIds.length) return [];
  const { data } = await db().from('rv_reviews')
    .select('id,software_id,rating_overall,usage_duration,pros,cons,would_recommend,reviewer_role,company_size,zatca_status,still_using,moved_to_software_id,rating_ease,rating_support,rating_value,anonymous,verified')
    .eq('user_id', userId).eq('source', 'web').in('software_id', softwareIds);
  return (data ?? []) as Review[];
}