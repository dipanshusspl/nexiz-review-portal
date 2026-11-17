// Added by Prachi, 2026-11-10: small pure helpers for the profile page (labels, grouping, entry price). Tested in scripts/profile-labels.test.ts.
type Lang = 'en' | 'ar';

// The feature categories arrive in Arabic only. Their English names:
export const FEATURE_CATEGORY_EN: Record<string, string> = {
  'المحاسبة': 'Accounting', 'المبيعات': 'Sales', 'التكامل والدعم': 'Integration & support', 'المخزون': 'Inventory',
  'الموارد البشرية': 'HR', 'التقارير': 'Reporting', 'إدارة المبيعات': 'Sales management', 'المشتريات': 'Purchases',
  'العمليات': 'Operations', 'نقاط البيع': 'Point of sale', 'الفوترة': 'Invoicing', 'المخزون والمشتريات': 'Inventory & purchasing',
  'إدارة العملاء': 'Customer management', 'المشاريع': 'Projects', 'التخصيص والأتمتة': 'Customization & automation',
  'الأصول الثابتة': 'Fixed assets', 'الرقابة المالية': 'Financial control', 'المستندات والتعاون': 'Documents & collaboration',
  'الامتثال': 'Compliance', 'الصلاحيات': 'Permissions', 'المنتجات': 'Products', 'الأصول': 'Assets',
  'التصميم': 'Design', 'علاقات العملاء': 'Customer relations', 'المالية': 'Finance',
};

export function categoryLabel(categoryAr: string | null, lang: Lang): string {
  if (!categoryAr) return lang === 'ar' ? 'أخرى' : 'Other';
  return lang === 'ar' ? categoryAr : FEATURE_CATEGORY_EN[categoryAr] ?? categoryAr;
}

/** Groups in the order each category first appears. Items keep their order. */
export function groupFeatures<T extends { category_ar: string | null }>(items: T[]): { category: string | null; items: T[] }[] {
  const groups: { category: string | null; items: T[] }[] = [];
  for (const it of items) {
    const k = it.category_ar || null;
    let g = groups.find((x) => x.category === k);
    if (!g) { g = { category: k, items: [] }; groups.push(g); }
    g.items.push(it);
  }
  return groups;
}

type PlanLike = { price_amount: number | null; currency: string; billing_cycle: 'monthly' | 'yearly' | 'custom' };
/** The lowest price above 0: monthly plans first, yearly only when no monthly plan has a price. Null when nothing is priced. */
export function entryPrice(plans: PlanLike[]): { amount: number; currency: string; cycle: 'monthly' | 'yearly' } | null {
  for (const cycle of ['monthly', 'yearly'] as const) {
    const priced = plans.filter((p) => p.billing_cycle === cycle && p.price_amount !== null && p.price_amount > 0);
    if (priced.length) { const m = priced.reduce((a, b) => (b.price_amount! < a.price_amount! ? b : a)); return { amount: m.price_amount!, currency: m.currency, cycle }; }
  }
  return null;
}

const STATUS: Record<string, { en: string; ar: string; tone: 'solid' | 'soft' }> = {
  certified: { en: 'Certified, as documented', ar: 'معتمد، وفق التوثيق', tone: 'solid' },
  supported: { en: 'Supported, as documented', ar: 'مدعوم، وفق التوثيق', tone: 'soft' },
  vendor_states: { en: 'Vendor states support for this requirement', ar: 'المورّد يذكر دعم هذا المتطلب', tone: 'soft' },
  planned: { en: 'Planned', ar: 'مخطط له', tone: 'soft' },
  not_supported: { en: 'Not supported', ar: 'غير مدعوم', tone: 'soft' },
};
export function supportLabel(status: string, lang: Lang): { text: string; tone: 'solid' | 'soft' } {
  const s = STATUS[status];
  if (s) return { text: s[lang], tone: s.tone };
  const raw = status.replace(/_/g, ' ');
  return { text: raw.charAt(0).toUpperCase() + raw.slice(1), tone: 'soft' };
}