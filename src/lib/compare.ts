// Added by Claude, 2026-11-18: loads the products for the Compare Software page (/compare).
// It re-uses what the profile page already reads (loadProfileExtras, loadProduct), so a number here is always the same number as on /profilepage/<slug>.
// A slug that does not exist is skipped and reported in `missing`; one failing product never breaks the page.
import 'server-only';
import { db } from '@/lib/supabase/admin';
import { loadProduct } from '@/lib/product';
import { loadProfileExtras } from '@/lib/profile-extras';
import type { CatalogItem, CProduct, Lang } from '@/lib/compare-pure';

/* eslint-disable @typescript-eslint/no-explicit-any */
const AR_WORDS: Record<string, string> = { arabic: 'العربية', english: 'الإنجليزية', cloud: 'سحابي', 'on-premise': 'محلي', 'on premise': 'محلي', hybrid: 'هجين' };
const joinList = (v: unknown, lang: Lang): string | null => {
  const arr = Array.isArray(v) ? v : typeof v === 'string' && v.trim() ? v.split(/[,،;]/) : [];
  const items = arr.map((i) => String(i).trim()).filter(Boolean).map((i) => (lang === 'ar' ? AR_WORDS[i.toLowerCase()] ?? i : i));
  return items.length ? items.join(lang === 'ar' ? '، ' : ', ') : null;
};

async function loadOne(slug: string, lang: Lang): Promise<CProduct | null> {
  const { data: sw } = await db().from('rv_software').select('*').eq('slug', slug).maybeSingle();
  if (!sw) return null;
  const { data: cat } = sw.category_id ? await db().from('rv_categories').select('name_en,name_ar').eq('id', sw.category_id).maybeSingle() : { data: null };
  const [x, prod] = await Promise.all([loadProfileExtras(sw.id as string, lang), loadProduct(slug, {}, lang).catch(() => null)]);
  const ar = lang === 'ar';
  return {
    slug, name: (sw.display_name || sw.name) as string, imageUrl: (sw.image_url as string | null) ?? null,
    category: cat ? (ar ? cat.name_ar || cat.name_en : cat.name_en) : '',
    vendor: ((sw.vendor_name as string | null) ?? '').trim() || null, website: ((sw.website as string | null) ?? '').trim() || null,
    deployment: joinList(sw.deployment, lang), languages: joinList(sw.languages, lang),
    userScore: prod?.userP.score ?? null, userCount: prod?.userP.count ?? 0, expertScore: prod?.expertP.score ?? null, expertCount: prod?.expertP.count ?? 0,
    recommendUser: prod?.recommendUser?.pct ?? null,
    // keys are the English names in lower case, so the same feature or integration lines up across products
    features: x.features.map((f) => ({ key: (f.feature_en || f.feature_ar || '').trim().toLowerCase(), label: (ar ? f.feature_ar || f.feature_en : f.feature_en || f.feature_ar) || '' })).filter((f) => f.key),
    integrations: x.integrations.map((i) => ({ key: i.slug, label: i.name, native: i.is_native, gov: i.is_government })),
    saudi: x.saudi.map((r) => ({ key: r.slug, label: ar ? r.name_ar : r.name_en, status: r.status })),
    industries: x.industries.map((i) => ({ key: i.slug, label: ar ? i.name_ar : i.name_en, fit: i.fit })),
    plans: x.plans.map((p) => ({ name: (ar ? p.plan_name_ar || p.plan_name_en : p.plan_name_en) || '', price: p.price_amount, currency: p.currency, cycle: p.billing_cycle, popular: p.is_popular })),
  };
}

export async function loadCompare(slugs: string[], lang: Lang): Promise<{ products: CProduct[]; missing: string[] }> {
  const res = await Promise.all(slugs.map((s) => loadOne(s, lang).catch((e) => { console.error('compare: product failed', s, e instanceof Error ? e.message : e); return null; })));
  return { products: res.filter((p): p is CProduct => !!p), missing: slugs.filter((_, i) => !res[i]) };
}

/** Every product the picker can offer (name, picture, category). Small list, so the picker filters it in the browser. */
export async function loadCatalog(lang: Lang): Promise<CatalogItem[]> {
  const [{ data: sws }, { data: cats }] = await Promise.all([
    db().from('rv_software').select('slug,name,display_name,image_url,category_id').order('name'),
    db().from('rv_categories').select('id,name_en,name_ar'),
  ]);
  const cn = new Map(((cats ?? []) as any[]).map((c) => [c.id, lang === 'ar' ? c.name_ar || c.name_en : c.name_en]));
  return ((sws ?? []) as any[]).map((s) => ({ slug: s.slug, name: s.display_name || s.name, imageUrl: s.image_url ?? null, category: cn.get(s.category_id) ?? '' }));
}