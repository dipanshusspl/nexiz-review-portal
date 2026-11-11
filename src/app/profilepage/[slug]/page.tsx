// Added by Prachi, 2026-11-10: the profile page of a product (/profilepage/<slug>), laid out as in the approved design:
// dark side menu, header card with figures, then Saudi compliance, features, integrations, industries, pricing and alternatives.
// Changed by Prachi, 2026-11-11: integrations and industries added.
// It holds what the vendor documents, copied from the main Nexiz database. Reviewer data stays on the product page (/product/<slug>).
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setLanguage } from '@/app/actions/auth';
import EntityImage from '@/components/EntityImage';
import Footer from '@/components/Footer';
import { getLang } from '@/lib/i18n';
import { loadProfileExtras } from '@/lib/profile-extras';
import { entryPrice } from '@/lib/profile-labels';
import { trustFigures } from '@/lib/stats';
import { db } from '@/lib/supabase/admin';
import { Alternatives, FeatureGroups, Industries, Integrations, PricingTable, SaudiSupport, money } from './ProfileBlocks';
import s from './profile.module.css';

export const dynamic = 'force-dynamic';

const TXT = {
  en: { overview: 'Overview', saudi: 'Saudi compliance', features: 'Features', integrations: 'Integrations', industries: 'Industries', pricing: 'Pricing', alternatives: 'Alternatives', software: 'Software', profile: 'Profile',
    review: 'Review software', reviews: 'Reviews & ratings', featuresStat: 'features', integrationsStat: 'integrations', entry: '{c} entry price', products: 'products covered', verified: 'verified reviews',
    indep: 'Independent of every vendor listed. No paid placement.', empty: 'There are no profile details for this product yet.' },
  ar: { overview: 'نظرة عامة', saudi: 'الامتثال السعودي', features: 'المزايا', integrations: 'التكاملات', industries: 'القطاعات', pricing: 'الأسعار', alternatives: 'البدائل', software: 'البرمجيات', profile: 'الملف التعريفي',
    review: 'قيّم البرنامج', reviews: 'التقييمات والمراجعات', featuresStat: 'ميزة', integrationsStat: 'تكاملًا', entry: 'سعر البداية ({c})', products: 'منتجًا', verified: 'تقييمًا موثّقًا',
    indep: 'مستقلة عن كل مورّد مذكور. لا مواضع مدفوعة.', empty: 'لا توجد تفاصيل في الملف التعريفي لهذا المنتج بعد.' },
} as const;

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLang();
  const x = TXT[lang];

  const { data: sw } = await db().from('rv_software').select('*').eq('slug', slug).maybeSingle();
  if (!sw) notFound();
  const { data: cat } = sw.category_id
    ? await db().from('rv_categories').select('slug,name_en,name_ar').eq('id', sw.category_id).maybeSingle()
    : { data: null };
  const catName = cat ? (lang === 'ar' ? cat.name_ar || cat.name_en : cat.name_en) : '';
  const name = (sw.display_name || sw.name) as string;
  const extras = await loadProfileExtras(sw.id as string, lang);
  const fig = await trustFigures();
  const entry = entryPrice(extras.plans);
  const any = extras.plans.length + extras.features.length + extras.alternatives.length + extras.saudi.length + extras.industries.length + extras.integrations.length > 0;

  const nav = [
    { id: 'saudi', label: x.saudi, n: extras.saudi.length },
    { id: 'features', label: x.features, n: extras.features.length },
    { id: 'integrations', label: x.integrations, n: extras.integrations.length },
    { id: 'industries', label: x.industries, n: extras.industries.length },
    { id: 'pricing', label: x.pricing, n: extras.plans.length },
    { id: 'alternatives', label: x.alternatives, n: extras.alternatives.length },
  ].filter((i) => i.n > 0);

  return (
    <div className={s.shell}>
      <aside className={s.side}>
        <Link href="/review" className={s.brand}><span className={s.logo}>N</span>Nexiz AI</Link>
        <nav className={s.nav}>
          <a href="#top" className={s.on}>{x.overview}</a>
          {nav.map((i) => <a key={i.id} href={`#${i.id}`}><span>{i.label}</span><span className={s.n}>{i.n}</span></a>)}
        </nav>
        <div className={s.figs}>
          <div><b>{fig.products}</b>{x.products}</div>
          <div><b>{fig.verified}</b>{x.verified}</div>
          <p>{x.indep}</p>
        </div>
      </aside>

      <main className={s.main} id="top">
        <div className={s.top}>
          <div className={s.crumbs}>
            <Link href="/review">{x.software}</Link>
            {cat && <> / <Link href={`/review?category=${cat.slug}`}>{catName}</Link></>} / <b>{name}</b>
          </div>
          <div className={s.tools}>
            <form action={setLanguage} className={s.langs}>
              <input type="hidden" name="to" value={`/profilepage/${slug}`} />
              <button name="lang" value="en" className={lang === 'en' ? s.on : ''}>EN</button>
              <button name="lang" value="ar" className={lang === 'ar' ? s.on : ''}>العربية</button>
            </form>
            <Link href={`/review?${cat ? `category=${cat.slug}&` : ''}software=${slug}`} className={s.btn}>{x.review}</Link>
          </div>
        </div>

        <div className={s.head}>
          <EntityImage url={sw.image_url} name={name} size={64} />
          <div className={s.who}>
            <h1>{name}</h1>
            <div>{[catName, x.profile].filter(Boolean).join(' · ')}</div>
          </div>
          {extras.features.length > 0 && <div className={s.stat}><b>{extras.features.length}</b><span>{x.featuresStat}</span></div>}
          {extras.integrations.length > 0 && <div className={s.stat}><b>{extras.integrations.length}</b><span>{x.integrationsStat}</span></div>}
          {entry && <div className={s.stat}><b>{money(entry.amount)}</b><span>{x.entry.replace('{c}', entry.currency)}</span></div>}
          <Link href={`/product/${slug}`} className={s.btnGhost}>{x.reviews}</Link>
        </div>

        {any ? (
          <>
            <SaudiSupport lang={lang} extras={extras} />
            <FeatureGroups lang={lang} extras={extras} />
            <Integrations lang={lang} extras={extras} />
            <Industries lang={lang} extras={extras} />
            <PricingTable lang={lang} extras={extras} />
            <Alternatives lang={lang} extras={extras} />
          </>
        ) : (
          <div className={s.empty}>{x.empty}</div>
        )}
        <Footer lang={lang} />
      </main>
    </div>
  );
}