// Added by Prachi, 2026-11-11: tests for industries, integrations and the full Saudi support (CH-025).
// Run: npx tsx --test scripts/profile-industries-integrations.test.ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildIndustries, buildProductIndustries, buildProductIntegrations, buildRequirementSupport, buildTechStack, defaultFitProducts, mergeSupport, parseCsv,
} from '../src/lib/profile-import';
import { groupIntegrations, integrationCategoryLabel, sortIndustries, supportLabel } from '../src/lib/profile-labels';

const ids = new Map([[1, 'sw1'], [2, 'sw2'], [3, 'sw3']]);

test('industries: reads rows, skips a duplicate slug and an empty name', () => {
  const b = buildIndustries(parseCsv('id,slug,name_ar,name_en,icon,sort_order\n1,retail,التجزئة,Retail,,2\n2,retail,x,Retail 2,,3\n3,hotels,الفنادق,,,9'));
  assert.equal(b.rows.length, 1);
  assert.equal(b.problems.length, 2);
  assert.equal(b.slugById.get(1), 'retail');
});

test('product industries: a product with only 55/60/65 scores is default, a curated product is not', () => {
  const csv = parseCsv('id,product_id,industry_id,fit_score\n1,1,1,60\n2,1,2,55\n3,2,1,90\n4,2,2,65\n5,3,1,101');
  assert.deepEqual([...defaultFitProducts(csv)].sort(), [1]); // product 3 has 101, which is not a default score
  const inds = new Map([[1, 'retail'], [2, 'hotels']]);
  const b = buildProductIndustries(csv, ids, inds);
  assert.equal(b.rows.length, 4);
  assert.equal(b.problems.length, 1); // 101 is out of range
  const byKey = new Map(b.rows.map((r) => [`${r.software_id}|${r.industry_slug}`, r]));
  assert.equal(byKey.get('sw1|retail')!.needs_review, true);
  assert.equal(byKey.get('sw2|retail')!.needs_review, false);
  assert.equal(byKey.get('sw2|hotels')!.needs_review, false); // 65 but the product also has a 90
});

test('product industries: unknown industry and unknown product are reported', () => {
  const b = buildProductIndustries(parseCsv('id,product_id,industry_id,fit_score\n1,1,9,70\n2,99,1,70'), ids, new Map([[1, 'retail']]));
  assert.equal(b.rows.length, 0);
  assert.equal(b.problems.length, 2);
});

test('tech stack: the same name twice becomes one row and both ids point to it', () => {
  const csv = parseCsv([
    'id,slug,name_ar,name_en,int_category_id,vendor,logo_url,website,description_ar,status,is_government,created_at,category',
    '150,salla,سلة,Salla,null,null,null,null,null,active,false,x,ecommerce',
    '29,salla-int,سلة,Salla,4,null,null,null,null,active,false,x,ecommerce',
    '1,zatca,هيئة الزكاة,ZATCA,1,null,null,null,null,active,true,x,government',
    '56,geidea,Geidea,Geidea,null,null,null,null,null,active,false,x,',
  ].join('\n'));
  const t = buildTechStack(csv);
  assert.equal(t.rows.length, 3);
  assert.equal(t.slugById.get(150), 'salla-int'); // the lowest id (29) wins
  assert.equal(t.slugById.get(29), 'salla-int');
  assert.equal(t.merged.length, 1);
  assert.equal(t.rows.find((r) => r.slug === 'zatca')!.is_government, true);
  assert.equal(t.rows.find((r) => r.slug === 'geidea')!.category, 'other');
  assert.equal(t.rows.find((r) => r.slug === 'salla-int')!.name_ar, 'سلة');
});

test('integrations: native and official flags, the word null in notes, bad flag, unknown system', () => {
  const tech = new Map([[1, 'zatca'], [2, 'paypal']]);
  const csv = parseCsv([
    'id,product_id,tech_stack_id,integration_type,is_native,is_official,notes_ar',
    '1,1,1,native,true,true,null',
    '2,1,2,native,false,true,متاح من خطة Elite',
    '3,2,2,native,maybe,true,null',
    '4,2,9,native,false,true,null',
    '5,1,2,native,false,true,null',
  ].join('\n'));
  const b = buildProductIntegrations(csv, ids, tech);
  assert.equal(b.rows.length, 2);
  assert.equal(b.rows[0].is_native, true);
  assert.equal(b.rows[0].notes_ar, null);
  assert.equal(b.rows[1].notes_ar, 'متاح من خطة Elite');
  assert.equal(b.problems.length, 3); // bad flag, unknown system, duplicate
});

test('requirement support: full and partial, default notes are flagged, other levels are rejected', () => {
  const reqs = new Map([[1, 'einvoicing'], [2, 'pos']]);
  const csv = parseCsv([
    'id,product_id,requirement_id,support_level,notes_ar',
    '1,1,1,full,null',
    '2,2,1,partial,null',
    '3,3,2,partial,افتراضي حسب الفئة - يحتاج مراجعة',
    '4,1,2,sometimes,null',
  ].join('\n'));
  const b = buildRequirementSupport(csv, ids, reqs);
  assert.equal(b.rows.length, 3);
  assert.equal(b.problems.length, 1);
  const r = (sid: string) => b.rows.find((x) => x.software_id === sid)!;
  assert.equal(r('sw1').support_status, 'supported');
  assert.equal(r('sw1').needs_review, false);
  assert.equal(r('sw2').support_status, 'partial');
  assert.equal(r('sw2').needs_review, false);
  assert.equal(r('sw3').needs_review, true);
  assert.equal(r('sw1').is_official, false);
});

test('merge: a row from saudi_support.csv replaces the same product and requirement', () => {
  const base = [
    { software_id: 'sw1', requirement_slug: 'einvoicing', nexiz_row_id: 1, support_status: 'supported', is_official: false, notes_ar: null, needs_review: false },
    { software_id: 'sw2', requirement_slug: 'einvoicing', nexiz_row_id: 2, support_status: 'partial', is_official: false, notes_ar: null, needs_review: true },
  ];
  const m = mergeSupport(base, [{ software_id: 'sw1', requirement_slug: 'einvoicing', nexiz_row_id: 9, support_status: 'certified', is_official: false, notes_ar: 'source' }]);
  assert.equal(m.rows.length, 2);
  assert.equal(m.overridden, 1);
  assert.equal(m.rows.find((x) => x.software_id === 'sw1')!.support_status, 'certified');
  assert.equal(m.rows.find((x) => x.software_id === 'sw2')!.needs_review, true);
});

test('labels: partial support, integration categories and their order, industries sorted by score', () => {
  assert.equal(supportLabel('partial', 'en').text, 'Partially supported, as documented');
  assert.equal(integrationCategoryLabel('zoho-suite', 'en'), 'Zoho suite');
  assert.equal(integrationCategoryLabel('something-new', 'en'), 'Something new');
  const g = groupIntegrations([
    { name: 'B', category: 'sms', is_native: false },
    { name: 'Z', category: 'government', is_native: false },
    { name: 'A', category: 'sms', is_native: true },
    { name: 'M', category: 'weird', is_native: false },
  ]);
  assert.deepEqual(g.map((x) => x.category), ['government', 'sms', 'weird']);
  assert.deepEqual(g[1].items.map((x) => x.name), ['A', 'B']); // native first, then by name
  assert.deepEqual(sortIndustries([{ fit: 70, sort: 2 }, { fit: 90, sort: 5 }, { fit: 70, sort: 1 }]), [{ fit: 90, sort: 5 }, { fit: 70, sort: 1 }, { fit: 70, sort: 2 }]);
});