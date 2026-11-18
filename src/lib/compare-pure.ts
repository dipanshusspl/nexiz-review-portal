// Added by Claude, 2026-11-18: pure helpers for the Compare Software page (/compare). No database, no React, so they can be tested.
// Rules kept from the profile page: user score and expert score are never blended; a score under MIN reviews is null; everything shown
// is what the vendor documents (features, plans, integrations, Saudi support) or what Nexiz scored (industries).
export type Lang = 'en' | 'ar';
export const MAX_COMPARE = 5;   // client decision 2026-11-18: at least five products side by side
export const MIN_COMPARE = 2;

export type CPlan = { name: string; price: number | null; currency: string; cycle: 'monthly' | 'yearly' | 'custom'; popular: boolean };
export type CProduct = {
  slug: string; name: string; imageUrl: string | null; category: string; vendor: string | null; website: string | null;
  deployment: string | null; languages: string | null;
  userScore: number | null; userCount: number; expertScore: number | null; expertCount: number; recommendUser: number | null;
  features: { key: string; label: string }[];
  integrations: { key: string; label: string; native: boolean; gov: boolean }[];
  saudi: { key: string; label: string; status: string }[];
  industries: { key: string; label: string; fit: number }[];
  plans: CPlan[];
};
export type CatalogItem = { slug: string; name: string; imageUrl: string | null; category: string };

/** ?p=a,b,c  (also accepts a repeated ?p=a&p=b). Keeps the order, drops duplicates and blanks, stops at MAX_COMPARE. */
export function parseSlugs(p: string | string[] | undefined): string[] {
  const raw = (Array.isArray(p) ? p : [p ?? '']).flatMap((x) => x.split(','));
  return [...new Set(raw.map((x) => x.trim()).filter(Boolean))].slice(0, MAX_COMPARE);
}
export const compareHref = (slugs: string[]) => `/compare${slugs.length ? `?p=${slugs.map(encodeURIComponent).join(',')}` : ''}`;

/** Lowest price above 0, monthly first, then yearly (same rule as entryPrice on the profile page). */
export function entry(p: Pick<CProduct, 'plans'>): { amount: number; currency: string; cycle: 'monthly' | 'yearly'; name: string } | null {
  for (const cycle of ['monthly', 'yearly'] as const) {
    const priced = p.plans.filter((x) => x.cycle === cycle && x.price !== null && x.price > 0);
    if (priced.length) { const m = priced.reduce((a, b) => (b.price! < a.price! ? b : a)); return { amount: m.price!, currency: m.currency, cycle, name: m.name }; }
  }
  return null;
}
/** Yearly prices are shown per month for the comparison, so a monthly plan and a yearly plan can be put in one line. */
export const perMonth = (e: { amount: number; cycle: 'monthly' | 'yearly' }) => (e.cycle === 'yearly' ? e.amount / 12 : e.amount);

/** Index of the product with the lowest entry price. Only when everyone priced uses one currency and at least two are priced; else -1. */
export function cheapestIndex(products: CProduct[]): number {
  const es = products.map(entry);
  const priced = es.filter((e): e is NonNullable<typeof e> => !!e);
  if (priced.length < 2 || new Set(priced.map((e) => e.currency)).size !== 1) return -1;
  const min = Math.min(...priced.map(perMonth));
  const idx = es.findIndex((e) => e && perMonth(e) === min);
  return es.filter((e) => e && perMonth(e) === min).length > 1 ? -1 : idx;   // a tie highlights nobody
}

/** Index of the largest value; -1 for a tie or when fewer than two values exist. */
export function bestIndex(values: (number | null)[]): number {
  const have = values.filter((v): v is number => v !== null);
  if (have.length < 2) return -1;
  const max = Math.max(...have);
  return values.filter((v) => v === max).length === 1 ? values.indexOf(max) : -1;
}

export type Row = { key: string; label: string; cells: (string | number | boolean | null)[]; tags?: string[] };

/** All distinct items across the products (one row each); a cell is the value for that product or null when it does not have it. */
export function unionRows<T extends { key: string; label: string }>(products: CProduct[], pick: (p: CProduct) => T[], value: (t: T) => string | number | boolean): Row[] {
  const map = new Map<string, Row>();
  products.forEach((p, i) => {
    for (const t of pick(p)) {
      let r = map.get(t.key);
      if (!r) { r = { key: t.key, label: t.label, cells: products.map(() => null) }; map.set(t.key, r); }
      r.cells[i] = value(t);
    }
  });
  return [...map.values()];
}
/** A row is "the same" when every product has the same value (all have it, or all show the same status/score). */
export const isSame = (r: Row) => r.cells.every((c) => c === r.cells[0]);
/** Rows that most products share come first, then the rest; inside a group the original order stays. */
export function sortByCoverage(rows: Row[]): Row[] {
  const n = (r: Row) => r.cells.filter((c) => c !== null).length;
  return rows.map((r, i) => ({ r, i })).sort((a, b) => n(b.r) - n(a.r) || a.i - b.i).map((x) => x.r);
}

const OK = new Set(['certified', 'supported', 'vendor_states']);
export const saudiOk = (status: string | null) => !!status && OK.has(status);

const T = {
  en: {
    mostFeatures: '{n} documents the most features ({a}).', mostInt: '{n} has the most integrations ({a}).', cheapest: '{n} has the lowest entry price ({a}).',
    onlySaudi: 'Only {n} documents support for {r}.', onlyNotSaudi: '{n} is the only one without documented support for {r}.', topScore: '{n} has the highest user score ({a} / 5).',
    free: '{n} offers a free plan.', and: ' and ', comma: ', ',
  },
  ar: {
    mostFeatures: '{n} يوثّق أكبر عدد من الميزات ({a}).', mostInt: '{n} لديه أكثر التكاملات ({a}).', cheapest: '{n} لديه أقل سعر بداية ({a}).',
    onlySaudi: 'فقط {n} يوثّق دعم {r}.', onlyNotSaudi: '{n} هو الوحيد الذي لا يوثّق دعم {r}.', topScore: '{n} لديه أعلى تقييم من المستخدمين ({a} / 5).',
    free: '{n} يقدّم باقة مجانية.', and: ' و', comma: '، ',
  },
} as const;
const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
const list = (names: string[], lang: Lang) => (names.length <= 1 ? names.join('') : names.slice(0, -1).join(T[lang].comma) + T[lang].and + names[names.length - 1]);

/** Up to five plain sentences about where the products differ. Written from the data with fixed sentences (no AI), so every line can be checked. */
export function keyDifferences(products: CProduct[], lang: Lang, money: (n: number) => string): { icon: 'bolt' | 'plug' | 'tag' | 'shield' | 'star'; text: string }[] {
  const t = T[lang];
  const out: { icon: 'bolt' | 'plug' | 'tag' | 'shield' | 'star'; text: string }[] = [];
  const f = bestIndex(products.map((p) => p.features.length || null));
  if (f >= 0) out.push({ icon: 'bolt', text: fill(t.mostFeatures, { n: products[f].name, a: products[f].features.length }) });
  const g = bestIndex(products.map((p) => p.integrations.length || null));
  if (g >= 0) out.push({ icon: 'plug', text: fill(t.mostInt, { n: products[g].name, a: products[g].integrations.length }) });
  const c = cheapestIndex(products);
  if (c >= 0) { const e = entry(products[c])!; out.push({ icon: 'tag', text: fill(t.cheapest, { n: products[c].name, a: `\u2066${money(e.amount)}\u00A0${e.currency}\u2069${e.name ? ` · ${e.name}` : ''}` }) }); }
  const free = products.filter((p) => p.plans.some((x) => x.price === 0)).map((p) => p.name);
  if (free.length && free.length < products.length) out.push({ icon: 'tag', text: fill(t.free, { n: list(free, lang) }) });
  // first Saudi requirement where support differs between products
  const rows = unionRows(products, (p) => p.saudi, (s) => s.status);
  for (const r of rows) {
    const yes = products.filter((_, i) => saudiOk(r.cells[i] as string | null)).map((p) => p.name);
    if (yes.length === 1) { out.push({ icon: 'shield', text: fill(t.onlySaudi, { n: yes[0], r: r.label }) }); break; }
    if (yes.length === products.length - 1 && products.length > 2) { const no = products.find((p) => !yes.includes(p.name))!; out.push({ icon: 'shield', text: fill(t.onlyNotSaudi, { n: no.name, r: r.label }) }); break; }
  }
  const s = bestIndex(products.map((p) => p.userScore));
  if (s >= 0) out.push({ icon: 'star', text: fill(t.topScore, { n: products[s].name, a: products[s].userScore!.toFixed(1) }) });
  return out.slice(0, 5);
}