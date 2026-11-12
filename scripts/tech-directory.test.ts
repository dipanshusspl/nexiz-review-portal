// Added by Prachi, 2026-11-11: tests for src/lib/tech-directory-pure.ts (the /tech-stack page).
// Run: npx tsx --test scripts/tech-directory.test.ts
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDirectory } from '../src/lib/tech-directory-pure';

const tech = [
  { id: 't1', slug: 'zatca', name_en: 'ZATCA', name_ar: 'هيئة الزكاة', category: 'government', is_government: true },
  { id: 't2', slug: 'paypal', name_en: 'PayPal', name_ar: 'باي بال', category: 'payment', is_government: false },
  { id: 't3', slug: 'stripe', name_en: 'Stripe', name_ar: null, category: 'payment', is_government: false },
  { id: 't4', slug: 'rased', name_en: 'Rased', name_ar: 'رصد', category: 'payment', is_government: true }, // government wins over its category
  { id: 't5', slug: 'x', name_en: 'Mystery', name_ar: null, category: 'brand-new', is_government: false },
];
const sw = [
  { id: 's1', slug: 'zoho-books', name: 'Zoho Books', image_url: null },
  { id: 's2', slug: 'daftra', name: 'Daftra', image_url: null },
];

test('groups follow the fixed order, government first, unknown categories last', () => {
  const d = buildDirectory(tech, [], sw, 'en');
  assert.deepEqual(d.groups.map((g) => g.category), ['government', 'payment', 'brand-new']);
  assert.equal(d.total, 5);
  assert.equal(d.used, 0);
  assert.deepEqual(d.groups[0].systems.map((s) => s.slug), ['rased', 'zatca']);
});

test('systems with products come first, most products first, then the others by name', () => {
  const links = [
    { software_id: 's1', tech_stack_id: 't3', is_native: false },
    { software_id: 's2', tech_stack_id: 't3', is_native: true },
    { software_id: 's1', tech_stack_id: 't2', is_native: false },
  ];
  const d = buildDirectory(tech, links, sw, 'en');
  const pay = d.groups.find((g) => g.category === 'payment')!;
  assert.deepEqual(pay.systems.map((s) => s.slug), ['stripe', 'paypal']);
  assert.equal(pay.used, 2);
  assert.equal(d.used, 2);
  assert.deepEqual(pay.systems[0].products.map((p) => p.slug), ['daftra', 'zoho-books']); // native first
});

test('a product is listed once per system, a link to unknown software is ignored', () => {
  const links = [
    { software_id: 's1', tech_stack_id: 't2', is_native: false },
    { software_id: 's1', tech_stack_id: 't2', is_native: true },
    { software_id: 'gone', tech_stack_id: 't2', is_native: false },
  ];
  const p = buildDirectory(tech, links, sw, 'en').groups.find((g) => g.category === 'payment')!.systems.find((s) => s.slug === 'paypal')!;
  assert.equal(p.products.length, 1);
  assert.equal(p.products[0].is_native, true);
});

test('names follow the language, and fall back to English when there is no Arabic name', () => {
  const d = buildDirectory(tech, [], sw, 'ar');
  const names = d.groups.flatMap((g) => g.systems.map((s) => s.name));
  assert.ok(names.includes('باي بال'));
  assert.ok(names.includes('Stripe'));
});