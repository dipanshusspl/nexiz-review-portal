/**
 * Added by Prachi, 2026-11-06 (gaps 6.2 and 6.18). Works out which portal software can be linked to which main-platform product
 * by matching slugs, from a CSV exported from the main products table (columns: id, slug). Pure functions, no database.
 * Rules: an exact slug match only, never overwrite an existing link, and one main product links to one portal software at most
 * (rv_software.nexiz_product_id is unique).
 */
export type ProductRow = { id: number; slug: string };
export type SoftwareRow = { id: string; slug: string; nexiz_product_id: number | null };

/** Reads the CSV text. Needs a header with id and slug (any order, any case). Quotes around a value are allowed. */
export function parseProductsCsv(text: string): { rows: ProductRow[]; problems: string[] } {
  const problems: string[] = [];
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return { rows: [], problems: ['The file is empty.'] };
  const split = (l: string) => l.split(',').map((c) => c.trim().replace(/^"(.*)"$/, '$1').trim());
  const header = split(lines[0]).map((h) => h.toLowerCase());
  const iId = header.indexOf('id'), iSlug = header.indexOf('slug');
  if (iId < 0 || iSlug < 0) return { rows: [], problems: ['The first line must name the columns id and slug.'] };
  const rows: ProductRow[] = [];
  lines.slice(1).forEach((l, n) => {
    const c = split(l);
    const id = Number(c[iId]);
    const slug = (c[iSlug] ?? '').toLowerCase();
    if (!Number.isInteger(id) || id <= 0 || !slug) problems.push(`Line ${n + 2} was skipped: needs a whole-number id and a slug.`);
    else rows.push({ id, slug });
  });
  return { rows, problems };
}

export type LinkPlan = {
  toSet: { softwareId: string; slug: string; productId: number }[];
  alreadyLinked: number;
  conflicts: string[];          // reasons a match was NOT applied
  unmatchedSoftware: string[];  // portal slugs with no main product
  unmatchedProducts: string[];  // main slugs with no portal software
};

export function planLinks(products: ProductRow[], software: SoftwareRow[]): LinkPlan {
  const conflicts: string[] = [];
  // a slug that appears twice in the products file is ambiguous
  const bySlug = new Map<string, ProductRow[]>();
  products.forEach((p) => bySlug.set(p.slug, [...(bySlug.get(p.slug) ?? []), p]));
  const usedProductIds = new Set<number>(software.filter((s) => s.nexiz_product_id !== null).map((s) => s.nexiz_product_id as number));
  const toSet: LinkPlan['toSet'] = [];
  const unmatchedSoftware: string[] = [];
  let alreadyLinked = 0;
  const matchedSlugs = new Set<string>();

  for (const s of software) {
    const slug = s.slug.toLowerCase();
    const hits = bySlug.get(slug) ?? [];
    if (hits.length === 0) { unmatchedSoftware.push(s.slug); continue; }
    matchedSlugs.add(slug);
    if (hits.length > 1) { conflicts.push(`${s.slug}: the slug appears ${hits.length} times in the products file`); continue; }
    const pid = hits[0].id;
    if (s.nexiz_product_id === pid) { alreadyLinked++; continue; }
    if (s.nexiz_product_id !== null) { conflicts.push(`${s.slug}: already linked to ${s.nexiz_product_id}, not changed to ${pid}`); continue; }
    if (usedProductIds.has(pid)) { conflicts.push(`${s.slug}: product ${pid} is already linked to another software`); continue; }
    usedProductIds.add(pid);
    toSet.push({ softwareId: s.id, slug: s.slug, productId: pid });
  }
  const unmatchedProducts = [...bySlug.keys()].filter((slug) => !matchedSlugs.has(slug));
  return { toSet, alreadyLinked, conflicts, unmatchedSoftware, unmatchedProducts };
}