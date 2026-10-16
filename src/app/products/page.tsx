import Link from 'next/link';
import EntityImage from '@/components/EntityImage';
import Footer from '@/components/Footer';
import PublicHeader from '@/components/PublicHeader';
import TrustBar from '@/components/TrustBar';
import { getCurrentUser } from '@/lib/auth/current-user';
import { catName, listCategories, listSoftware, swName } from '@/lib/data';
import { getLang } from '@/lib/i18n';
import { publishedCountsBySoftware } from '@/lib/stats';

export const dynamic = 'force-dynamic';

/** Public directory (no login): every live category and its products, each linking to its product page. */
export default async function ProductsPage() {
  const lang = await getLang();
  const user = await getCurrentUser();
  const ar = lang === 'ar';
  const [cats, counts] = await Promise.all([listCategories(), publishedCountsBySoftware()]);
  const groups = await Promise.all(cats.map(async (c) => ({ c, items: await listSoftware(c.id) })));
  return (
    <>
      <PublicHeader lang={lang} current="/products" loggedIn={!!user} t={ar ? { login: 'تسجيل الدخول', reviewIt: 'قيّم برنامجًا' } : { login: 'Log in', reviewIt: 'Review software' }} />
      <TrustBar lang={lang} />
      <main className="prod">
        <h1 className="title">{ar ? 'المنتجات' : 'Products'}</h1>
        <p className="muted">{ar ? 'اختر منتجًا لقراءة تقييمات المستخدمين والخبراء.' : 'Pick a product to read user and expert reviews.'}</p>
        {groups.filter((g) => g.items.length).map(({ c, items }) => (
          <section key={c.id} className="blk">
            <h2>{catName(c, lang)}</h2>
            <div className="tiles">
              {items.map((s) => (
                <Link key={s.id} href={`/product/${s.slug}`} className="tile" title={swName(s)}>
                  <EntityImage url={s.image_url} name={swName(s)} size={48} />
                  <span className="tile-name">{swName(s)}</span>
                  <span className="muted small fig">{counts.get(s.id) ?? 0} {ar ? 'تقييمات' : 'reviews'}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
        {groups.every((g) => !g.items.length) && <p className="muted">{ar ? 'لا توجد منتجات بعد.' : 'No products yet.'}</p>}
      </main>
      <Footer lang={lang} />
    </>
  );
}
