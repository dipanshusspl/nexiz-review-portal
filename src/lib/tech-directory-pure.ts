// Added by Prachi, 2026-11-11: builds the list of all systems (tech stack) with the products that connect to each, for /tech-stack.
// Pure function (no database), so it can be tested.
import { integrationCategoryRank } from './profile-labels';

export type TechInput = { id: string; slug: string; name_en: string; name_ar: string | null; category: string; is_government: boolean };
export type LinkInput = { software_id: string; tech_stack_id: string; is_native: boolean };
export type SoftwareInput = { id: string; slug: string; name: string; image_url: string | null };

export type DirProduct = { slug: string; name: string; image_url: string | null; is_native: boolean };
export type DirSystem = { slug: string; name: string; is_government: boolean; products: DirProduct[] };
export type DirGroup = { category: string; systems: DirSystem[]; used: number };
export type Directory = { groups: DirGroup[]; total: number; used: number };

/** Systems are grouped by category in the fixed order. Inside a group: systems with products first (most products first), then the others by name.
 *  A government system is always in the Government group. Each product appears once per system, native links first. */
export function buildDirectory(tech: TechInput[], links: LinkInput[], software: SoftwareInput[], lang: 'en' | 'ar'): Directory {
  const swById = new Map(software.map((s) => [s.id, s]));
  const byTech = new Map<string, Map<string, DirProduct>>();
  for (const l of links) {
    const sw = swById.get(l.software_id);
    if (!sw) continue;
    const m = byTech.get(l.tech_stack_id) ?? new Map<string, DirProduct>();
    const prev = m.get(sw.id);
    m.set(sw.id, { slug: sw.slug, name: sw.name, image_url: sw.image_url, is_native: (prev?.is_native ?? false) || l.is_native });
    byTech.set(l.tech_stack_id, m);
  }
  const name = (t: TechInput) => (lang === 'ar' ? t.name_ar || t.name_en : t.name_en);
  const groups = new Map<string, DirSystem[]>();
  for (const t of tech) {
    const products = [...(byTech.get(t.id)?.values() ?? [])].sort((a, b) => Number(b.is_native) - Number(a.is_native) || a.name.localeCompare(b.name));
    const cat = t.is_government ? 'government' : t.category || 'other';
    groups.set(cat, [...(groups.get(cat) ?? []), { slug: t.slug, name: name(t), is_government: t.is_government, products }]);
  }
  const out: DirGroup[] = [...groups]
    .sort((a, b) => integrationCategoryRank(a[0]) - integrationCategoryRank(b[0]) || a[0].localeCompare(b[0]))
    .map(([category, systems]) => ({
      category,
      systems: [...systems].sort((a, b) => b.products.length - a.products.length || a.name.localeCompare(b.name)),
      used: systems.filter((s) => s.products.length > 0).length,
    }));
  return { groups: out, total: tech.length, used: out.reduce((n, g) => n + g.used, 0) };
}