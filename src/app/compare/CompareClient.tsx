'use client';
// Added by Claude, 2026-11-18: the Compare Software page (/compare?p=slug1,slug2,...), up to five products side by side.
// The page is the same kind of page as the profile page (cream background, navy / gold / one orange button, 14px cards, 10px buttons) and re-uses
// its styles (profile.module.css) for the top bar, buttons and variables. Only what is new lives in compare.module.css.
// Everything shown is what the vendor documents or what Nexiz scored. User and expert scores are shown apart and never blended.
// Order of the sections: Overview, Saudi Compliance, Features, Integrations, Pricing, Industry Fit, Reviews (pricing is in the middle on purpose).
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import EntityImage from '@/components/EntityImage';
import { Ic, type IconName } from '@/app/profilepage/[slug]/ProfileIcons';
import p from '@/app/profilepage/[slug]/profile.module.css';
import { MAX_COMPARE, MIN_COMPARE, bestIndex, cheapestIndex, compareHref, entry, isSame, keyDifferences, perMonth, saudiOk, sortByCoverage, unionRows, type CatalogItem, type CProduct, type Lang } from '@/lib/compare-pure';
import s from './compare.module.css';

const TXT = {
  en: {
    title: 'Compare Software', sub: 'Put up to five products side by side: compliance, features, integrations, pricing and reviews.', chip: 'Independent comparison',
    count: '{n} of {m} products', add: 'Add product', addShort: 'Add', remove: 'Remove', diffOnly: 'Show differences only', share: 'Copy link', copied: 'Link copied', max: 'You can compare up to {m} products.',
    pickTitle: 'Choose products to compare', pickSel: '{n} of {m} selected', pickMin: 'Select at least {n} products', pickGo: 'Compare', pickFull: 'Maximum reached', pickPh: 'Search by product or category...', pickNone: 'No matching products.', pickClose: 'Close', pickAdded: 'Added',
    emptyTitle: 'Choose at least two products', emptyText: 'Add products to see how they compare on Saudi compliance, features, integrations and pricing.', suggest: 'Suggested products',
    missing: 'Not found, so skipped: {n}', needTwo: 'Add one more product to start comparing.', viewProfile: 'View profile', demo: 'Request a Demo', website: 'Visit Vendor Website',
    howDiffer: 'How they differ', howSub: 'Written from the data below, so every line can be checked.', best: 'Best', same: 'Same in all',
    sections: 'Sections', soon: 'Soon',
    overview: 'Overview', overviewD: 'The basics at a glance.', category: 'Category', vendor: 'Vendor', deployment: 'Deployment', languages: 'Languages', featuresN: 'Features documented', integrationsN: 'Integrations documented',
    saudi: 'Saudi Compliance', saudiD: 'Documented support for Saudi regulations and government systems.', saudiNote: 'A vendor listing does not mean that the relevant authority endorses the solution. Verify current status with the vendor before purchase.',
    features: 'Features', featuresD: 'Features documented by each vendor.', integrations: 'Integrations', integrationsD: 'Business tools and platforms each product connects with.', native: 'Native', gov: 'Government',
    pricing: 'Pricing', pricingD: 'Plans documented by each vendor.', from: 'Starting from', lowest: 'Lowest', freePlan: 'Free plan', plans: 'Plans', onRequest: 'Price on request', free: 'Free', popular: 'Most popular', yes: 'Yes', no: 'No', perMonth: 'month', perYear: 'year', perMonthShort: '/ mo',
    pricingNote: 'Prices may change and exclude VAT unless stated otherwise. “Lowest” compares the entry price per month when all priced plans use one currency. Verify current pricing on the vendor’s official website.',
    industries: 'Industry Fit', industriesD: 'Fit scores come from the Nexiz database, not from reviewers.',
    reviews: 'Reviews', reviewsD: 'User and expert scores are kept apart and never blended.', users: 'Users', experts: 'Experts', recommend: 'Would recommend', tooFew: 'Not enough reviews yet', reviewsWord: 'reviews', reviewWord: 'review', readReviews: 'Read reviews',
    showMore: 'Show more', showLess: 'Show less', noData: 'Not documented', none: '—',
    statTotal: 'Rows', statSame: 'same in all', statDiff: 'differ', covHint: 'The small number (for example 3/5) is how many of the compared products have it.', most: 'Most', highest: 'Highest',
    basisLabel: 'Based on', lowestPlan: 'Lowest priced plan', planWord: 'plan', yearlyAs: 'billed yearly, shown per month',
    bOverview: 'Details documented by each vendor on its own website and plans. The price is the lowest priced plan (see Pricing below).',
    bSaudi: 'What each vendor documents about Saudi regulations. “—” means no support is documented, not that none exists.',
    bFeatures: 'Features each vendor documents. The same feature is matched by its name across products.',
    bIntegrations: 'Integrations each vendor documents. A tick means the product lists that integration.',
    bPricing: 'The lowest priced plan above zero of each product, monthly plans first. A yearly price is divided by 12 to be shown per month. “Lowest” is marked only when all prices use one currency.',
    bIndustries: 'Fit scores from 0 to 100 given by Nexiz for each industry. They do not come from reviewers.',
    bReviews: 'Reviews written on Nexiz. Users and experts are scored apart. A score appears only from {m} reviews.',
    status: { certified: 'Certified', supported: 'Supported', vendor_states: 'Vendor states', partial: 'Partial', planned: 'Planned', not_supported: 'Not supported' } as Record<string, string>,
  },
  ar: {
    title: 'مقارنة البرامج', sub: 'قارن حتى خمسة منتجات جنبًا إلى جنب: الامتثال والميزات والتكاملات والأسعار والتقييمات.', chip: 'مقارنة مستقلة',
    count: '{n} من {m} منتجات', add: 'إضافة منتج', addShort: 'إضافة', remove: 'إزالة', diffOnly: 'عرض الاختلافات فقط', share: 'نسخ الرابط', copied: 'تم نسخ الرابط', max: 'يمكنك مقارنة حتى {m} منتجات.',
    pickTitle: 'اختر منتجات للمقارنة', pickSel: 'تم اختيار {n} من {m}', pickMin: 'اختر {n} منتجات على الأقل', pickGo: 'قارن', pickFull: 'تم بلوغ الحد الأقصى', pickPh: 'ابحث باسم المنتج أو الفئة...', pickNone: 'لا توجد منتجات مطابقة.', pickClose: 'إغلاق', pickAdded: 'تمت الإضافة',
    emptyTitle: 'اختر منتجين على الأقل', emptyText: 'أضف منتجات لترى الفرق بينها في الامتثال السعودي والميزات والتكاملات والأسعار.', suggest: 'منتجات مقترحة',
    missing: 'غير موجود وتم تجاوزه: {n}', needTwo: 'أضف منتجًا آخر لبدء المقارنة.', viewProfile: 'عرض الملف', demo: 'طلب عرض توضيحي', website: 'زيارة موقع المورّد',
    howDiffer: 'كيف تختلف', howSub: 'مكتوبة من البيانات أدناه، لذا يمكن التحقق من كل سطر.', best: 'الأفضل', same: 'متشابه في الجميع',
    sections: 'الأقسام', soon: 'قريبًا',
    overview: 'نظرة عامة', overviewD: 'الأساسيات في لمحة.', category: 'الفئة', vendor: 'المورّد', deployment: 'النشر', languages: 'اللغات', featuresN: 'الميزات الموثّقة', integrationsN: 'التكاملات الموثّقة',
    saudi: 'الامتثال السعودي', saudiD: 'دعم موثّق للأنظمة واللوائح والأنظمة الحكومية في السعودية.', saudiNote: 'إدراج المورّد لا يعني أن الجهة المختصة تعتمد الحل. تحقق من الحالة الحالية لدى المورّد قبل الشراء.',
    features: 'الميزات', featuresD: 'ميزات موثّقة من كل مورّد.', integrations: 'التكاملات', integrationsD: 'أدوات ومنصات الأعمال التي يتكامل معها كل منتج.', native: 'مدمج', gov: 'حكومي',
    pricing: 'الأسعار', pricingD: 'باقات موثّقة من كل مورّد.', from: 'ابتداءً من', lowest: 'الأقل', freePlan: 'باقة مجانية', plans: 'الباقات', onRequest: 'السعر حسب الطلب', free: 'مجاني', popular: 'الأكثر شعبية', yes: 'نعم', no: 'لا', perMonth: 'شهريًا', perYear: 'سنويًا', perMonthShort: '/ شهر',
    pricingNote: 'قد تتغير الأسعار وهي لا تشمل ضريبة القيمة المضافة ما لم يُذكر خلاف ذلك. «الأقل» يقارن سعر البداية شهريًا عندما تستخدم كل الباقات المسعّرة عملة واحدة. تحقق من الأسعار الحالية في الموقع الرسمي للمورّد.',
    industries: 'ملاءمة القطاعات', industriesD: 'درجات الملاءمة من قاعدة بيانات Nexiz وليست من المراجعين.',
    reviews: 'التقييمات', reviewsD: 'تقييمات المستخدمين والخبراء منفصلة ولا تُدمج أبدًا.', users: 'المستخدمون', experts: 'الخبراء', recommend: 'يوصون به', tooFew: 'عدد التقييمات لا يكفي بعد', reviewsWord: 'تقييم', reviewWord: 'تقييم', readReviews: 'عرض التقييمات',
    showMore: 'عرض المزيد', showLess: 'عرض أقل', noData: 'غير موثّق', none: '—',
    statTotal: 'الصفوف', statSame: 'متشابهة في الجميع', statDiff: 'مختلفة', covHint: 'الرقم الصغير (مثل 3/5) هو عدد المنتجات المقارَنة التي تتوفر فيها.', most: 'الأكثر', highest: 'الأعلى',
    basisLabel: 'الأساس', lowestPlan: 'أقل باقة سعرًا', planWord: 'باقة', yearlyAs: 'تُحاسب سنويًا وتُعرض شهريًا',
    bOverview: 'تفاصيل يوثّقها كل مورّد في موقعه وباقاته. السعر هو أقل باقة سعرًا (انظر قسم الأسعار أدناه).',
    bSaudi: 'ما يوثّقه كل مورّد عن الأنظمة السعودية. «—» تعني عدم وجود دعم موثّق، لا عدم وجوده فعليًا.',
    bFeatures: 'الميزات التي يوثّقها كل مورّد. تتم مطابقة الميزة نفسها بين المنتجات حسب اسمها.',
    bIntegrations: 'التكاملات التي يوثّقها كل مورّد. علامة الصح تعني أن المنتج يدرج هذا التكامل.',
    bPricing: 'أقل باقة بسعر أعلى من صفر لكل منتج، مع البدء بالباقات الشهرية. السعر السنوي يُقسم على 12 لعرضه شهريًا. تُحدَّد «الأقل» فقط عندما تكون كل الأسعار بعملة واحدة.',
    bIndustries: 'درجات ملاءمة من 0 إلى 100 يضعها Nexiz لكل قطاع، وليست من المراجعين.',
    bReviews: 'تقييمات مكتوبة على Nexiz. المستخدمون والخبراء يُقيَّمون على حدة. لا تظهر الدرجة إلا من {m} تقييمات.',
    status: { certified: 'معتمد', supported: 'مدعوم', vendor_states: 'المورّد يذكر الدعم', partial: 'جزئي', planned: 'مخطط له', not_supported: 'غير مدعوم' } as Record<string, string>,
  },
} as const;

const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
const money = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const VISIBLE_ROWS = 10;

type Cell = React.ReactNode;
type Line = { key: string; label: React.ReactNode; cells: Cell[]; best?: number; same?: boolean; bestLabel?: string };

export default function CompareClient({ lang, products, catalog, missing }: { lang: Lang; products: CProduct[]; catalog: CatalogItem[]; missing: string[] }) {
  const t = TXT[lang];
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [diffOnly, setDiffOnly] = useState(false);
  const [picker, setPicker] = useState(false);
  const [toast, setToast] = useState('');
  const [hot, setHot] = useState<number | null>(null);          // column under the pointer
  const [stuck, setStuck] = useState(false);                    // the product header is pinned: show it smaller
  const [active, setActive] = useState('overview');
  const sentinel = useRef<HTMLDivElement>(null);
  const n = products.length;
  const slugs = products.map((x) => x.slug);

  // the picker opens by itself when the page has fewer than two products (a visit from the profile page or an empty /compare)
  useEffect(() => {
    if (n >= MIN_COMPARE) return;
    const id = setTimeout(() => setPicker(true), 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (next: string[]) => startTransition(() => router.push(compareHref(next), { scroll: false }));
  const addSlug = (slug: string) => { if (slugs.length < MAX_COMPARE && !slugs.includes(slug)) go([...slugs, slug]); setPicker(false); };
  const applySlugs = (next: string[]) => { setPicker(false); if (next.length !== slugs.length || next.some((x, i) => x !== slugs[i])) go(next.slice(0, MAX_COMPARE)); };
  const removeSlug = (slug: string) => go(slugs.filter((x) => x !== slug));
  const copy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setToast(t.copied); } catch { setToast(window.location.href); }
    setTimeout(() => setToast(''), 2200);
  };

  // header gets smaller once it is pinned
  useEffect(() => {
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { rootMargin: '-72px 0px 0px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [n]);

  const hasAny = (f: (x: CProduct) => number) => products.some((x) => f(x) > 0);
  const sections = useMemo(() => {
    const list: { id: string; icon: IconName; label: string }[] = [{ id: 'overview', icon: 'home', label: t.overview }];
    if (hasAny((x) => x.saudi.length)) list.push({ id: 'saudi', icon: 'shield', label: t.saudi });
    if (hasAny((x) => x.features.length)) list.push({ id: 'features', icon: 'list', label: t.features });
    if (hasAny((x) => x.integrations.length)) list.push({ id: 'integrations', icon: 'plug', label: t.integrations });
    if (hasAny((x) => x.plans.length)) list.push({ id: 'pricing', icon: 'tag', label: t.pricing });
    if (hasAny((x) => x.industries.length)) list.push({ id: 'industries', icon: 'chart', label: t.industries });
    list.push({ id: 'reviews', icon: 'star', label: t.reviews });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, lang]);

  // the tab that matches the part of the page being read
  useEffect(() => {
    if (n < MIN_COMPARE || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) setActive(e.target.id); }, { rootMargin: '-30% 0px -60% 0px' });
    sections.forEach((x) => { const el = document.getElementById(x.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [sections, n]);

  const jump = (id: string) => { setActive(id); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const style = { ['--n' as string]: n } as React.CSSProperties;

  /* ---------- empty state: fewer than two products ---------- */
  if (n < MIN_COMPARE) {
    const cat = products[0]?.category;
    const free = catalog.filter((c) => !slugs.includes(c.slug));
    const more = [...free.filter((c) => cat && c.category === cat), ...free.filter((c) => !cat || c.category !== cat)].slice(0, 8);   // same category first
    return (
      <div className={`${s.root} ${pending ? s.busy : ''}`}>
        <Hero t={t} />
        {missing.length > 0 && <p className={s.warn} role="status">{fill(t.missing, { n: missing.join(', ') })}</p>}
        <section className={s.empty}>
          <div className={s.emptyArt} aria-hidden="true"><Ic name="scale" size={34} /></div>
          <h2>{n === 0 ? t.emptyTitle : t.needTwo}</h2>
          <p>{t.emptyText}</p>
          {n === 1 && <div className={s.pickedOne}><EntityImage url={products[0].imageUrl} name={products[0].name} size={36} /><b>{products[0].name}</b></div>}
          <button type="button" className={s.primary} onClick={() => setPicker(true)}><Ic name="search" size={17} />{t.add}</button>
          {more.length > 0 && (
            <div className={s.suggest}>
              <small>{t.suggest}</small>
              <div>{more.map((c) => (<button key={c.slug} type="button" className={s.sugItem} onClick={() => addSlug(c.slug)}><EntityImage url={c.imageUrl} name={c.name} size={28} />{c.name}</button>))}</div>
            </div>
          )}
        </section>
        {picker && <Picker t={t} catalog={catalog} taken={slugs} onApply={applySlugs} onClose={() => setPicker(false)} />}
      </div>
    );
  }

  /* ---------- rows for each section ---------- */
  const best = (vals: (number | null)[]) => bestIndex(vals);
  const tick = (on: boolean | null) => on ? <span className={s.tick} role="img" aria-label={t.yes}><Ic name="check" size={14} /></span> : <span className={s.dash} aria-label={t.no}>—</span>;

  const entries = products.map(entry);
  const cheap = cheapestIndex(products);
  const cycleWord = (c: 'monthly' | 'yearly' | 'custom') => (c === 'monthly' ? t.perMonth : c === 'yearly' ? t.perYear : '');
  const priceCell = (e: ReturnType<typeof entry>) => e ? <span className={s.price}><b>{'⁦'}{money(e.amount)}{'⁩'}</b> <small>{e.currency} / {cycleWord(e.cycle)}</small>{e.cycle === 'yearly' && <small className={s.sub}>≈ {'⁦'}{money(perMonth(e))} {e.currency} {t.perMonthShort}{'⁩'}</small>}{e.name && <small className={s.sub}>{t.lowestPlan}: {e.name}</small>}</span> : <span className={s.muted}>{t.onRequest}</span>;

  const overview: Line[] = [
    { key: 'cat', label: t.category, cells: products.map((x) => x.category || t.none) },
    { key: 'price', label: t.from, best: cheap, bestLabel: t.lowest, cells: entries.map(priceCell) },
    { key: 'vendor', label: t.vendor, cells: products.map((x) => x.vendor || <span className={s.muted}>{t.none}</span>) },
    { key: 'dep', label: t.deployment, cells: products.map((x) => x.deployment || <span className={s.muted}>{t.none}</span>) },
    { key: 'lang', label: t.languages, cells: products.map((x) => x.languages || <span className={s.muted}>{t.none}</span>) },
    { key: 'fn', label: t.featuresN, cells: products.map((x) => <b className={s.big}>{x.features.length || t.none}</b>), best: best(products.map((x) => x.features.length || null)), bestLabel: t.most },
    { key: 'in', label: t.integrationsN, cells: products.map((x) => <b className={s.big}>{x.integrations.length || t.none}</b>), best: best(products.map((x) => x.integrations.length || null)), bestLabel: t.most },
  ];

  const saudiRaw = unionRows(products, (x) => x.saudi, (r) => r.status);
  const stIcon = (st: string | null) => {
    if (!st) return <span className={s.dash} aria-label={t.noData}>—</span>;
    const cls = st === 'certified' ? s.stSolid : saudiOk(st) ? s.stOk : st === 'partial' ? s.stPart : s.stNo;
    return <span className={`${s.st} ${cls}`}><Ic name={saudiOk(st) ? 'check' : st === 'partial' ? 'spark' : 'chevron'} size={12} />{t.status[st] ?? st.replace(/_/g, ' ')}</span>;
  };
  const cov = (have: number) => <small className={s.cov} title={t.covHint}>{have}/{n}</small>;
  const saudi: Line[] = saudiRaw.map((r) => ({ key: r.key, label: <>{r.label}{cov(r.cells.filter((c) => saudiOk(c as string | null)).length)}</>, cells: r.cells.map((c) => stIcon(c as string | null)), same: isSame(r) }));

  const featRows = sortByCoverage(unionRows(products, (x) => x.features, () => true));
  const features: Line[] = featRows.map((r) => ({ key: r.key, label: <>{r.label}{cov(r.cells.filter((c) => c !== null).length)}</>, cells: r.cells.map((c) => tick(c === true)), same: isSame(r) }));

  const integRows = sortByCoverage(unionRows(products, (x) => x.integrations, (i) => (i.native ? 2 : 1)));
  const govKeys = new Set(products.flatMap((x) => x.integrations.filter((i) => i.gov).map((i) => i.key)));
  const integrations: Line[] = integRows.map((r) => ({
    key: r.key, same: isSame(r),
    label: <>{r.label}{cov(r.cells.filter((c) => c !== null).length)}{govKeys.has(r.key) && <small className={s.tag}>{t.gov}</small>}</>,
    cells: r.cells.map((c) => (c === null ? tick(false) : <span className={s.tickWrap}>{tick(true)}{c === 2 && <small className={s.tag}>{t.native}</small>}</span>)),
  }));

  const industryRows = unionRows(products, (x) => x.industries, (i) => i.fit).sort((a, b) => Math.max(...b.cells.map((c) => (c as number) ?? 0)) - Math.max(...a.cells.map((c) => (c as number) ?? 0)));
  const industries: Line[] = industryRows.map((r) => ({
    key: r.key, label: <>{r.label}{cov(r.cells.filter((c) => c !== null).length)}</>, best: best(r.cells as (number | null)[]), bestLabel: t.highest,
    cells: r.cells.map((c) => (c === null ? <span className={s.dash} aria-label={t.noData}>—</span> :
      <span className={s.fit}><span className={s.track} role="img" aria-label={`${c}%`}><span className={s.trackFill} style={{ ['--w' as string]: `${Math.max(0, Math.min(100, c as number))}%` }} /></span><b>{c}</b></span>)),
  }));

  const pricing: Line[] = [
    { key: 'from', label: t.from, best: cheap, cells: entries.map(priceCell) },
    { key: 'free', label: t.freePlan, same: new Set(products.map((x) => x.plans.some((q) => q.price === 0))).size === 1, cells: products.map((x) => tick(x.plans.some((q) => q.price === 0))) },
    { key: 'plans', label: t.plans, cells: products.map((x) => x.plans.length ? (
      <ul className={s.planList}>
        {x.plans.slice(0, 5).map((q, i) => (
          <li key={i} className={q.popular ? s.planPop : undefined}>
            <span className={s.planName}>{q.name}{q.popular && <small className={s.pillGold}>{t.popular}</small>}</span>
            <span className={s.planPrice}>{q.price === null ? t.onRequest : q.price === 0 ? t.free : <>{'⁦'}{money(q.price)} {q.currency}{'⁩'}{cycleWord(q.cycle) && <small> / {cycleWord(q.cycle)}</small>}</>}</span>
          </li>
        ))}
        {x.plans.length > 5 && <li className={s.muted}>+{x.plans.length - 5}</li>}
      </ul>) : <span className={s.muted}>{t.noData}</span>) },
  ];

  const sc = (v: number | null, c: number) => v !== null ? <span className={s.score}><Ic name="star" size={17} className={s.starIc} /><b>{v.toFixed(1)}</b><small>/ 5 · {c} {c === 1 ? t.reviewWord : t.reviewsWord}</small></span> : <span className={s.muted}>{t.tooFew}{c > 0 && <small className={s.sub}>{c} {c === 1 ? t.reviewWord : t.reviewsWord}</small>}</span>;
  const reviews: Line[] = [
    { key: 'u', label: t.users, best: best(products.map((x) => x.userScore)), bestLabel: t.highest, cells: products.map((x) => sc(x.userScore, x.userCount)) },
    { key: 'e', label: t.experts, best: best(products.map((x) => x.expertScore)), bestLabel: t.highest, cells: products.map((x) => sc(x.expertScore, x.expertCount)) },
    { key: 'r', label: t.recommend, best: best(products.map((x) => x.recommendUser)), bestLabel: t.highest, cells: products.map((x) => x.recommendUser !== null ? <b className={s.big}>{x.recommendUser}%</b> : <span className={s.muted}>{t.none}</span>) },
    { key: 'l', label: '', cells: products.map((x) => <Link href={`/product/${x.slug}`} className={s.link}>{t.readReviews}<Ic name="arrow" size={14} className={p.flip} /></Link>) },
  ];

  const insights = keyDifferences(products, lang, money);

  return (
    <div className={`${s.root} ${pending ? s.busy : ''}`} style={style}>
      <div className={s.bar} aria-hidden="true" />
      <Hero t={t} />

      <div className={s.toolbar}>
        <span className={s.count}><b>{fill(t.count, { n, m: MAX_COMPARE })}</b></span>
        {missing.length > 0 && <span className={s.warnInline} role="status">{fill(t.missing, { n: missing.join(', ') })}</span>}
        <span className={s.grow} />
        <label className={s.switch}>
          <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} />
          <span className={s.knob} aria-hidden="true" />{t.diffOnly}
        </label>
        <button type="button" className={s.ghost} onClick={copy}><Ic name="doc" size={15} />{t.share}</button>
        {n < MAX_COMPARE && <button type="button" className={s.primary} onClick={() => setPicker(true)}><Ic name="search" size={16} />{t.add}</button>}
      </div>

      {insights.length > 0 && (
        <section className={s.insights} aria-label={t.howDiffer}>
          <div className={s.insHead}><span className={p.tile}><Ic name="spark" size={19} /></span><div><h2>{t.howDiffer}</h2><small>{t.howSub}</small></div></div>
          <ul>{insights.map((i, k) => <li key={k} style={{ ['--i' as string]: k } as React.CSSProperties}><span className={s.insIc}><Ic name={i.icon} size={16} /></span>{i.text}</li>)}</ul>
        </section>
      )}

      <nav className={s.nav} aria-label={t.sections}>
        {sections.map((x) => (
          <button key={x.id} type="button" onClick={() => jump(x.id)} className={x.id === active ? `${s.navBtn} ${s.navOn}` : s.navBtn} aria-current={x.id === active ? 'true' : undefined}>
            <Ic name={x.icon} size={16} /><span>{x.label}</span>
          </button>
        ))}
      </nav>

      <div className={s.scroller} onPointerLeave={() => setHot(null)}>
        <div ref={sentinel} className={s.sentinel} aria-hidden="true" />
        <div className={`${s.head} ${stuck ? s.headSmall : ''}`}>
          <div className={s.headLabel} />
          {products.map((x, i) => (
            <div key={x.slug} className={`${s.pCard} ${hot === i ? s.hot : ''}`} onPointerEnter={() => setHot(i)}>
              <span className={s.letter} data-i={i}>{LETTERS[i]}</span>
              <button type="button" className={s.x} onClick={() => removeSlug(x.slug)} aria-label={`${t.remove} ${x.name}`} title={t.remove}>×</button>
              <Link href={`/profilepage/${x.slug}`} className={s.pTop}>
                <span className={s.pLogo}><EntityImage url={x.imageUrl} name={x.name} size={stuck ? 30 : 46} /></span>
                <span className={s.pName}>{x.name}</span>
              </Link>
              <div className={s.pMeta}>
                {x.category && <span className={s.pCat}>{x.category}</span>}
                <span className={s.pRate}><Ic name="star" size={14} className={s.starIc} />{x.userScore !== null ? x.userScore.toFixed(1) : '—'}</span>
              </div>
            </div>
          ))}
        </div>

        <Section id="overview" basis={t.bOverview} icon="home" title={t.overview} desc={t.overviewD} lines={overview} {...{ products, hot, setHot, diffOnly, t }} />
        {saudi.length > 0 && <Section id="saudi" stats basis={t.bSaudi} icon="shield" title={t.saudi} desc={t.saudiD} lines={saudi} note={t.saudiNote} {...{ products, hot, setHot, diffOnly, t }} />}
        {features.length > 0 && <Section id="features" stats basis={t.bFeatures} icon="list" title={t.features} desc={t.featuresD} lines={features} collapsible {...{ products, hot, setHot, diffOnly, t }} />}
        {integrations.length > 0 && <Section id="integrations" stats basis={t.bIntegrations} icon="plug" title={t.integrations} desc={t.integrationsD} lines={integrations} collapsible {...{ products, hot, setHot, diffOnly, t }} />}
        {pricing && products.some((x) => x.plans.length) && <Section id="pricing" basis={t.bPricing} icon="tag" title={t.pricing} desc={t.pricingD} lines={pricing} note={t.pricingNote} bestLabel={t.lowest} {...{ products, hot, setHot, diffOnly, t }} />}
        {industries.length > 0 && <Section id="industries" basis={t.bIndustries} icon="chart" title={t.industries} desc={t.industriesD} lines={industries} {...{ products, hot, setHot, diffOnly, t }} />}
        <Section id="reviews" basis={fill(t.bReviews, { m: 5 })} icon="star" title={t.reviews} desc={t.reviewsD} lines={reviews} {...{ products, hot, setHot, diffOnly, t }} />

        <div className={s.actions}>
          <div className={s.headLabel} />
          {products.map((x, i) => (
            <div key={x.slug} className={`${s.actCell} ${hot === i ? s.hot : ''}`} onPointerEnter={() => setHot(i)}>
              <Link href={`/request-demo?product=${encodeURIComponent(x.slug)}`} className={s.navy}>{t.demo}</Link>
              <Link href={`/profilepage/${x.slug}`} className={s.outline}>{t.viewProfile}</Link>
              {x.website && <a href={x.website} target="_blank" rel="noopener noreferrer" className={s.outline}>{t.website}<Ic name="arrow" size={14} className={p.flip} /></a>}
            </div>
          ))}
        </div>
      </div>

      {picker && <Picker t={t} catalog={catalog} taken={slugs} onApply={applySlugs} onClose={() => setPicker(false)} />}
      {toast && <div className={s.toast} role="status">{toast}</div>}
    </div>
  );
}

function Hero({ t }: { t: (typeof TXT)['en'] | (typeof TXT)['ar'] }) {
  return (
    <section className={s.hero}>
      <div>
        <span className={s.heroChip}><Ic name="scale" size={14} />{t.chip}</span>
        <h1>{t.title}</h1>
        <p>{t.sub}</p>
      </div>
      <svg className={s.heroArt} viewBox="0 0 260 120" aria-hidden="true">
        <rect x="10" y="28" width="44" height="82" rx="8" fill="#1B3A5C" /><rect x="64" y="10" width="44" height="100" rx="8" fill="#C9A227" />
        <rect x="118" y="38" width="44" height="72" rx="8" fill="#1B3A5C" /><rect x="172" y="20" width="44" height="90" rx="8" fill="#D9541E" />
        <rect x="226" y="48" width="28" height="62" rx="8" fill="#1B3A5C" /><path d="M6 114h250" stroke="#FAF8F3" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </section>
  );
}

type SectionProps = {
  id: string; icon: IconName; title: string; desc: string; lines: Line[]; note?: string; basis?: string; stats?: boolean; collapsible?: boolean; bestLabel?: string;
  products: CProduct[]; hot: number | null; setHot: (i: number | null) => void; diffOnly: boolean; t: (typeof TXT)['en'] | (typeof TXT)['ar'];
};
function Section({ id, icon, title, desc, lines, note, basis, stats, collapsible, bestLabel, products, hot, setHot, diffOnly, t }: SectionProps) {
  const [all, setAll] = useState(false);
  const shown = diffOnly ? lines.filter((l) => !l.same) : lines;
  const rows = collapsible && !all ? shown.slice(0, VISIBLE_ROWS) : shown;
  const hidden = shown.length - rows.length;
  const hiddenSame = lines.length - shown.length;
  return (
    <section id={id} className={s.sec}>
      <header className={s.secHead}>
        <span className={p.tile}><Ic name={icon} size={19} /></span>
        <h2>{title}</h2><span className={s.secDesc}>{desc}</span>
        {diffOnly && hiddenSame > 0 && <span className={s.sameNote}>{t.same}: {hiddenSame}</span>}
      </header>
      {basis && (
        <p className={s.basis}>
          <span><b>{t.basisLabel}:</b> {basis}</span>
          {stats && lines.length > 0 && <span className={s.stats}>{t.statTotal}: <b>{lines.length}</b> · <b>{lines.filter((l) => l.same).length}</b> {t.statSame} · <b>{lines.filter((l) => !l.same).length}</b> {t.statDiff}. {t.covHint}</span>}
        </p>
      )}
      {/* on a phone the pinned header is off, so each section repeats the letters of the products */}
      <div className={s.miniHead} aria-hidden="true"><div className={s.headLabel} />{products.map((x, i) => <span key={x.slug} className={s.miniItem} title={x.name}><span className={s.letter} data-i={i}>{LETTERS[i]}</span><em>{x.name}</em></span>)}</div>
      <div className={s.rows}>
        {rows.map((l) => (
          <div key={l.key} className={s.row}>
            <div className={s.rLabel}>{l.label}</div>
            {l.cells.map((c, i) => (
              <div key={i} className={`${s.cell} ${l.best === i ? s.best : ''} ${hot === i ? s.hot : ''}`} onPointerEnter={() => setHot(i)}>
                {c}{l.best === i && <small className={s.bestTag} title={basis}>{l.bestLabel ?? bestLabel ?? t.best}</small>}
              </div>
            ))}
          </div>
        ))}
        {rows.length === 0 && <p className={s.allSame}>{t.same}</p>}
      </div>
      {collapsible && shown.length > VISIBLE_ROWS && (
        <div className={s.moreWrap}><button type="button" className={p.moreBtn} style={{ marginBottom: 0 }} onClick={() => setAll(!all)}>{all ? t.showLess : `${t.showMore} (${hidden})`}</button></div>
      )}
      {note ? <p className={`${p.note} ${s.secNote}`}>{note}</p> : <div style={{ height: 6 }} />}
    </section>
  );
}

function Picker({ t, catalog, taken, onApply, onClose }: { t: (typeof TXT)['en'] | (typeof TXT)['ar']; catalog: CatalogItem[]; taken: string[]; onApply: (slugs: string[]) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>(taken);          // already added products start ticked; the order of ticking is the order of the columns
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return catalog.filter((c) => !needle || c.name.toLowerCase().includes(needle) || c.category.toLowerCase().includes(needle)).slice(0, 60);
  }, [q, catalog]);
  const full = sel.length >= MAX_COMPARE;
  const toggle = (slug: string) => setSel((cur) => (cur.includes(slug) ? cur.filter((x) => x !== slug) : cur.length < MAX_COMPARE ? [...cur, slug] : cur));
  const ready = sel.length >= MIN_COMPARE;
  return (
    <div className={s.modal} role="dialog" aria-modal="true" aria-label={t.pickTitle} onClick={onClose}>
      <div className={s.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={s.sheetHead}><h2>{t.pickTitle}</h2><button type="button" className={s.x2} onClick={onClose} aria-label={t.pickClose}>×</button></div>
        <label className={p.search} style={{ margin: 0, width: 'auto', maxWidth: 'none' }}>
          <Ic name="search" size={16} />
          <input autoFocus type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.pickPh} aria-label={t.pickPh} />
        </label>
        <ul className={s.pickList}>
          {list.map((c) => {
            const on = sel.includes(c.slug);
            const locked = !on && full;
            return (
              <li key={c.slug}>
                <label className={`${s.pickItem} ${on ? s.pickOn : ''} ${locked ? s.pickLocked : ''}`}>
                  <input type="checkbox" className={s.pickBox} checked={on} disabled={locked} onChange={() => toggle(c.slug)} />
                  <EntityImage url={c.imageUrl} name={c.name} size={34} />
                  <span><b>{c.name}</b><small>{c.category}</small></span>
                  {on && <span className={s.pillGold}>{LETTERS[sel.indexOf(c.slug)]}</span>}
                </label>
              </li>
            );
          })}
          {list.length === 0 && <li className={s.muted} style={{ padding: 16 }}>{t.pickNone}</li>}
        </ul>
        <div className={s.sheetFoot}>
          <span className={s.sheetCount}>
            <b>{fill(t.pickSel, { n: sel.length, m: MAX_COMPARE })}</b>
            <small>{full ? t.pickFull : !ready ? fill(t.pickMin, { n: MIN_COMPARE }) : ''}</small>
          </span>
          <button type="button" className={s.primary} disabled={!ready} onClick={() => onApply(sel)}>{t.pickGo}</button>
        </div>
      </div>
    </div>
  );
}