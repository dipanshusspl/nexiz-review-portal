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