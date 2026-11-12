// Added by Prachi, 2026-11-11: /tech-stack lists every system (government, payments, e-commerce, HR and so on) with the products
// that connect to it. The links come from the vendors' own materials (copied from the main Nexiz database). Reviewers have not confirmed them.
import Link from 'next/link';
import { setLanguage } from '@/app/actions/auth';
import EntityImage from '@/components/EntityImage';
import Footer from '@/components/Footer';
import { getLang } from '@/lib/i18n';
import { integrationCategoryLabel } from '@/lib/profile-labels';
import { loadTechDirectory } from '@/lib/tech-directory';
import s from './tech-stack.module.css';

export const dynamic = 'force-dynamic';

const TXT = {
  en: { title: 'Tech stack and integrations', sub: 'Systems that software on Nexiz connects to, and which products list each one. Taken from the vendors’ own materials. Reviewers have not confirmed them.',
    figs: '{used} of {total} systems have products listed.', none: 'No product lists this system yet.', native: 'Native', gov: 'Government', back: 'Software', products: 'products',
    empty: 'There are no systems yet.', note: 'Availability can depend on the plan. Verify with the vendor before purchase.' },
  ar: { title: 'التقنيات والتكاملات', sub: 'الأنظمة التي ترتبط بها البرمجيات على Nexiz، والمنتجات التي تذكر كل نظام. مأخوذة من مواد المورّدين أنفسهم، ولم يؤكدها المراجعون.',
    figs: '{used} من {total} نظامًا لها منتجات مدرجة.', none: 'لا يذكر أي منتج هذا النظام بعد.', native: 'مدمج', gov: 'حكومي', back: 'البرمجيات', products: 'منتجات',
    empty: 'لا توجد أنظمة بعد.', note: 'قد يعتمد توفرها على الباقة. تحقق من المورّد قبل الشراء.' },
} as const;

export default async function TechStackPage() {
  const lang = await getLang();
  const x = TXT[lang];
  const dir = await loadTechDirectory(lang);

  return (
    <div className={s.page}>
      <div className={s.wrap}>
        <div className={s.top}>
          <div className={s.crumbs}><Link href="/review">{x.back}</Link> / <b>{x.title}</b></div>
          <form action={setLanguage} className={s.langs}>
            <input type="hidden" name="to" value="/tech-stack" />
            <button name="lang" value="en" className={lang === 'en' ? s.on : ''}>EN</button>
            <button name="lang" value="ar" className={lang === 'ar' ? s.on : ''}>العربية</button>
          </form>
        </div>

        <h1 className={s.h1}>{x.title}</h1>
        <p className={s.sub}>{x.sub}</p>
        {dir.total > 0 && <p className={s.figs}>{x.figs.replace('{used}', String(dir.used)).replace('{total}', String(dir.total))}</p>}

        {dir.groups.length === 0 ? <div className={s.empty}>{x.empty}</div> : (
          <>
            <nav className={s.cats} aria-label={x.title}>
              {dir.groups.map((g) => <a key={g.category} href={`#cat-${g.category}`}>{integrationCategoryLabel(g.category, lang)}<span>{g.systems.length}</span></a>)}
            </nav>
            {dir.groups.map((g) => (
              <section key={g.category} id={`cat-${g.category}`} className={s.cat}>
                <h2>{integrationCategoryLabel(g.category, lang)} <span className={s.count}>{g.systems.length}</span></h2>
                <div className={s.grid}>
                  {g.systems.map((sys) => (
                    <div key={sys.slug} id={sys.slug} className={sys.products.length ? s.card : `${s.card} ${s.idle}`}>
                      <div className={s.cardTop}>
                        <b>{sys.name}</b>
                        {sys.is_government && <span className={`${s.tag} ${s.gov}`}>{x.gov}</span>}
                        {sys.products.length > 0 && <span className={s.num}>{sys.products.length} {x.products}</span>}
                      </div>
                      {sys.products.length === 0 ? <p className={s.none}>{x.none}</p> : (
                        <ul className={s.prods}>
                          {sys.products.map((p) => (
                            <li key={p.slug}>
                              <Link href={`/profilepage/${p.slug}`}><EntityImage url={p.image_url} name={p.name} size={24} /><span>{p.name}</span></Link>
                              {p.is_native && <span className={s.tag}>{x.native}</span>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
            <p className={s.note}>{x.note}</p>
          </>
        )}
        <Footer lang={lang} />
      </div>
    </div>
  );
}