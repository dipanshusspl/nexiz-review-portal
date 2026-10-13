import 'server-only';
import { db } from '@/lib/supabase/admin';
import type { Lang } from '@/lib/i18n';

export type Category = { id: string; slug: string; name_en: string; name_ar: string | null; image_url: string | null; sort_order: number };
export type Software = { id: string; category_id: string; slug: string; name: string; website: string | null; description: string | null; image_url: string | null; sort_order: number };
export type Review = { id: string; software_id: string; rating: number; duration: string; comment: string | null };

export const catName = (c: Pick<Category, 'name_en' | 'name_ar'>, lang: Lang) =>
  (lang === 'ar' && c.name_ar) || c.name_en;

export async function listCategories(): Promise<Category[]> {
  const { data } = await db().from('rv_categories').select('*').order('sort_order').order('name_en');
  return (data ?? []) as Category[];
}
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data } = await db().from('rv_categories').select('*').eq('slug', slug).maybeSingle();
  return (data as Category) ?? null;
}
export async function listSoftware(categoryId?: string): Promise<Software[]> {
  let q = db().from('rv_software').select('*').order('sort_order').order('name');
  if (categoryId) q = q.eq('category_id', categoryId);
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
  const { data } = await db().from('rv_reviews').select('id,software_id,rating,duration,comment')
    .eq('user_id', userId).in('software_id', softwareIds);
  return (data ?? []) as Review[];
}
