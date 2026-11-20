// Added by Claude, 2026-11-18: /compare?p=slug1,slug2,... , the Compare Software page (up to five products side by side).
// Opens without login (the path is added to the middleware matcher). The top bar is the same as on the profile page.
import Link from 'next/link';
import { setLanguage } from '@/app/actions/auth';
import Footer from '@/components/Footer';
import NavMore from '@/components/NavMore';
import SearchSuggest from '@/components/SearchSuggest';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getLang } from '@/lib/i18n';
import { loadCatalog, loadCompare } from '@/lib/compare';
import { compareHref, parseSlugs } from '@/lib/compare-pure';
import { Ic } from '@/app/profilepage/[slug]/ProfileIcons';
import p from '@/app/profilepage/[slug]/profile.module.css';
import CompareClient from './CompareClient';
export const dynamic = 'force-dynamic';

const TXT = {
  en: { products: 'Products', about: 'About Us', solutions: 'Solutions', resources: 'Resources', soon: 'Soon', searchPh: 'Search products...', login: 'Sign in', account: 'Account', software: 'Software', compare: 'Compare Software' },
  ar: { products: 'المنتجات', about: 'من نحن', solutions: 'الحلول', resources: 'المصادر', soon: 'قريبًا', searchPh: 'ابحث عن البرامج...', login: 'تسجيل الدخول', account: 'الحساب', software: 'البرمجيات', compare: 'مقارنة البرامج' },
} as const;

export async function generateMetadata() {
  const lang = await getLang();
  return { title: `${TXT[lang].compare} - Nexiz AI` };
}

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ p?: string | string[] }> }) {
  const sp = await searchParams;
  const lang = await getLang();
  const x = TXT[lang];
  const slugs = parseSlugs(sp.p);
  const [data, catalog, user] = await Promise.all([
    loadCompare(slugs, lang).catch((e) => { console.error('compare failed:', e instanceof Error ? e.message : e); return { products: [], missing: slugs }; }),
    loadCatalog(lang).catch(() => []),
    getCurrentUser().catch(() => null),
  ]);

  return (
    <div className={p.page}>
      <header className={`${p.topbar} mp-topbar`}>
        <Link href="/review" className={`${p.brand} mp-brand`}><span className={p.logo}>N</span>Nexiz AI</Link>
        <nav className={`${p.topnav} mp-topnav`}>
          <Link href="/products">{x.products}</Link>
          <span className={p.navOff} aria-disabled="true">{x.solutions}<small className={p.soonPlain}>{x.soon}</small></span>
          <span className={p.navOff} aria-disabled="true">{x.resources}<small className={p.soonPlain}>{x.soon}</small></span>
          <span className={p.navOff} aria-disabled="true">{x.about}<small className={p.soonPlain}>{x.soon}</small></span>
        </nav>
        <SearchSuggest items={catalog} lang={lang} placeholder={x.searchPh} className={`${p.search} mp-search`}>
          <Ic name="search" size={16} />
        </SearchSuggest>
        <div className={`${p.topEnd} mp-topEnd`}>
          <form action={setLanguage}>
            <input type="hidden" name="to" value={compareHref(data.products.map((q) => q.slug))} />
            <button name="lang" value={lang === 'ar' ? 'en' : 'ar'} className={p.langBtn}><Ic name="globe" size={17} />{lang === 'ar' ? 'English' : 'عربي'}</button>
          </form>
          <Link href={user ? '/review' : '/login'} className={p.userBtn} aria-label={user ? x.account : x.login} title={user ? x.account : x.login}><Ic name="user" size={18} /></Link>
          <NavMore products={x.products} solutions={x.solutions} resources={x.resources} about={x.about} soon={x.soon} label={lang === 'ar' ? 'القائمة' : 'Menu'} />
        </div>
      </header>

      <div className={p.wrap}>
        <div className={p.crumbRow}>
          <div className={p.crumbs}><Link href="/review">{x.software}</Link> / <b>{x.compare}</b></div>
        </div>
        <CompareClient lang={lang} products={data.products} catalog={catalog} missing={data.missing} />
        <Footer lang={lang} />
      </div>
    </div>
  );
}