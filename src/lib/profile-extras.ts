// Added by Prachi, 2026-11-10: reads the copied pricing, vendor-documented features and alternatives for one product.
// Changed by Prachi, 2026-11-11: also reads industries and integrations, and leaves out rows marked needs_review (sql/009).
// Never throws: if the tables do not exist yet (sql/007 not applied) or a read fails, the page simply shows no such sections.
import 'server-only';
import { db } from '@/lib/supabase/admin';

export type Plan = { plan_name_en: string; plan_name_ar: string | null; price_amount: number | null; currency: string; billing_cycle: 'monthly' | 'yearly' | 'custom'; description_ar: string | null; is_popular: boolean; imported_at: string };
export type Feature = { feature_en: string; feature_ar: string | null; category_ar: string | null };
export type SaudiItem = { slug: string; name_en: string; name_ar: string; status: string; official: boolean; notes_ar: string | null };
export type Alternative = { slug: string; name: string; image_url: string | null; category: string; reason_ar: string | null };
export type IndustryItem = { slug: string; name_en: string; name_ar: string; fit: number; sort: number };
export type IntegrationItem = { slug: string; name: string; name_en: string; name_ar: string | null; category: string; is_government: boolean; is_native: boolean; is_official: boolean; notes_ar: string | null };
export type ProfileExtras = { plans: Plan[]; features: Feature[]; alternatives: Alternative[]; saudi: SaudiItem[]; industries: IndustryItem[]; integrations: IntegrationItem[]; updatedAt: string | null };

export async function loadProfileExtras(softwareId: string, lang: 'en' | 'ar'): Promise<ProfileExtras> {
  const empty: ProfileExtras = { plans: [], features: [], alternatives: [], saudi: [], industries: [], integrations: [], updatedAt: null };
  try {
    const [p, f, a] = await Promise.all([
      db().from('rv_product_pricing').select('plan_name_en,plan_name_ar,price_amount,currency,billing_cycle,description_ar,is_popular,imported_at').eq('software_id', softwareId).order('sort_order'),
      db().from('rv_product_features').select('feature_en,feature_ar,category_ar').eq('software_id', softwareId).order('sort_order'),
      db().from('rv_product_alternatives').select('alternative_software_id,reason_ar').eq('software_id', softwareId).order('sort_order'),
    ]);
    for (const r of [p, f, a]) if (r.error) console.error('profile extras:', r.error.message);
    const plans = ((p.data ?? []) as any[]).map((x) => ({ ...x, price_amount: x.price_amount === null ? null : Number(x.price_amount) })) as Plan[];
    const features = (f.data ?? []) as Feature[];
    const altRows = (a.data ?? []) as { alternative_software_id: string; reason_ar: string | null }[];

    let alternatives: Alternative[] = [];
    if (altRows.length) {
      const { data: sws } = await db().from('rv_software').select('id,slug,name,display_name,image_url,category_id').in('id', altRows.map((x) => x.alternative_software_id));
      const catIds = [...new Set(((sws ?? []) as any[]).map((s) => s.category_id).filter(Boolean))];
      const { data: cats } = catIds.length ? await db().from('rv_categories').select('id,name_en,name_ar').in('id', catIds) : { data: [] as any[] };
      const catName = new Map(((cats ?? []) as any[]).map((c) => [c.id, lang === 'ar' ? c.name_ar || c.name_en : c.name_en]));
      const byId = new Map(((sws ?? []) as any[]).map((s) => [s.id, s]));
      alternatives = altRows.flatMap((r) => {
        const s = byId.get(r.alternative_software_id);
        return s ? [{ slug: s.slug, name: s.display_name || s.name, image_url: s.image_url ?? null, category: catName.get(s.category_id) ?? '', reason_ar: r.reason_ar }] : [];
      });
    }
    // Saudi support (sql/008). If that table is not there yet, the section is just left out.
    let saudi: SaudiItem[] = [];
    // Rows marked needs_review (only filled in by default, sql/009) are never shown. If the column is not there yet, every row counts as reviewed.
    let sup: { data: any[] | null; error: { message: string } | null } = await db().from('rv_product_saudi_support').select('requirement_id,support_status,is_official,notes_ar,needs_review').eq('software_id', softwareId);
    if (sup.error) sup = await db().from('rv_product_saudi_support').select('requirement_id,support_status,is_official,notes_ar').eq('software_id', softwareId);
    const supRows = sup.error ? [] : (sup.data ?? []).filter((x: any) => !x.needs_review);
    if (supRows.length) {
      const { data: rq } = await db().from('rv_saudi_requirements').select('id,slug,name_en,name_ar,sort_order').in('id', supRows.map((x: any) => x.requirement_id));
      const rmap = new Map(((rq ?? []) as any[]).map((r) => [r.id, r]));
      saudi = (supRows as any[]).flatMap((x) => { const r = rmap.get(x.requirement_id); return r ? [{ slug: r.slug, name_en: r.name_en, name_ar: r.name_ar, status: x.support_status, official: !!x.is_official, notes_ar: x.notes_ar ?? null, _o: r.sort_order }] : []; })
        .sort((a: any, b: any) => a._o - b._o).map(({ _o, ...r }: any) => r);
    }
    // Industries (sql/009): the score written by Nexiz. Default scores (needs_review) are left out.
    let industries: IndustryItem[] = [];
    const ind = await db().from('rv_product_industries').select('industry_id,fit_score').eq('software_id', softwareId).eq('needs_review', false);
    if (!ind.error && ind.data?.length) {
      const { data: iq } = await db().from('rv_industries').select('id,slug,name_en,name_ar,sort_order').in('id', ind.data.map((x: any) => x.industry_id));
      const imap = new Map(((iq ?? []) as any[]).map((r) => [r.id, r]));
      industries = (ind.data as any[]).flatMap((x) => { const r = imap.get(x.industry_id); return r ? [{ slug: r.slug, name_en: r.name_en, name_ar: r.name_ar, fit: Number(x.fit_score), sort: r.sort_order }] : []; });
    }
    // Integrations (sql/009)
    let integrations: IntegrationItem[] = [];
    const itg = await db().from('rv_product_integrations').select('tech_stack_id,is_native,is_official,notes_ar').eq('software_id', softwareId);
    if (!itg.error && itg.data?.length) {
      const { data: tq } = await db().from('rv_tech_stack').select('id,slug,name_en,name_ar,category,is_government').in('id', itg.data.map((x: any) => x.tech_stack_id));
      const tmap = new Map(((tq ?? []) as any[]).map((r) => [r.id, r]));
      integrations = (itg.data as any[]).flatMap((x) => {
        const r = tmap.get(x.tech_stack_id);
        return r ? [{ slug: r.slug, name: lang === 'ar' ? r.name_ar || r.name_en : r.name_en, name_en: r.name_en, name_ar: r.name_ar ?? null, category: r.is_government ? 'government' : r.category, is_government: !!r.is_government, is_native: !!x.is_native, is_official: !!x.is_official, notes_ar: x.notes_ar ?? null }] : [];
      });
    }
    const stamps = plans.map((x) => x.imported_at).filter(Boolean).sort();
    return { plans, features, alternatives, saudi, industries, integrations, updatedAt: stamps.length ? stamps[stamps.length - 1] : null };
  } catch (e) {
    console.error('profile extras failed:', e instanceof Error ? e.message : e);
    return empty;
  }
}