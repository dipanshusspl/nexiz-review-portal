// Changed by Prachi, 2026-11-11: Industries and Integrations sections added.
// Added by Prachi, 2026-11-10: the sections of the profile page (/profilepage/<slug>), built from the data copied out of the main Nexiz database.
// Everything here is what the VENDOR (or a third party) documents. It is labelled so and kept apart from reviewer data, which stays on the product page.
import Link from 'next/link';
import EntityImage from '@/components/EntityImage';
import type { ProfileExtras } from '@/lib/profile-extras';
import { categoryLabel, groupFeatures, groupIntegrations, integrationCategoryLabel, sortIndustries, supportLabel } from '@/lib/profile-labels';
import s from './profile.module.css';

type Lang = 'en' | 'ar';

export const TXT = {
  en: {
    featuresTitle: 'Features documented from vendor sources', featuresSub: 'Taken from the vendor’s own materials. Reviewers have not confirmed them.',
    saudiTitle: 'Saudi government systems compliance', saudiSub: 'Documented support for regulatory and government-system requirements in Saudi Arabia',
    saudiNote: 'A vendor listing does not mean that the relevant authority endorses the solution. Verify current status with the vendor before purchase.',
    pricingTitle: 'Pricing & plans', perMonth: 'month', perYear: 'year', onRequest: 'Price on request', free: 'Free', popular: 'Most popular',
    pricingNote: 'Prices may change and exclude VAT unless stated otherwise. Verify current pricing on the vendor’s official website. Copied from the Nexiz database on {date}.',
    altTitle: 'Alternatives you may consider',
    indTitle: 'Industries it fits', indSub: 'Fit scores come from the Nexiz database. They are not reviewer ratings.', fit: 'Fit',
    intTitle: 'Integrations', intSub: 'Taken from the vendor’s own materials. Reviewers have not confirmed them.',
    intNote: 'Availability can depend on the plan. Verify with the vendor before purchase.', native: 'Native', gov: 'Government', allSystems: 'See all systems and the products that use them',
  },
  ar: {
    featuresTitle: 'المزايا الموثّقة من مصادر المورّد', featuresSub: 'مأخوذة من مواد المورّد نفسه، ولم يؤكدها المراجعون.',
    saudiTitle: 'الامتثال للأنظمة الحكومية السعودية', saudiSub: 'دعم موثّق للمتطلبات التنظيمية ومتطلبات الأنظمة الحكومية في المملكة العربية السعودية',
    saudiNote: 'إدراج المورّد لا يعني أن الجهة المختصة تعتمد الحل. تحقق من الحالة الحالية لدى المورّد قبل الشراء.',
    pricingTitle: 'الأسعار والباقات', perMonth: 'شهريًا', perYear: 'سنويًا', onRequest: 'السعر حسب الطلب', free: 'مجاني', popular: 'الأكثر شعبية',
    pricingNote: 'قد تتغير الأسعار وهي لا تشمل ضريبة القيمة المضافة ما لم يُذكر خلاف ذلك. تحقق من الأسعار الحالية في الموقع الرسمي للمورّد. نُسخت من قاعدة بيانات Nexiz بتاريخ {date}.',
    altTitle: 'بدائل قد تناسبك',
    indTitle: 'القطاعات المناسبة', indSub: 'درجات الملاءمة مأخوذة من قاعدة بيانات Nexiz وليست من تقييمات المراجعين.', fit: 'الملاءمة',
    intTitle: 'التكاملات', intSub: 'مأخوذة من مواد المورّد نفسه، ولم يؤكدها المراجعون.',
    intNote: 'قد يعتمد توفرها على الباقة. تحقق من المورّد قبل الشراء.', native: 'مدمج', gov: 'حكومي', allSystems: 'عرض كل الأنظمة والمنتجات التي تستخدمها',
  },
} as const;

export const money = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export function SaudiSupport({ lang, extras }: { lang: Lang; extras: ProfileExtras }) {
  const t = TXT[lang];
  if (!extras.saudi.length) return null;
  return (
    <section className={s.sec} id="saudi">
      <h2>{t.saudiTitle}</h2>
      <p className={s.sub}>{t.saudiSub}</p>
      <div className={s.reqs}>
      {extras.saudi.map((r) => {
        const st = supportLabel(r.status, lang);
        return (
          <div key={r.slug} className={s.req}>
            <div className={s.reqtop}>
              <span className={s.reqname}>{lang === 'ar' ? r.name_ar : r.name_en}</span>
              <span className={st.tone === 'solid' ? s.status : `${s.status} ${s.soft}`}>{st.text}</span>
            </div>
            {/* the notes (with their sources) exist in Arabic only, so they are shown on the Arabic page only */}
            {lang === 'ar' && r.notes_ar && <p className={s.reqnote}>{r.notes_ar}</p>}
          </div>
        );
      })}
      </div>
      <p className={s.note}>{t.saudiNote}</p>
    </section>
  );
}

export function FeatureGroups({ lang, extras }: { lang: Lang; extras: ProfileExtras }) {
  const t = TXT[lang];
  if (!extras.features.length) return null;
  const groups = groupFeatures(extras.features);
  return (
    <section className={s.sec} id="features">
      <h2>{t.featuresTitle}</h2>
      <p className={s.sub}>{t.featuresSub}</p>
      {/* one big box; each category is a row with a + that opens its features (plain <details>, no JS needed) */}
      <div className={s.groups}>
        {groups.map((g) => (
          <details key={g.category ?? '_'} className={s.group}>
            <summary className={s.gh}>
              <span>{categoryLabel(g.category, lang)}</span>
              <span className={s.ghEnd}>
                <span className={s.count}>{g.items.length}</span>
                <span className={s.plus} aria-hidden>+</span>
              </span>
            </summary>
            <div className={s.gbody}>
              {g.items.map((f, i) => (
                <div key={i} className={s.item}>
                  <span className={s.tick} aria-hidden>✓</span>
                  <span>{lang === 'ar' ? f.feature_ar || f.feature_en : f.feature_en || f.feature_ar}</span>
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function PricingTable({ lang, extras }: { lang: Lang; extras: ProfileExtras }) {
  const t = TXT[lang];
  if (!extras.plans.length) return null;
  const date = extras.updatedAt ? new Date(extras.updatedAt).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  return (
    <section className={s.sec} id="pricing">
      <h2>{t.pricingTitle}</h2>
      <div className={s.plans} style={{ marginTop: 14 }}>
        {extras.plans.map((p, i) => {
          const cycle = p.billing_cycle === 'monthly' ? t.perMonth : p.billing_cycle === 'yearly' ? t.perYear : '';
          return (
            <div key={i} className={p.is_popular ? `${s.plan} ${s.pop}` : s.plan}>
              <div>
                <div className={s.pname}>{(lang === 'ar' ? p.plan_name_ar || p.plan_name_en : p.plan_name_en) || ''}</div>
                {p.is_popular && <span className={s.badge}>{t.popular}</span>}
              </div>
              {/* the plan descriptions exist in Arabic only, so they are shown on the Arabic page only */}
              <div className={s.pdesc}>{lang === 'ar' ? p.description_ar : ''}</div>
              <div className={s.price}>
                {p.price_amount === null ? <strong>{t.onRequest}</strong>
                  : p.price_amount === 0 ? <strong>{t.free}</strong>
                  : <><b>{money(p.price_amount)}</b> <span>{p.currency}{cycle && ` / ${cycle}`}</span></>}
              </div>
            </div>
          );
        })}
      </div>
      <p className={s.note}>{t.pricingNote.replace('{date}', date)}</p>
    </section>
  );
}

export function Alternatives({ lang, extras }: { lang: Lang; extras: ProfileExtras }) {
  const t = TXT[lang];
  if (!extras.alternatives.length) return null;
  return (
    <section className={s.sec} id="alternatives">
      <h2>{t.altTitle}</h2>
      <div className={s.alts} style={{ marginTop: 14 }}>
        {extras.alternatives.map((a) => (
          <Link key={a.slug} href={`/product/${a.slug}`} className={s.alt}>
            <div className={s.alttop}>
              <EntityImage url={a.image_url} name={a.name} size={40} />
              <div><div className={s.altname}>{a.name}</div>{a.category && <div className={s.altcat}>{a.category}</div>}</div>
            </div>
            {/* the reasons exist in Arabic only, so they are shown on the Arabic page only */}
            {lang === 'ar' && a.reason_ar && <p className={s.altwhy}>{a.reason_ar}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
export function Industries({ lang, extras }: { lang: Lang; extras: ProfileExtras }) {
  const t = TXT[lang];
  if (!extras.industries.length) return null;
  return (
    <section className={s.sec} id="industries">
      <h2>{t.indTitle}</h2>
      <p className={s.sub}>{t.indSub}</p>
      <div className={s.inds}>
        {sortIndustries(extras.industries).map((i) => (
          <div key={i.slug} className={s.ind}>
            <span className={s.indname}>{lang === 'ar' ? i.name_ar : i.name_en}</span>
            <span className={s.track} role="img" aria-label={`${t.fit} ${i.fit}%`}><span className={s.fill} style={{ width: `${Math.max(0, Math.min(100, i.fit))}%` }} /></span>
            <span className={s.score}>{i.fit}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Integrations({ lang, extras }: { lang: Lang; extras: ProfileExtras }) {
  const t = TXT[lang];
  if (!extras.integrations.length) return null;
  const groups = groupIntegrations(extras.integrations);
  return (
    <section className={s.sec} id="integrations">
      <h2>{t.intTitle}</h2>
      <p className={s.sub}>{t.intSub}</p>
      {/* same one-box, two-column, + dropdown look as the Features section */}
      <div className={s.groups}>
        {groups.map((g) => (
          <details key={g.category} className={s.group}>
            <summary className={s.gh}>
              <span>{integrationCategoryLabel(g.category, lang)}</span>
              <span className={s.ghEnd}>
                <span className={s.count}>{g.items.length}</span>
                <span className={s.plus} aria-hidden>+</span>
              </span>
            </summary>
            <div className={s.gbody}>
              {g.items.map((it) => (
                <div key={it.slug} className={s.intItem}>
                  <div className={s.intTop}>
                    {/* Link to /tech-stack#<slug> switched off for now (not clickable). To switch it on again: <Link href={`/tech-stack#${it.slug}`} className={s.intLink}>{it.name}</Link> */}
                    <span>{it.name}</span>
                    {it.is_native && <span className={s.tag}>{t.native}</span>}
                    {it.is_government && <span className={`${s.tag} ${s.gov}`}>{t.gov}</span>}
                  </div>
                  {/* the notes (plan limits and their sources) exist in Arabic only, so they are shown on the Arabic page only */}
                  {lang === 'ar' && it.notes_ar && <div className={s.intNote}>{it.notes_ar}</div>}
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
      <p className={s.note}>{t.intNote} <Link href="/tech-stack" className={s.intLink}>{t.allSystems}</Link></p>
    </section>
  );
}