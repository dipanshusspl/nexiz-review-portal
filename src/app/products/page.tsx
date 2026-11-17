import Link from 'next/link';
import EntityImage from '@/components/EntityImage';
import Footer from '@/components/Footer';
import PublicHeader from '@/components/PublicHeader';
import TrustBar from '@/components/TrustBar';
import { getCurrentUser } from '@/lib/auth/current-user';
import { catName, listCategories, listSoftware, swName } from '@/lib/data';
import { getLang } from '@/lib/i18n';
import { SearchIcon } from '@/components/Icons';
import { publishedCountsBySoftware } from '@/lib/stats';

export const dynamic = 'force-dynamic';

/** Public directory (no login): every live category and its products, each linking to its product page. */
// Changed by Prachi, 2026-11-13: the tiles open the product's profile page (/profilepage/<slug>), and ?q= filters the list by name
// (the search box on the profile page sends its text here).
export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: rawQ } = await searchParams;
  const q = (rawQ ?? '').trim();
  const needle = q.toLowerCase();
  const lang = await getLang();
  const user = await getCurrentUser();
  const ar = lang === 'ar';
  const [cats, counts] = await Promise.all([listCategories(), publishedCountsBySoftware()]);
  const groups = await Promise.all(cats.map(async (c) => ({ c, items: (await listSoftware(c.id)).filter((s) => !needle || [swName(s), s.name].some((v) => String(v ?? '').toLowerCase().includes(needle))) })));
  return (
    <>
      <PublicHeader lang={lang} current="/products" loggedIn={!!user} t={ar ? { login: 'تسجيل الدخول', reviewIt: 'قيّم برنامجًا' } : { login: 'Log in', reviewIt: 'Review software' }} />
      <TrustBar lang={lang} />
      <main className="prod">
        <h1 className="title">{ar ? 'المنتجات' : 'Products'}</h1>
        <p className="muted">{ar ? 'اختر منتجًا لعرض ملفه التعريفي ومزاياه وأسعاره وتقييماته.' : 'Pick a product to see its profile, features, pricing and reviews.'}</p>
        <form action="/products" method="get" role="search" className="search">
          <SearchIcon className="search-ico" />
          <input name="q" defaultValue={q} placeholder={ar ? 'ابحث عن البرامج...' : 'Search products...'} aria-label={ar ? 'ابحث عن البرامج' : 'Search products'} />
        </form>
        {q && <p className="muted small">{ar ? `نتائج البحث عن «${q}»` : `Results for “${q}”`} · <Link href="/products" className="small">{ar ? 'عرض الكل' : 'Show all'}</Link></p>}
        {groups.filter((g) => g.items.length).map(({ c, items }) => (
          <section key={c.id} className="blk">
            <h2>{catName(c, lang)}</h2>
            <div className="tiles">
              {items.map((s) => (
                <Link key={s.id} href={`/profilepage/${s.slug}`} className="tile" title={swName(s)}>
                  <EntityImage url={s.image_url} name={swName(s)} size={48} />
                  <span className="tile-name">{swName(s)}</span>
                  <span className="muted small fig">{counts.get(s.id) ?? 0} {ar ? 'تقييمات' : 'reviews'}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
        {groups.every((g) => !g.items.length) && <p className="muted">{q ? (ar ? 'لا توجد منتجات مطابقة.' : 'No products match your search.') : (ar ? 'لا توجد منتجات بعد.' : 'No products yet.')}</p>}
      </main>
      <Footer lang={lang} />
    </>
  );
}