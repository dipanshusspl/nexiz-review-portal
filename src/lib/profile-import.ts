// Added by Prachi, 2026-11-10: reads the three CSV files exported from the main Nexiz database
// (pricing, software_features, alternative) and turns them into rows for the portal tables.
// Pure functions (no database, no files), so they can be tested.

/** Proper CSV reader: quoted fields, commas and line breaks inside quotes, doubled quotes, CRLF, BOM. */
export function parseCsv(text: string): Record<string, string>[] {
  const src = text.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') { if (src[i + 1] === '"') { field += '"'; i++; } else quoted = false; }
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((x) => x !== '')) rows.push(row); }
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

export type IdMap = Map<number, string>; // main products.id -> portal rv_software.id

export type PricingRow = { software_id: string; nexiz_row_id: number | null; plan_name_en: string; plan_name_ar: string | null; price_amount: number | null; currency: string; billing_cycle: 'monthly' | 'yearly' | 'custom'; description_ar: string | null; is_popular: boolean; sort_order: number };
export type FeatureRow = { software_id: string; nexiz_row_id: number | null; feature_en: string; feature_ar: string | null; category_ar: string | null; sort_order: number };
export type AltRow = { software_id: string; alternative_software_id: string; nexiz_row_id: number | null; reason_ar: string | null; sort_order: number };
export type Built<T> = { rows: T[]; problems: string[]; products: Map<number, number> };

const num = (s: string) => (s !== '' && Number.isFinite(Number(s)) ? Number(s) : null);
const int = (s: string) => { const n = num(s); return n !== null && Number.isInteger(n) ? n : null; };
// The export writes the word null (or NaN, N/A) for an empty cell. Treat those as empty.
const blank = (s: string) => (/^(null|nan|n\/a|none)$/i.test(s.trim()) ? '' : s);
const txt = (s: string) => (blank(s) === '' ? null : blank(s));

function build<T>(rows: Record<string, string>[], what: string, ids: IdMap, one: (r: Record<string, string>, sid: string, line: number) => T | string, key: (x: T) => string): Built<T> {
  const out: T[] = [], problems: string[] = [], seen = new Set<string>(), products = new Map<number, number>();
  rows.forEach((r, i) => {
    const line = i + 2; // line 1 is the header
    const pid = int(r.product_id ?? '');
    if (pid === null) { problems.push(`${what} line ${line}: product_id is not a number`); return; }
    const sid = ids.get(pid);
    if (!sid) { problems.push(`${what} line ${line}: product ${pid} is not linked to any portal software`); return; }
    const x = one(r, sid, line);
    if (typeof x === 'string') { problems.push(`${what} line ${line}: ${x}`); return; }
    const k = key(x);
    if (seen.has(k)) { problems.push(`${what} line ${line}: duplicate (${k}), skipped`); return; }
    seen.add(k); out.push(x); products.set(pid, (products.get(pid) ?? 0) + 1);
  });
  return { rows: out, problems, products };
}

export function buildPricing(rows: Record<string, string>[], ids: IdMap): Built<PricingRow> {
  return build<PricingRow>(rows, 'pricing', ids, (r, sid) => {
    if (!r.plan_name_en) return 'plan_name_en is empty';
    const cyc = r.billing_cycle;
    if (cyc !== 'monthly' && cyc !== 'yearly' && cyc !== 'custom') return `billing_cycle "${cyc}" is not monthly, yearly or custom`;
    const rawPrice = blank(r.price_amount ?? '');
    if (rawPrice !== '' && num(rawPrice) === null) return `price_amount "${r.price_amount}" is not a number`;
    const price = num(rawPrice);
    if (price !== null && price < 0) return 'price_amount is negative';
    const bool = (r.is_popular ?? '').toLowerCase();
    if (bool !== 'true' && bool !== 'false' && bool !== '') return `is_popular "${r.is_popular}" is not true or false`;
    return { software_id: sid, nexiz_row_id: int(r.id ?? ''), plan_name_en: r.plan_name_en, plan_name_ar: txt(r.plan_name_ar ?? ''), price_amount: price,
      currency: (r.currency || 'SAR').toUpperCase(), billing_cycle: cyc, description_ar: txt(r.description_ar ?? ''), is_popular: bool === 'true', sort_order: int(r.sort_order ?? '') ?? 0 };
  }, (x) => `${x.software_id}|${x.plan_name_en}|${x.billing_cycle}`);
}

export function buildFeatures(rows: Record<string, string>[], ids: IdMap): Built<FeatureRow> {
  return build<FeatureRow>(rows, 'features', ids, (r, sid) => {
    if (!r.feature_en) return 'feature_en is empty';
    return { software_id: sid, nexiz_row_id: int(r.id ?? ''), feature_en: r.feature_en, feature_ar: txt(r.feature_ar ?? ''), category_ar: txt(r.category ?? ''), sort_order: int(r.sort_order ?? '') ?? 0 };
  }, (x) => `${x.software_id}|${x.feature_en}`);
}

export function buildAlternatives(rows: Record<string, string>[], ids: IdMap): Built<AltRow> {
  return build<AltRow>(rows, 'alternatives', ids, (r, sid) => {
    const aid = int(r.alternative_id ?? '');
    if (aid === null) return 'alternative_id is not a number';
    const alt = ids.get(aid);
    if (!alt) return `alternative product ${aid} is not linked to any portal software`;
    if (alt === sid) return 'a product cannot be its own alternative';
    return { software_id: sid, alternative_software_id: alt, nexiz_row_id: int(r.id ?? ''), reason_ar: txt(r.reason_ar ?? ''), sort_order: int(r.sort_order ?? '') ?? 0 };
  }, (x) => `${x.software_id}|${x.alternative_software_id}`);
}

// ---- Saudi requirements and per-product support (added 2026-11-10) ----
export type ReqRow = { nexiz_row_id: number | null; slug: string; name_en: string; name_ar: string; description_ar: string | null; sort_order: number };
export type SupportRow = { software_id: string; requirement_slug: string; nexiz_row_id: number | null; support_status: string; is_official: boolean; notes_ar: string | null };

export function buildRequirements(rows: Record<string, string>[]): { rows: ReqRow[]; problems: string[]; slugById: Map<number, string> } {
  const out: ReqRow[] = [], problems: string[] = [], slugById = new Map<number, string>(), seen = new Set<string>();
  rows.forEach((r, i) => {
    const line = i + 2, id = int(r.id ?? '');
    if (id === null) { problems.push(`requirements line ${line}: id is not a number`); return; }
    if (!r.slug || !r.name_en || !r.name_ar) { problems.push(`requirements line ${line}: slug, name_en and name_ar are all needed`); return; }
    if (seen.has(r.slug)) { problems.push(`requirements line ${line}: duplicate slug ${r.slug}, skipped`); return; }
    seen.add(r.slug); slugById.set(id, r.slug);
    out.push({ nexiz_row_id: id, slug: r.slug, name_en: r.name_en, name_ar: r.name_ar, description_ar: txt(r.description_ar ?? ''), sort_order: int(r.sort_order ?? '') ?? 0 });
  });
  return { rows: out, problems, slugById };
}

export function buildSaudiSupport(rows: Record<string, string>[], ids: IdMap, slugById: Map<number, string>): Built<SupportRow> {
  return build<SupportRow>(rows, 'saudi support', ids, (r, sid) => {
    const rid = int(r.saudi_req_id ?? '');
    const slug = rid === null ? undefined : slugById.get(rid);
    if (!slug) return `saudi_req_id ${r.saudi_req_id} is not in the requirements file`;
    const status = r.support_status;
    if (!status) return 'support_status is empty';
    const bool = (r.is_official ?? '').toLowerCase();
    if (bool !== 'true' && bool !== 'false' && bool !== '') return `is_official "${r.is_official}" is not true or false`;
    return { software_id: sid, requirement_slug: slug, nexiz_row_id: int(r.id ?? ''), support_status: status, is_official: bool === 'true', notes_ar: txt(r.notes_ar ?? '') };
  }, (x) => `${x.software_id}|${x.requirement_slug}`);
}
// ---- Industries, integrations and the full Saudi support (added by Prachi, 2026-11-11) ----
const flag = (s: string | undefined) => { const b = (s ?? '').trim().toLowerCase(); return b === 'true' ? true : b === 'false' || b === '' ? false : null; };

export type IndustryRow = { nexiz_row_id: number | null; slug: string; name_en: string; name_ar: string; sort_order: number };
export type ProductIndustryRow = { software_id: string; industry_slug: string; nexiz_row_id: number | null; fit_score: number; needs_review: boolean };
export type TechRow = { nexiz_row_id: number | null; slug: string; name_en: string; name_ar: string | null; category: string; is_government: boolean };
export type IntegrationRow = { software_id: string; tech_slug: string; nexiz_row_id: number | null; integration_type: string; is_native: boolean; is_official: boolean; notes_ar: string | null };
export type SupportRowFlagged = SupportRow & { needs_review: boolean };

export function buildIndustries(rows: Record<string, string>[]): { rows: IndustryRow[]; problems: string[]; slugById: Map<number, string> } {
  const out: IndustryRow[] = [], problems: string[] = [], slugById = new Map<number, string>(), seen = new Set<string>();
  rows.forEach((r, i) => {
    const line = i + 2, id = int(r.id ?? '');
    if (id === null) { problems.push(`industries line ${line}: id is not a number`); return; }
    if (!r.slug || !r.name_en || !r.name_ar) { problems.push(`industries line ${line}: slug, name_en and name_ar are all needed`); return; }
    if (seen.has(r.slug)) { problems.push(`industries line ${line}: duplicate slug ${r.slug}, skipped`); return; }
    seen.add(r.slug); slugById.set(id, r.slug);
    out.push({ nexiz_row_id: id, slug: r.slug, name_en: r.name_en, name_ar: r.name_ar, sort_order: int(r.sort_order ?? '') ?? 0 });
  });
  return { rows: out, problems, slugById };
}

/** The export fills a product that nobody scored with a default score for its category: always 55, 60 or 65.
 *  A product counts as "default" only when ALL its rows have one of these scores. A curated product can still have one such row. */
export const DEFAULT_FIT_SCORES = [55, 60, 65];
export function defaultFitProducts(rows: Record<string, string>[]): Set<number> {
  const byProduct = new Map<number, number[]>();
  for (const r of rows) {
    const p = int(r.product_id ?? ''), s = int(r.fit_score ?? '');
    if (p === null || s === null) continue;
    byProduct.set(p, [...(byProduct.get(p) ?? []), s]);
  }
  return new Set([...byProduct].filter(([, v]) => v.every((s) => DEFAULT_FIT_SCORES.includes(s))).map(([p]) => p));
}

export function buildProductIndustries(rows: Record<string, string>[], ids: IdMap, slugById: Map<number, string>): Built<ProductIndustryRow> {
  const defaults = defaultFitProducts(rows);
  return build<ProductIndustryRow>(rows, 'product industries', ids, (r, sid) => {
    const iid = int(r.industry_id ?? '');
    const slug = iid === null ? undefined : slugById.get(iid);
    if (!slug) return `industry_id ${r.industry_id} is not in the industries file`;
    const score = int(r.fit_score ?? '');
    if (score === null || score < 0 || score > 100) return `fit_score "${r.fit_score}" is not a whole number from 0 to 100`;
    return { software_id: sid, industry_slug: slug, nexiz_row_id: int(r.id ?? ''), fit_score: score, needs_review: defaults.has(int(r.product_id ?? '') as number) };
  }, (x) => `${x.software_id}|${x.industry_slug}`);
}

/** One row per system name. The export has Salla, WooCommerce, Zid and Unifonic twice (ids with and without -int).
 *  The lowest id wins, and every id of the same name points to that row, so product_integrations can still use either id. */
export function buildTechStack(rows: Record<string, string>[]): { rows: TechRow[]; problems: string[]; slugById: Map<number, string>; merged: string[] } {
  const out: TechRow[] = [], problems: string[] = [], slugById = new Map<number, string>(), merged: string[] = [];
  const byName = new Map<string, string>(), usedSlug = new Set<string>();
  const sorted = rows.map((r, i) => ({ r, line: i + 2, id: int(r.id ?? '') })).sort((a, b) => (a.id ?? 1e12) - (b.id ?? 1e12));
  for (const { r, line, id } of sorted) {
    if (id === null) { problems.push(`tech stack line ${line}: id is not a number`); continue; }
    if (!r.slug || !r.name_en) { problems.push(`tech stack line ${line}: slug and name_en are needed`); continue; }
    const gov = flag(r.is_government);
    if (gov === null) { problems.push(`tech stack line ${line}: is_government "${r.is_government}" is not true or false`); continue; }
    const nameKey = r.name_en.trim().toLowerCase();
    const first = byName.get(nameKey);
    if (first) { slugById.set(id, first); merged.push(`${r.name_en} (id ${id}) merged into the row with slug ${first}`); continue; }
    if (usedSlug.has(r.slug)) { problems.push(`tech stack line ${line}: duplicate slug ${r.slug}, skipped`); continue; }
    usedSlug.add(r.slug); byName.set(nameKey, r.slug); slugById.set(id, r.slug);
    out.push({ nexiz_row_id: id, slug: r.slug, name_en: r.name_en, name_ar: txt(r.name_ar ?? ''), category: txt(r.category ?? '') ?? 'other', is_government: gov });
  }
  return { rows: out, problems, slugById, merged };
}

export function buildProductIntegrations(rows: Record<string, string>[], ids: IdMap, techSlugById: Map<number, string>): Built<IntegrationRow> {
  return build<IntegrationRow>(rows, 'integrations', ids, (r, sid) => {
    const tid = int(r.tech_stack_id ?? '');
    const slug = tid === null ? undefined : techSlugById.get(tid);
    if (!slug) return `tech_stack_id ${r.tech_stack_id} is not in the tech stack file`;
    const native = flag(r.is_native), official = flag(r.is_official);
    if (native === null) return `is_native "${r.is_native}" is not true or false`;
    if (official === null) return `is_official "${r.is_official}" is not true or false`;
    return { software_id: sid, tech_slug: slug, nexiz_row_id: int(r.id ?? ''), integration_type: txt(r.integration_type ?? '') ?? 'native', is_native: native, is_official: official, notes_ar: txt(r.notes_ar ?? '') };
  }, (x) => `${x.software_id}|${x.tech_slug}`);
}

/** Rows of product_requirements.csv whose note says "default by category, needs review" are not a real statement about the product. */
export const NEEDS_REVIEW_NOTE = /يحتاج مراجعة/;

/** product_requirements.csv: support_level is full or partial. full is stored as supported and partial as partial,
 *  both "as documented", never as certified. is_official is false because the file has no such column. */
export function buildRequirementSupport(rows: Record<string, string>[], ids: IdMap, slugById: Map<number, string>): Built<SupportRowFlagged> {
  return build<SupportRowFlagged>(rows, 'product requirements', ids, (r, sid) => {
    const rid = int(r.requirement_id ?? '');
    const slug = rid === null ? undefined : slugById.get(rid);
    if (!slug) return `requirement_id ${r.requirement_id} is not in the requirements file`;
    const level = (r.support_level ?? '').toLowerCase();
    if (level !== 'full' && level !== 'partial') return `support_level "${r.support_level}" is not full or partial`;
    const note = txt(r.notes_ar ?? '');
    return { software_id: sid, requirement_slug: slug, nexiz_row_id: int(r.id ?? ''), support_status: level === 'full' ? 'supported' : 'partial', is_official: false, notes_ar: note, needs_review: !!note && NEEDS_REVIEW_NOTE.test(note) };
  }, (x) => `${x.software_id}|${x.requirement_slug}`);
}

/** saudi_support.csv (written by hand, with a status like certified and a source) wins over product_requirements.csv for the same product and requirement. */
export function mergeSupport(base: SupportRowFlagged[], curated: SupportRow[]): { rows: SupportRowFlagged[]; overridden: number } {
  const key = (x: { software_id: string; requirement_slug: string }) => `${x.software_id}|${x.requirement_slug}`;
  const map = new Map(base.map((x) => [key(x), x]));
  let overridden = 0;
  for (const c of curated) { if (map.has(key(c))) overridden++; map.set(key(c), { ...c, needs_review: false }); }
  return { rows: [...map.values()], overridden };
}