// Changed by Prachi, 2026-11-13: top bar has About Us and a search box, the side panel shows Languages and a Vendor row ("Soon" while empty).
// Rewritten by Prachi, 2026-11-13: the profile page of a product (/profilepage/<slug>) now follows the approved mockup
// (top bar, header with figures and the business-fit card, tab bar, Overview card, rows that open, and a side panel).
// Earlier version (side menu layout, 2026-11-10 and 2026-11-11) is kept in the backup folder.
// It holds what the vendor documents, copied from the main Nexiz database. Reviewer data stays on the product page (/product/<slug>);
// here only the counts and scores are shown.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { setLanguage } from '@/app/actions/auth';
import EntityImage from '@/components/EntityImage';
import Footer from '@/components/Footer';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getLang } from '@/lib/i18n';
import { loadProduct } from '@/lib/product';
import { loadProfileExtras } from '@/lib/profile-extras';
import { compareHref } from '@/lib/compare-pure';
import { entryPrice } from '@/lib/profile-labels';
import { db } from '@/lib/supabase/admin';
import BackButton from './BackButton';
import { AlternativesRow, FeaturesRow, IndustriesRow, IntegrationsRow, OverviewCard, PricingRow, ReviewsRow, SaudiRow, TXT as B, glanceCodes, money } from './ProfileBlocks';
import { FitIllustration, Ic } from './ProfileIcons';
import ProfileTabs, { type Tab } from './ProfileTabs';
import s from './profile.module.css';
import VendorMenu from '@/components/VendorMenu';
import DemoButton from '@/components/DemoButton';
export const dynamic = 'force-dynamic';

// These three buttons are in the design but the pages behind them are not built yet. While a value is null the button is shown greyed out
// with "Soon". Put a path here (for example '/compare') and it becomes a normal link.
const ASSESSMENT_HREF: string | null = null;
const SHORTLIST_HREF: string | null = null;

const TXT = {
  en: { products: 'Products', about: 'About Us', solutions: 'Solutions', resources: 'Resources', searchPh: 'Search products...', vendor: 'Vendor', langDefault: 'Arabic, English', aiTitle: 'AI Summary', software: 'Software', login: 'Sign in', account: 'Account', ratingNone: 'No rating yet', noReviews: 'No reviews yet', reviewsWord: 'reviews', reviewWord: 'review', integrationsStat: 'Integrations', featuresStat: 'Features', fromLabel: 'From',
    fitChip: 'Check if it’s the right fit for your business', fitTitle: 'Check Business Fit', fitSub: 'Get a personalized assessment in minutes', fitCta: 'Start Assessment', soon: 'Soon',
    glance: 'Product at a Glance', category: 'Category', deployment: 'Deployment', languages: 'Languages', pricing: 'Pricing', saudi: 'Saudi Compliance', links: 'Official Links', visit: 'Visit Vendor Website',
    compareTitle: 'Compare & Review', compareText: 'Compare {n} with alternatives or share your experience.', compare: 'Compare Software', demo: 'Request a Demo', write: 'Write a Review', shortlist: 'Save to Shortlist', perMonth: 'month', perYear: 'year' },
  ar: { products: 'المنتجات', about: 'من نحن', solutions: 'الحلول', resources: 'المصادر', searchPh: 'ابحث عن البرامج...', vendor: 'المورّد', langDefault: 'العربية، الإنجليزية', aiTitle: 'ملخص بالذكاء الاصطناعي', software: 'البرمجيات', login: 'تسجيل الدخول', account: 'الحساب', ratingNone: 'لا يوجد تقييم بعد', noReviews: 'لا توجد تقييمات بعد', reviewsWord: 'تقييم', reviewWord: 'تقييم', integrationsStat: 'تكامل', featuresStat: 'ميزة', fromLabel: 'ابتداءً من',
    fitChip: 'تحقق من مدى ملاءمته لشركتك', fitTitle: 'تحقق من ملاءمة البرنامج', fitSub: 'احصل على تقييم مخصص خلال دقائق', fitCta: 'ابدأ التقييم', soon: 'قريبًا',
    glance: 'نظرة سريعة على المنتج', category: 'الفئة', deployment: 'النشر', languages: 'اللغات', pricing: 'الأسعار', saudi: 'الامتثال السعودي', links: 'الروابط الرسمية', visit: 'زيارة موقع المورّد',
    compareTitle: 'قارن وقيّم', compareText: 'قارن {n} بالبدائل أو شارك تجربتك.', compare: 'مقارنة البرامج', demo: 'طلب عرض توضيحي', write: 'اكتب تقييمًا', shortlist: 'حفظ في القائمة المختصرة', perMonth: 'شهريًا', perYear: 'سنويًا' },
} as const;

/** A link when the page behind it exists, otherwise a greyed-out button with "Soon". */
function SoonLink({ href, className, soon, children }: { href: string | null; className: string; soon: string; children: React.ReactNode }) {
  if (href) return <Link href={href} className={className}>{children}</Link>;
  return <span className={`${className} ${s.off}`} aria-disabled="true">{children}<small className={s.soon}>{soon}</small></span>;
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLang();
  const x = TXT[lang];
  const b = B[lang];

  const { data: sw } = await db().from('rv_software').select('*').eq('slug', slug).maybeSingle();
  if (!sw) notFound();
  const { data: cat } = sw.category_id
    ? await db().from('rv_categories').select('slug,name_en,name_ar').eq('id', sw.category_id).maybeSingle()
    : { data: null };
  const catName = cat ? (lang === 'ar' ? cat.name_ar || cat.name_en : cat.name_en) : '';
  const name = (sw.display_name || sw.name) as string;
  const [extras, user, prod] = await Promise.all([
    loadProfileExtras(sw.id as string, lang),
    getCurrentUser().catch(() => null),
    loadProduct(slug, {}, lang).catch(() => null),
  ]);

  const entry = entryPrice(extras.plans);
  const cycleWord = entry ? (entry.cycle === 'monthly' ? x.perMonth : x.perYear) : '';
  // the amount and currency are wrapped in invisible direction marks (\u2066 \u2069) so that "69 SAR" keeps its order on the Arabic page
  const entryText = entry ? `${x.fromLabel} \u2066${money(entry.amount)} ${entry.currency}\u2069 / ${cycleWord}` : null;
  // Prachi 2026-11-14: Arabic page uses description_ar / ai_summary_ar when they exist, else the English text
  const pick = (en: unknown, ar: unknown) => ((lang === 'ar' && typeof ar === 'string' && ar.trim() ? ar : (en as string | null)) ?? '').trim() || null;
  const aiSummary = pick((sw as Record<string, unknown>).ai_summary, (sw as Record<string, unknown>).ai_summary_ar);   // Added by Prachi, 2026-11-14: rv_software.ai_summary was never shown on the page
  const description = pick(sw.description, (sw as Record<string, unknown>).description_ar);
  const website = ((sw.website as string | null) ?? '').trim() || null;
  // Added by Prachi, 2026-11-14: deployment / languages are text[] columns in rv_software. Join them with a separator (was shown as "EnglishArabic").
  const AR_WORDS: Record<string, string> = { arabic: 'العربية', english: 'الإنجليزية', cloud: 'سحابي', 'on-premise': 'محلي', 'on premise': 'محلي', hybrid: 'هجين' };
  const joinList = (v: unknown): string | null => {
    const arr = Array.isArray(v) ? v : typeof v === 'string' && v.trim() ? v.split(/[,،;]/) : [];
    const items = arr.map((i) => String(i).trim()).filter(Boolean).map((i) => (lang === 'ar' ? AR_WORDS[i.toLowerCase()] ?? i : i));
    return items.length ? items.join(lang === 'ar' ? '، ' : ', ') : null;
  };
  const deployment = joinList((sw as Record<string, unknown>).deployment);
  const languages = joinList((sw as Record<string, unknown>).languages) || x.langDefault;   // empty languages show Arabic, English (decision 2026-11-13)
  const vendor = ((sw.vendor_name as string | null) ?? '').trim() || null;                           // empty for every product today: the row shows "Soon" until it is filled
  const codes = glanceCodes(extras, lang);
  const COMPARE_HREF = compareHref([slug]);   // 2026-11-18: opens /compare?p=<this product>; the person adds up to four more there
  const writeHref = `/review?${cat ? `category=${cat.slug}&` : ''}software=${slug}`;

  const total = prod?.total ?? 0;
  const userP = prod?.userP ?? { count: 0, score: null };
  const expertP = prod?.expertP ?? { count: 0, score: null };

  const has = { features: extras.features.length > 0, integrations: extras.integrations.length > 0, pricing: extras.plans.length > 0, saudi: extras.saudi.length > 0, alternatives: extras.alternatives.length > 0 };
  const tabs: Tab[] = [
    { id: 'overview', label: b.overview, icon: 'home' },
    ...(has.features ? [{ id: 'features', label: lang === 'ar' ? 'الميزات' : 'Features', icon: 'list' as const }] : []),
    ...(has.integrations ? [{ id: 'integrations', label: b.integrations, icon: 'plug' as const, n: extras.integrations.length }] : []),
    ...(has.pricing ? [{ id: 'pricing', label: b.pricing, icon: 'tag' as const }] : []),
    ...(has.saudi ? [{ id: 'saudi', label: lang === 'ar' ? 'الامتثال' : 'Compliance', icon: 'shield' as const }] : []),
    ...(has.alternatives ? [{ id: 'alternatives', label: b.alternatives, icon: 'swap' as const }] : []),
    { id: 'reviews', label: b.reviews, icon: 'star' as const },
  ];

  return (
    <div className={s.page}>
      <header className={s.topbar}>
        <Link href="/review" className={s.brand}><span className={s.logo}>N</span>Nexiz AI</Link>
        <nav className={s.topnav}>
          <Link href="/products">{x.products}</Link>
          <span className={s.navOff} aria-disabled="true">{x.solutions}<small className={s.soonPlain}>{x.soon}</small></span>
          <span className={s.navOff} aria-disabled="true">{x.resources}<small className={s.soonPlain}>{x.soon}</small></span>
          <span className={s.navOff} aria-disabled="true">{x.about}<small className={s.soonPlain}>{x.soon}</small></span>   {/* Prachi 2026-11-14: the /about page is not built yet; swap back to <Link href="/about"> when it is */}
        </nav>
        {/* search goes to /products?q=...  (check that the list page reads q; change the action if the search lives elsewhere) */}
        <form action="/products" method="get" role="search" className={s.search}>
          <Ic name="search" size={16} />
          <input type="search" name="q" placeholder={x.searchPh} aria-label={x.searchPh} />
        </form>
        <div className={s.topEnd}>
          <form action={setLanguage}>
            <input type="hidden" name="to" value={`/profilepage/${slug}`} />
            <button name="lang" value={lang === 'ar' ? 'en' : 'ar'} className={s.langBtn}><Ic name="globe" size={17} />{lang === 'ar' ? 'English' : 'عربي'}</button>
          </form>
          <Link href={user ? '/review' : '/login'} className={s.userBtn} aria-label={user ? x.account : x.login} title={user ? x.account : x.login}><Ic name="user" size={18} /></Link>
        </div>
      </header>

      <div className={s.wrap} id="top">
        <div className={s.crumbRow}>
          <BackButton lang={lang} />
          <div className={s.crumbs}>
            <Link href="/review">{x.software}</Link>
            {cat && <> / <Link href={`/review?category=${cat.slug}`}>{catName}</Link></>} / <b>{name}</b>
          </div>
        </div>

        <section className={s.hero}>
          <div className={s.heroMain}>
            <div className={s.logoTile}><EntityImage url={sw.image_url} name={name} size={84} /></div>
            <div className={s.heroText}>
              <h1 className={s.h1}>{name}</h1>
              {catName && <div className={s.heroCat}>{catName}</div>}
              {(description || aiSummary) && <p className={s.heroDesc}>{description || aiSummary}</p>}   {/* Prachi 2026-11-14: hero shows the short overview; the AI summary sits in the Overview card */}
              <div className={s.stats}>
                <div className={s.stat}>
                  <Ic name="star" size={22} className={s.starIc} />
                  <div>
                    <b className={s.statBig}>{userP.score !== null ? userP.score.toFixed(1) : '—'}</b>
                    <small>{total === 0 ? x.noReviews : userP.score !== null ? `(${total} ${total === 1 ? x.reviewWord : x.reviewsWord})` : x.ratingNone}</small>
                  </div>
                </div>
                {has.integrations && <div className={s.stat}><Ic name="grid" size={20} className={s.statIc} /><div><b className={s.statBig}>{extras.integrations.length}</b><small>{x.integrationsStat}</small></div></div>}
                {has.features && <div className={s.stat}><Ic name="bolt" size={20} className={s.statIc} /><div><b className={s.statBig}>{extras.features.length}</b><small>{x.featuresStat}</small></div></div>}
                {entry && <div className={s.stat}><Ic name="tag" size={20} className={s.statIc} /><div><small>{x.fromLabel}</small><b className={s.statMid}>{'\u2066'}{money(entry.amount)} {entry.currency}{'\u2069'} / {cycleWord}</b></div></div>}
              </div>
            </div>
          </div>

          <aside className={s.fit}>
            <div className={s.fitText}>
              <span className={s.fitChip}><Ic name="spark" size={13} />{x.fitChip}</span>
              <h2 className={s.fitTitle}>{x.fitTitle}</h2>
              <p className={s.fitSub}>{x.fitSub}</p>
              <SoonLink href={ASSESSMENT_HREF} className={s.cta} soon={x.soon}>{x.fitCta}<Ic name="arrow" size={17} className={s.flip} /></SoonLink>
            </div>
            <div className={s.fitArt}><FitIllustration /></div>
          </aside>
        </section>

        <ProfileTabs tabs={tabs} />

        <div className={s.cols}>
          <main className={s.mainCol}>
            <OverviewCard lang={lang} description={aiSummary || description} extras={extras} />
            <FeaturesRow lang={lang} extras={extras} />
            <IntegrationsRow lang={lang} extras={extras} />
            <PricingRow lang={lang} extras={extras} entryText={entryText} />
            <SaudiRow lang={lang} extras={extras} />
            <IndustriesRow lang={lang} extras={extras} />
            <AlternativesRow lang={lang} extras={extras} />
            <ReviewsRow lang={lang} slug={slug} total={total} user={userP} expert={expertP} writeHref={writeHref} />
          </main>
{/* by prachi */}
          <aside className={s.side}>
            <DemoButton slug={slug} lang={lang} />
            <VendorMenu slug={slug} lang={lang} />
            <section className={s.card}>
              <h2 className={s.sideTitle}><span className={s.tile}><Ic name="chart" size={19} /></span>{x.glance}</h2>
              <dl className={s.glance}>
                {catName && <div><dt><Ic name="doc" size={16} />{x.category}</dt><dd>{catName}</dd></div>}
                <div><dt><Ic name="user" size={16} />{x.vendor}</dt><dd>{vendor ?? <small className={s.soonPlain}>{x.soon}</small>}</dd></div>
                {deployment && <div><dt><Ic name="cloud" size={16} />{x.deployment}</dt><dd>{deployment}</dd></div>}
                {languages && <div><dt><Ic name="globe" size={16} />{x.languages}</dt><dd>{languages}</dd></div>}
                {entryText && <div><dt><Ic name="tag" size={16} />{x.pricing}</dt><dd>{entryText}</dd></div>}
                {codes && <div><dt><Ic name="shield" size={16} />{x.saudi}</dt><dd>{codes}</dd></div>}
              </dl>
              {website && (
                <>
                  <h3 className={s.linksTitle}>{x.links}</h3>
                  <a href={website} target="_blank" rel="noopener noreferrer" className={s.btnLineFull}>{x.visit}<Ic name="arrow" size={15} className={s.flip} /></a>
                </>
              )}
            </section>

            <section className={s.card}>
              <h2 className={s.sideTitle}><span className={s.tile}><Ic name="scale" size={19} /></span>{x.compareTitle}</h2>
              <p className={s.sideText}>{x.compareText.replace('{n}', name)}</p>
              <div className={s.sideBtns}>
                <SoonLink href={COMPARE_HREF} className={s.btnLineFull} soon={x.soon}><Ic name="swap" size={15} />{x.compare}</SoonLink>
                <Link href={writeHref} className={s.btnLineFull}><Ic name="star" size={15} />{x.write}</Link>
                <SoonLink href={SHORTLIST_HREF} className={s.btnLineFull} soon={x.soon}>{x.shortlist}</SoonLink>
              </div>
            </section>
          </aside>
        </div>
        <Footer lang={lang} />
      </div>
    </div>
  );
}