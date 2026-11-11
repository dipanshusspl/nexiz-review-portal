// Added by Prachi, 2026-11-10: tests for src/lib/profile-labels.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { categoryLabel, entryPrice, groupFeatures, supportLabel, FEATURE_CATEGORY_EN } from '../src/lib/profile-labels';

test('category names: English from the list, unknown ones stay Arabic, none becomes Other', () => {
  assert.equal(categoryLabel('المحاسبة', 'en'), 'Accounting');
  assert.equal(categoryLabel('المحاسبة', 'ar'), 'المحاسبة');
  assert.equal(categoryLabel('شيء جديد', 'en'), 'شيء جديد');
  assert.equal(categoryLabel(null, 'en'), 'Other');
  assert.equal(Object.keys(FEATURE_CATEGORY_EN).length, 25);
});

test('features are grouped in the order each category first appears', () => {
  const g = groupFeatures([{ n: 1, category_ar: 'ب' }, { n: 2, category_ar: 'أ' }, { n: 3, category_ar: 'ب' }, { n: 4, category_ar: null }]);
  assert.deepEqual(g.map((x) => [x.category, x.items.map((i) => i.n)]), [['ب', [1, 3]], ['أ', [2]], [null, [4]]]);
});

test('entry price: lowest monthly price above 0, yearly only as a fallback, none when nothing is priced', () => {
  const m = (a: number | null, c: 'monthly' | 'yearly' | 'custom' = 'monthly') => ({ price_amount: a, currency: 'SAR', billing_cycle: c });
  assert.deepEqual(entryPrice([m(249), m(119), m(0), m(null)]), { amount: 119, currency: 'SAR', cycle: 'monthly' });
  assert.deepEqual(entryPrice([m(0), m(900, 'yearly'), m(700, 'yearly')]), { amount: 700, currency: 'SAR', cycle: 'yearly' });
  assert.equal(entryPrice([m(null), m(0), m(null, 'custom')]), null);
});

test('support labels: known statuses, and an unknown one is shown as written', () => {
  assert.equal(supportLabel('certified', 'en').tone, 'solid');
  assert.equal(supportLabel('supported', 'ar').text, 'مدعوم، وفق التوثيق');
  assert.equal(supportLabel('in_review', 'en').text, 'In review');
});