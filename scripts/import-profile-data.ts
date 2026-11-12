// Added by Prachi, 2026-11-10: copies pricing, vendor-documented features and alternatives from three CSV files
// (exported from the main Nexiz database) into the portal tables made by sql/007_product_profile.sql.
// Changed by Prachi, 2026-11-11: also copies industries, integrations (tech stack) and the full Saudi support (sql/009).
//
// Usage:   npm run import:profile                 (dry run: shows what would be written, writes nothing)
//          npm run import:profile -- --apply      (writes)
//          npm run import:profile -- --dir some\folder     (where the CSV files are; default: the project folder)
// Files:   pricing.csv, software_features.csv, alternative.csv
//          optional, needs sql/008: requirements_rows.csv (or requirements_rows_2.csv), saudi_support.csv, product_requirements.csv
//          optional, needs sql/009: industries_rows.csv, product_industries.csv, tech_stack.csv, product_integrations.csv
// Needs:   SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local, and the software already linked (npm run link:products).
// Safe to run again: rows are matched on their natural key and updated, never duplicated. Rows that are no longer in the CSV are NOT deleted.
// Rows the export only filled in by default (needs_review) are written with needs_review = true. The profile page does not show them.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  buildAlternatives, buildFeatures, buildIndustries, buildPricing, buildProductIndustries, buildProductIntegrations, buildRequirements,
  buildRequirementSupport, buildSaudiSupport, buildTechStack, mergeSupport, parseCsv, type Built, type IdMap, type SupportRowFlagged,
} from '../src/lib/profile-import';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const di = args.indexOf('--dir');
const dir = di >= 0 ? args[di + 1] : '.';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) { console.error('SUPABASE_URL or SUPABASE_SECRET_KEY is missing in .env.local'); process.exit(1); }
const sb = createClient(url, key, { auth: { persistSession: false } });

/** Reads the first of the given file names that exists. With optional = true a missing file is not an error. */
function read(names: string | string[], optional = false) {
  const list = Array.isArray(names) ? names : [names];
  for (const n of list) { const p = join(dir, n); if (existsSync(p)) return parseCsv(readFileSync(p, 'utf8')); }
  if (!optional) console.error(`Missing file: ${join(dir, list[0])}`);
  return null;
}

function report(label: string, b: { problems: string[] }, line: string) {
  console.log(`\n${label}: ${line}`);
  for (const p of b.problems) console.log(`  PROBLEM  ${p}`);
  return b.problems.length;
}

async function upsertRows(table: string, rows: object[], conflict: string, hint = ''): Promise<number> {
  for (let i = 0; i < rows.length; i += 100) {
    const res = await sb.from(table).upsert(rows.slice(i, i + 100), { onConflict: conflict });
    if (res.error) { console.error(`  FAILED ${table}${hint}: ${res.error.message}`); return rows.length - i; }
  }
  return 0;
}

async function idBySlug(table: string): Promise<Map<string, string>> {
  const r = await sb.from(table).select('id,slug');
  return new Map((r.data ?? []).map((x: any) => [x.slug as string, x.id as string]));
}

async function main() {
  const sw = await sb.from('rv_software').select('id,nexiz_product_id').not('nexiz_product_id', 'is', null);
  if (sw.error) { console.error('Could not read rv_software:', sw.error.message); process.exit(1); }
  const ids: IdMap = new Map((sw.data ?? []).map((r: any) => [Number(r.nexiz_product_id), r.id as string]));
  console.log(`Linked software in the portal: ${ids.size}`);
  if (!ids.size) { console.error('No software is linked to a Nexiz product yet. Run npm run link:products first.'); process.exit(1); }

  const pr = read('pricing.csv'), fr = read('software_features.csv'), ar = read('alternative.csv');
  if (!pr || !fr || !ar) process.exit(1);

  const jobs: { label: string; table: string; conflict: string; built: Built<any> }[] = [
    { label: 'Pricing plans', table: 'rv_product_pricing', conflict: 'software_id,plan_name_en,billing_cycle', built: buildPricing(pr, ids) },
    { label: 'Features', table: 'rv_product_features', conflict: 'software_id,feature_en', built: buildFeatures(fr, ids) },
    { label: 'Alternatives', table: 'rv_product_alternatives', conflict: 'software_id,alternative_software_id', built: buildAlternatives(ar, ids) },
  ];

  let problems = 0;
  for (const j of jobs) problems += report(j.label, j.built, `${j.built.rows.length} rows for ${j.built.products.size} products`);

  // ---- Saudi requirements and support (optional files) ----
  const rqr = read(['requirements_rows.csv', 'requirements_rows_2.csv'], true);
  const spr = read('saudi_support.csv', true), prq = read('product_requirements.csv', true);
  const reqs = rqr ? buildRequirements(rqr) : null;
  let support: { rows: SupportRowFlagged[]; products: number; reviewRows: number } | null = null;
  if (reqs && (spr || prq)) {
    let rows: SupportRowFlagged[] = [];
    if (prq) {
      const b = buildRequirementSupport(prq, ids, reqs.slugById);
      problems += report('Saudi support (product_requirements.csv)', b, `${b.rows.length} rows for ${b.products.size} products`);
      rows = b.rows;
    }
    if (spr) {
      const b = buildSaudiSupport(spr, ids, reqs.slugById);
      problems += report('Saudi support (saudi_support.csv)', b, `${b.rows.length} rows for ${b.products.size} products`);
      const m = mergeSupport(rows, b.rows);
      rows = m.rows;
      if (prq) console.log(`  ${m.overridden} row(s) are in both files. The row from saudi_support.csv is used.`);
    }
    support = { rows, products: new Set(rows.map((r) => r.software_id)).size, reviewRows: rows.filter((r) => r.needs_review).length };
  }
  if (reqs) problems += report('Saudi requirements', reqs, `${reqs.rows.length} rows`);
  if (support) console.log(`Saudi support in total: ${support.rows.length} rows for ${support.products} products. ${support.reviewRows} are marked needs_review and will not be shown.`);
  if (!rqr || !(spr || prq)) console.log('\nSaudi files (requirements_rows.csv and saudi_support.csv or product_requirements.csv) not found, skipped.');

  // ---- Industries (optional files, sql/009) ----
  const indr = read('industries_rows.csv', true), pir = read('product_industries.csv', true);
  const inds = indr ? buildIndustries(indr) : null;
  const pind = pir && inds ? buildProductIndustries(pir, ids, inds.slugById) : null;
  if (inds) problems += report('Industries', inds, `${inds.rows.length} rows`);
  if (pind) {
    problems += report('Product industries', pind, `${pind.rows.length} rows for ${pind.products.size} products`);
    console.log(`  ${pind.rows.filter((r) => r.needs_review).length} rows are default scores (needs_review) and will not be shown.`);
  }
  if (!indr || !pir) console.log('\nIndustry files (industries_rows.csv, product_industries.csv) not found, skipped.');

  // ---- Integrations (optional files, sql/009) ----
  const tsr = read('tech_stack.csv', true), pnr = read('product_integrations.csv', true);
  const tech = tsr ? buildTechStack(tsr) : null;
  const pint = pnr && tech ? buildProductIntegrations(pnr, ids, tech.slugById) : null;
  if (tech) { problems += report('Tech stack', tech, `${tech.rows.length} systems`); for (const m of tech.merged) console.log(`  MERGED   ${m}`); }
  if (pint) problems += report('Product integrations', pint, `${pint.rows.length} rows for ${pint.products.size} products`);
  if (!tsr || !pnr) console.log('\nIntegration files (tech_stack.csv, product_integrations.csv) not found, skipped.');

  if (problems) console.log(`\n${problems} row(s) have a problem and will be skipped. Everything else is fine.`);

  if (!apply) { console.log('\nDry run only. Nothing was written. Add --apply to write.'); return; }

  const at = new Date().toISOString();
  let failed = 0;
  for (const j of jobs) failed += await upsertRows(j.table, j.built.rows.map((r) => ({ ...r, imported_at: at })), j.conflict);

  const tables: string[] = jobs.map((j) => j.table);

  if (reqs && support) {
    const f = await upsertRows('rv_saudi_requirements', reqs.rows.map((r) => ({ ...r, imported_at: at })), 'slug', ' (was sql/008 applied?)');
    failed += f;
    if (!f) {
      const map = await idBySlug('rv_saudi_requirements');
      const rows = support.rows.map(({ requirement_slug, ...r }) => ({ ...r, requirement_id: map.get(requirement_slug), imported_at: at }));
      failed += await upsertRows('rv_product_saudi_support', rows, 'software_id,requirement_id', ' (was sql/009 applied? it adds needs_review)');
    }
    tables.push('rv_saudi_requirements', 'rv_product_saudi_support');
  }

  if (inds && pind) {
    const f = await upsertRows('rv_industries', inds.rows.map((r) => ({ ...r, imported_at: at })), 'slug', ' (was sql/009 applied?)');
    failed += f;
    if (!f) {
      const map = await idBySlug('rv_industries');
      const rows = pind.rows.map(({ industry_slug, ...r }) => ({ ...r, industry_id: map.get(industry_slug), imported_at: at }));
      failed += await upsertRows('rv_product_industries', rows, 'software_id,industry_id');
    }
    tables.push('rv_industries', 'rv_product_industries');
  }

  if (tech && pint) {
    const f = await upsertRows('rv_tech_stack', tech.rows.map((r) => ({ ...r, imported_at: at })), 'slug', ' (was sql/009 applied?)');
    failed += f;
    if (!f) {
      const map = await idBySlug('rv_tech_stack');
      const rows = pint.rows.map(({ tech_slug, ...r }) => ({ ...r, tech_stack_id: map.get(tech_slug), imported_at: at }));
      failed += await upsertRows('rv_product_integrations', rows, 'software_id,tech_stack_id');
    }
    tables.push('rv_tech_stack', 'rv_product_integrations');
  }

  const counts: string[] = [];
  for (const t of tables) {
    const c = await sb.from(t).select('id', { count: 'exact', head: true });
    counts.push(`${t}: ${c.count ?? '?'}`);
  }
  console.log(`\nDone. Failed rows: ${failed}.`);
  console.log(`Rows now in the portal: ${counts.join(' · ')}`);
}

main().catch((e) => { console.error('Failed:', e instanceof Error ? e.message : e); process.exit(1); });