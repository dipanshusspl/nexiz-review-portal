// Rewritten by Prachi, 2026-11-13: the sections of the profile page (/profilepage/<slug>) as rows that open and close, following the approved mockup.
// Earlier versions (2026-11-10 and 2026-11-11) showed every section as a long list; a copy is kept in the backup folder.
// Everything here is what the VENDOR (or a third party) documents. It is labelled so and kept apart from reviewer data (the Reviews row only
// shows counts and scores; the reviews themselves stay on /product/<slug>). User score and expert score are never blended.
import Link from 'next/link';
import EntityImage from '@/components/EntityImage';
import type { ProfileExtras } from '@/lib/profile-extras';
import { sortIndustries, supportLabel } from '@/lib/profile-labels';
import { Ic, type IconName } from './ProfileIcons';
import s from './profile.module.css';

type Lang = 'en' | 'ar';

export const TXT = {
  en: {
    overview: 'Overview', noDesc: 'There are no profile details for this product yet.',
    features: 'Key Features', featuresDesc: 'Powerful features documented by the vendor.', featShown: '{a} of {b} shown', featCount: '{n} features', showMore: 'Show more', showLess: 'Show less', moreChips: '+{n} more',
    integrations: 'Integrations', integrationsDesc: 'Connect with business tools and platforms.', intCount: '{n} integrations', native: 'Native', gov: 'Government',
    intNote: 'Availability can depend on the plan. Verify with the vendor before purchase.', allSystems: 'See all systems and the products that use them',
    pricing: 'Pricing', pricingDesc: 'Plans documented by the vendor.', from: 'From {p}', perMonth: 'month', perYear: 'year', onRequest: 'Price on request', free: 'Free', popular: 'Most popular', planCount: '{n} plans',
    pricingNote: 'Prices may change and exclude VAT unless stated otherwise. Verify current pricing on the vendor’s official website. Copied from the Nexiz database on {date}.',
    saudi: 'Saudi Compliance', saudiDesc: 'Documented support for Saudi regulations and government systems.', certified: 'Certified', reqCount: '{n} requirements',
    saudiNote: 'A vendor listing does not mean that the relevant authority endorses the solution. Verify current status with the vendor before purchase.',
    industries: 'Industries', industriesDesc: 'Fit scores come from the Nexiz database, not from reviewers.', indCount: '{n} industries', fit: 'Fit',
    alternatives: 'Alternatives', alternativesDesc: 'Explore similar solutions that may better fit your needs.', altCount: '{n} alternatives',
    reviews: 'Reviews', reviewsDesc: 'See what other businesses are saying.', reviewCount: '{n} reviews', reviewOne: '1 review', noReviews: 'No reviews yet',
    users: 'Users', experts: 'Experts', tooFew: 'Not enough reviews to publish a score yet', seeAll: 'See all reviews', write: 'Write a review',
    short: { certified: 'Certified', supported: 'Supported', vendor_states: 'Vendor states', partial: 'Partial', planned: 'Planned', not_supported: 'Not supported' } as Record<string, string>,
  },
  ar: {
    overview: 'نظرة عامة', noDesc: 'لا توجد تفاصيل في الملف التعريفي لهذا المنتج بعد.',
    features: 'الميزات الرئيسية', featuresDesc: 'ميزات موثّقة من المورّد.', featShown: 'عرض {a} من {b}', featCount: '{n} ميزة', showMore: 'عرض المزيد', showLess: 'عرض أقل', moreChips: '+{n} أخرى',
    integrations: 'التكاملات', integrationsDesc: 'اربط أدوات ومنصات عملك.', intCount: '{n} تكاملًا', native: 'مدمج', gov: 'حكومي',
    intNote: 'قد يعتمد توفرها على الباقة. تحقق من المورّد قبل الشراء.', allSystems: 'عرض كل الأنظمة والمنتجات التي تستخدمها',
    pricing: 'الأسعار', pricingDesc: 'باقات موثّقة من المورّد.', from: 'ابتداءً من {p}', perMonth: 'شهريًا', perYear: 'سنويًا', onRequest: 'السعر حسب الطلب', free: 'مجاني', popular: 'الأكثر شعبية', planCount: '{n} باقات',
    pricingNote: 'قد تتغير الأسعار وهي لا تشمل ضريبة القيمة المضافة ما لم يُذكر خلاف ذلك. تحقق من الأسعار الحالية في الموقع الرسمي للمورّد. نُسخت من قاعدة بيانات Nexiz بتاريخ {date}.',
    saudi: 'الامتثال السعودي', saudiDesc: 'دعم موثّق للأنظمة واللوائح والأنظمة الحكومية في السعودية.', certified: 'معتمد', reqCount: '{n} متطلبات',
    saudiNote: 'إدراج المورّد لا يعني أن الجهة المختصة تعتمد الحل. تحقق من الحالة الحالية لدى المورّد قبل الشراء.',
    industries: 'القطاعات', industriesDesc: 'درجات الملاءمة من قاعدة بيانات Nexiz وليست من المراجعين.', indCount: '{n} قطاعات', fit: 'الملاءمة',
    alternatives: 'البدائل', alternativesDesc: 'استكشف حلولًا مشابهة قد تناسب احتياجاتك.', altCount: '{n} بدائل',
    reviews: 'التقييمات', reviewsDesc: 'اطّلع على آراء الشركات الأخرى.', reviewCount: '{n} تقييمًا', reviewOne: 'تقييم واحد', noReviews: 'لا توجد تقييمات بعد',
    users: 'المستخدمون', experts: 'الخبراء', tooFew: 'عدد التقييمات لا يكفي لنشر درجة بعد', seeAll: 'عرض كل التقييمات', write: 'اكتب تقييمًا',
    short: { certified: 'معتمد', supported: 'مدعوم', vendor_states: 'المورّد يذكر الدعم', partial: 'جزئي', planned: 'مخطط له', not_supported: 'غير مدعوم' } as Record<string, string>,
  },
} as const;

export const money = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });
const fill = (t: string, v: Record<string, string | number>) => t.replace(/\{(\w+)\}/g, (_, k) => String(v[k] ?? ''));
const VISIBLE = 8;

/** One row of the page: icon, title, one line of text, a short figure on the side, and a body that opens. */
export function Row({ id, icon, title, desc, meta, children }: { id: string; icon: IconName; title: string; desc: string; meta?: React.ReactNode; children: React.ReactNode }) {
  return (
    <details id={id} className={s.row}>
      <summary className={s.rowHead}>
        <span className={s.tile}><Ic name={icon} size={19} /></span>
        <span className={s.rowTitle}>{title}</span>
        <span className={s.rowDesc}>{desc}</span>
        {meta && <span className={s.rowMeta}>{meta}</span>}
        <Ic name="chevron" size={18} className={s.chev} />
      </summary>
      <div className={s.rowBody}>{children}</div>
    </details>
  );
}

/** Chips or items: the first few are shown, the rest open with "Show more" (plain <details>, no script). */
function More({ lang, hidden, children }: { lang: Lang; hidden: number; children: React.ReactNode }) {
  const t = TXT[lang];
  if (hidden <= 0) return null;
  return (
    <details className={s.more}>
      <summary className={s.moreBtn}><span className={s.moreOpen}>{t.showMore} ({hidden})</span><span className={s.moreClose}>{t.showLess}</span></summary>
      {children}
    </details>
  );
}

/** Up to four badges for the strip in the Overview card. Taken from the vendor-documented Saudi support, most important requirements first. */
export function complianceBadges(extras: ProfileExtras, lang: Lang): { key: string; title: string; sub: string }[] {
  const order = ['einvoicing', 'wps', 'vat', 'payroll', 'hr', 'accounting', 'api', 'pos'];
  const ok = extras.saudi.filter((r) => r.status !== 'not_supported' && r.status !== 'planned');
  const rank = (slug: string) => { const i = order.indexOf(slug); return i < 0 ? order.length : i; };
  return [...ok].sort((a, b) => rank(a.slug) - rank(b.slug)).slice(0, 4).map((r) => ({ key: r.slug, title: lang === 'ar' ? r.name_ar : r.name_en, sub: TXT[lang].short[r.status] ?? supportLabel(r.status, lang).text }));
}

/** The short codes for "Saudi Compliance" in the side panel (Changed 2026-11-13).
 *  ZATCA when e-invoicing is documented (certified or supported), then the government systems it integrates with, then WPS when documented.
 *  A product with none of these shows its first documented requirements instead, so the row is never empty when there is Saudi support data. */
export function glanceCodes(extras: ProfileExtras, lang: Lang = 'en'): string {
  const ok = extras.saudi.filter((r) => r.status !== 'not_supported' && r.status !== 'planned');
  const codes: string[] = [];
  if (ok.some((r) => r.slug === 'einvoicing')) codes.push('ZATCA');
  codes.push(...extras.integrations.filter((i) => i.is_government).map((i) => i.name_en.toUpperCase()));
  if (ok.some((r) => r.slug === 'wps')) codes.push('WPS');
  const uniq = [...new Set(codes)];
  if (uniq.length) return uniq.slice(0, 4).join(', ');
  return ok.slice(0, 3).map((r) => (lang === 'ar' ? r.name_ar : r.name_en)).join(lang === 'ar' ? '، ' : ', ');
}

export function OverviewCard({ lang, description, extras }: { lang: Lang; description: string | null; extras: ProfileExtras }) {
  const t = TXT[lang];
  const badges = complianceBadges(extras, lang);
  return (
    <section className={s.card} id="overview">
      <div className={s.ovHead}>
        <span className={s.tile}><Ic name="doc" size={21} /></span>
        <div>
          <h2 className={s.ovTitle}>{t.overview}</h2>
          {description ? <p className={s.ovText}>{description}</p> : !badges.length && <p className={s.ovText}>{t.noDesc}</p>}
        </div>
      </div>
      {badges.length > 0 && (
        <div className={s.strip}>
          {badges.map((b) => (
            <div key={b.key} className={s.badge}>
              <span className={s.badgeIc}><Ic name="shield-check" size={17} /></span>
              <span><b>{b.title}</b><small>{b.sub}</small></span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function FeaturesRow({ lang, extras }: { lang: Lang; extras: ProfileExtras }) {
  const t = TXT[lang];
  const list = extras.features;
  if (!list.length) return null;
  const name = (f: (typeof list)[number]) => (lang === 'ar' ? f.feature_ar || f.feature_en : f.feature_en || f.feature_ar);
  const item = (f: (typeof list)[number], i: number) => (<div key={i} className={s.feat}><span className={s.tick}><Ic name="check" size={13} /></span><span>{name(f)}</span></div>);
  const meta = list.length > VISIBLE ? fill(t.featShown, { a: VISIBLE, b: list.length }) : fill(t.featCount, { n: list.length });
  return (
    <Row id="features" icon="star" title={t.features} desc={t.featuresDesc} meta={meta}>
      <div className={s.featGrid}>{list.slice(0, VISIBLE).map(item)}</div>
      <More lang={lang} hidden={list.length - VISIBLE}><div className={s.featGrid}>{list.slice(VISIBLE).map((f, i) => item(f, i + VISIBLE))}</div></More>
    </Row>
  );
}

export function IntegrationsRow({ lang, extras }: { lang: Lang; extras: ProfileExtras }) {
  const t = TXT[lang];
  const list = [...extras.integrations].sort((a, b) => Number(b.is_native) - Number(a.is_native) || a.name.localeCompare(b.name));
  if (!list.length) return null;
  const chip = (it: (typeof list)[number]) => (
    // Link to /tech-stack#<slug> is switched off for now (the names are not clickable). To switch it on again wrap the name in <Link href={`/tech-stack#${it.slug}`}>.
    <span key={it.slug} className={s.chip}>{it.name}{it.is_government && <small className={s.chipTag}>{t.gov}</small>}</span>
  );
  return (
    <Row id="integrations" icon="plug" title={t.integrations} desc={t.integrationsDesc} meta={fill(t.intCount, { n: list.length })}>
      <div className={s.chips}>{list.slice(0, VISIBLE).map(chip)}</div>
      <More lang={lang} hidden={list.length - VISIBLE}><div className={s.chips}>{list.slice(VISIBLE).map(chip)}</div></More>
      <p className={s.note}>{t.intNote} <Link href="/tech-stack" className={s.link}>{t.allSystems}</Link></p>
    </Row>
  );
}

export function PricingRow({ lang, extras, entryText }: { lang: Lang; extras: ProfileExtras; entryText: string | null }) {
  const t = TXT[lang];
  if (!extras.plans.length) return null;
  const date = extras.updatedAt ? new Date(extras.updatedAt).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  return (
    <Row id="pricing" icon="tag" title={t.pricing} desc={t.pricingDesc} meta={entryText ?? fill(t.planCount, { n: extras.plans.length })}>
      <div className={s.plans}>
        {extras.plans.map((p, i) => {
          const cycle = p.billing_cycle === 'monthly' ? t.perMonth : p.billing_cycle === 'yearly' ? t.perYear : '';
          // the plan descriptions exist in Arabic only; their points are separated by " · ", so they are shown as a list on the Arabic page only
          const points = lang === 'ar' && p.description_ar ? p.description_ar.split(' · ').map((x) => x.trim()).filter(Boolean).slice(0, 6) : [];
          return (
            <div key={i} className={p.is_popular ? `${s.plan} ${s.planPop}` : s.plan}>
              <div className={s.planTop}>
                <span className={s.planName}>{(lang === 'ar' ? p.plan_name_ar || p.plan_name_en : p.plan_name_en) || ''}</span>
                {p.is_popular && <span className={s.pill}>{t.popular}</span>}
              </div>
              <div className={s.planPrice}>
                {p.price_amount === null ? <strong>{t.onRequest}</strong> : p.price_amount === 0 ? <strong>{t.free}</strong> : <><b>{money(p.price_amount)}</b> <span>{p.currency}{cycle && ` / ${cycle}`}</span></>}
              </div>
              {points.length > 0 && <ul className={s.points}>{points.map((x, k) => <li key={k}><Ic name="check" size={13} />{x}</li>)}</ul>}
            </div>
          );
        })}
      </div>
      <p className={s.note}>{fill(t.pricingNote, { date })}</p>
    </Row>
  );
}

export function SaudiRow({ lang, extras }: { lang: Lang; extras: ProfileExtras }) {
  const t = TXT[lang];
  if (!extras.saudi.length) return null;
  const certified = extras.saudi.some((r) => r.status === 'certified');
  const meta = certified ? <span className={s.pill}><Ic name="check" size={13} />{t.certified}</span> : fill(t.reqCount, { n: extras.saudi.length });
  return (
    <Row id="saudi" icon="shield" title={t.saudi} desc={t.saudiDesc} meta={meta}>
      <div className={s.reqs}>
        {extras.saudi.map((r) => {
          const st = supportLabel(r.status, lang);
          return (
            <div key={r.slug} className={s.req}>
              <div className={s.reqTop}>
                <span className={s.reqName}>{lang === 'ar' ? r.name_ar : r.name_en}</span>
                <span className={st.tone === 'solid' ? `${s.pill} ${s.pillSolid}` : s.pill}>{st.text}</span>
              </div>
              {/* the notes (with their sources) exist in Arabic only, so they are shown on the Arabic page only */}
              {lang === 'ar' && r.notes_ar && <p className={s.reqNote}>{r.notes_ar}</p>}
            </div>
          );
        })}
      </div>
      <p className={s.note}>{t.saudiNote}</p>
    </Row>
  );
}

export function IndustriesRow({ lang, extras }: { lang: Lang; extras: ProfileExtras }) {
  const t = TXT[lang];
  if (!extras.industries.length) return null;
  return (
    <Row id="industries" icon="chart" title={t.industries} desc={t.industriesDesc} meta={fill(t.indCount, { n: extras.industries.length })}>
      <div className={s.inds}>
        {sortIndustries(extras.industries).map((i) => (
          <div key={i.slug} className={s.ind}>
            <span className={s.indName}>{lang === 'ar' ? i.name_ar : i.name_en}</span>
            <span className={s.track} role="img" aria-label={`${t.fit} ${i.fit}%`}><span className={s.trackFill} style={{ width: `${Math.max(0, Math.min(100, i.fit))}%` }} /></span>
            <span className={s.indScore}>{i.fit}</span>
          </div>
        ))}
      </div>
    </Row>
  );
}

export function AlternativesRow({ lang, extras }: { lang: Lang; extras: ProfileExtras }) {
  const t = TXT[lang];
  if (!extras.alternatives.length) return null;
  return (
    <Row id="alternatives" icon="swap" title={t.alternatives} desc={t.alternativesDesc} meta={fill(t.altCount, { n: extras.alternatives.length })}>
      <div className={s.alts}>
        {extras.alternatives.map((a) => (
          <Link key={a.slug} href={`/product/${a.slug}`} className={s.alt}>
            <div className={s.altTop}>
              <EntityImage url={a.image_url} name={a.name} size={36} />
              <div><div className={s.altName}>{a.name}</div>{a.category && <div className={s.altCat}>{a.category}</div>}</div>
            </div>
            {/* the reasons exist in Arabic only, so they are shown on the Arabic page only */}
            {lang === 'ar' && a.reason_ar && <p className={s.altWhy}>{a.reason_ar}</p>}
          </Link>
        ))}
      </div>
    </Row>
  );
}

type Part = { count: number; score: number | null };
export function ReviewsRow({ lang, slug, total, user, expert, writeHref }: { lang: Lang; slug: string; total: number; user: Part; expert: Part; writeHref: string }) {
  const t = TXT[lang];
  const meta = total === 0 ? t.noReviews : total === 1 ? t.reviewOne : fill(t.reviewCount, { n: total });
  const line = (label: string, p: Part) => (
    <div className={s.scoreLine}>
      <span className={s.scoreWho}>{label}</span>
      {p.score !== null ? <><b className={s.scoreNum}>{p.score.toFixed(1)}</b><span className={s.scoreOf}>/ 5</span></> : <span className={s.scoreNone}>{t.tooFew}</span>}
      <span className={s.scoreN}>{p.count === 1 ? t.reviewOne : fill(t.reviewCount, { n: p.count })}</span>
    </div>
  );
  return (
    <Row id="reviews" icon="star" title={t.reviews} desc={t.reviewsDesc} meta={meta}>
      {line(t.users, user)}
      {line(t.experts, expert)}
      <div className={s.actions}>
        {total > 0 && <Link href={`/product/${slug}`} className={s.btnLine}>{t.seeAll}<Ic name="arrow" size={15} className={s.flip} /></Link>}
        <Link href={writeHref} className={s.btnLine}><Ic name="star" size={15} />{t.write}</Link>
      </div>
    </Row>
  );
}