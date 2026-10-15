import Link from 'next/link';
import { redirect } from 'next/navigation';
import EntityImage from '@/components/EntityImage';
import Flash from '@/components/Flash';
import Header from '@/components/Header';
import ReviewForm from '@/components/ReviewForm';
import Stepper from '@/components/Stepper';
import TileGrid, { type Tile } from '@/components/TileGrid';
// import { requireUser } from '@/lib/auth/current-user';
import { ZATCA_CATEGORY_SLUGS, catName, categoryScopeIds, getCategoryBySlug, getSoftwareBySlug, listCategories, listSoftware, listUserReviews, swName } from '@/lib/data';
import { submitCategoryRequest } from '@/app/actions/review';
import { COMPANY_SIZES, DURATIONS, ROLES, ZATCA, getDict, getLang } from '@/lib/i18n';
import { headers } from 'next/headers';
import { isExpertPanelUser, requireUser } from '@/lib/auth/current-user';

const hueOf = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
const stars = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default async function ReviewPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  if (isExpertPanelUser(user)) redirect('/expert');
  const lang = await getLang();
  const t = getDict(lang);
  const sp = await searchParams;
  const flashMap: Record<string, string> = {
    saved: t.saved, savedField: t.savedField, requested: t.thanksRequest, duplicate: t.e_duplicate, forbidden: t.e_forbidden, invalid: t.e_invalid, notfound: t.e_notfound, failed: t.e_failed,
  };

  const category = sp.category ? await getCategoryBySlug(sp.category) : null;
  const software = category && sp.software ? await getSoftwareBySlug(sp.software) : null;
  // hidden (is_live=false) categories keep their route but are not reachable from the public page
  if (sp.category && (!category || !category.is_live)) redirect('/review?error=notfound');
  if (software && !(await categoryScopeIds(category!.id)).includes(software.category_id)) redirect('/review?error=notfound');
  const step: 1 | 2 | 3 = software ? 3 : category ? 2 : 1;

  const current = `/review${category ? `?category=${category.slug}` : ''}${software ? `&software=${software.slug}` : ''}`;
  const labels: [string, string, string] = [t.step1, t.step2, t.step3];

  return (
    <>
      <Header user={user} lang={lang} t={t} current={current} />
      <main className="page">
        <Stepper step={step} labels={labels} />
        <Flash ok={sp.ok} error={sp.error} map={flashMap} />

        {step === 1 && <Step1 lang={lang} t={t} />}
        {step === 2 && category && <Step2 category={category} lang={lang} t={t} />}
        {step === 3 && category && software && <Step3 user={user} category={category} software={software} lang={lang} t={t} token={sp.token} />}
      </main>
    </>
  );
}

type T = ReturnType<typeof getDict>;

async function Step1({ lang, t }: { lang: 'en' | 'ar'; t: T }) {
  const cats = await listCategories();
  const tiles: Tile[] = cats.map((c) => ({
    id: c.id, href: `/review?category=${c.slug}`, name: catName(c, lang), imageUrl: c.image_url, hue: hueOf(c.name_en),
  }));
  return (
    <section>
      <h2 className="title">{t.s1Title}</h2>
      <p className="muted">{t.s1Sub}</p>
      <TileGrid tiles={tiles} placeholder={t.searchCategories} empty={t.noCategories} />
      <details className="request">
        <summary>{t.cantFind}</summary>
        <form action={submitCategoryRequest} className="row">
          <input name="text" required maxLength={300} placeholder={t.cantFindPh} aria-label={t.cantFindPh} />
          <button className="btn-primary">{t.send}</button>
        </form>
      </details>
    </section>
  );
}

async function Step2({ category, lang, t }: { category: Awaited<ReturnType<typeof getCategoryBySlug>> & {}; lang: 'en' | 'ar'; t: T }) {
  const items = await listSoftware(category.id);
  const tiles: Tile[] = items.map((s) => ({
    id: s.id, href: `/review?category=${category.slug}&software=${s.slug}`, name: swName(s), imageUrl: s.image_url, hue: hueOf(s.name),
  }));
  return (
    <section>
      <Link href="/review" className="backlink">← {t.changeCategory}</Link>
      <div className="cat-head">
        <EntityImage url={category.image_url} name={category.name_en} size={52} />
        <div><h2 className="title">{catName(category, lang)}</h2><p className="muted">{t.s2Sub}</p></div>
      </div>
      <TileGrid tiles={tiles} placeholder={t.searchSoftware} empty={t.noSoftware} />
    </section>
  );
}

async function Step3({ user, category, software, lang, t, token }: {
  user: Awaited<ReturnType<typeof requireUser>>; category: NonNullable<Awaited<ReturnType<typeof getCategoryBySlug>>>;
  software: NonNullable<Awaited<ReturnType<typeof getSoftwareBySlug>>>; lang: 'en' | 'ar'; t: T; token?: string;
}) {
  const siblings = await listSoftware(category.id);
  const reviews = await listUserReviews(user.id, siblings.map((s) => s.id));
  const mine = reviews.find((r) => r.software_id === software.id) ?? null;
  const others = siblings.filter((s) => s.id !== software.id);
  const byId = new Map(reviews.map((r) => [r.software_id, r]));
  const reviewed = others.filter((s) => byId.has(s.id));
  const notYet = others.filter((s) => !byId.has(s.id));
  const link = (slug: string) => `/review?category=${category.slug}&software=${slug}`;
  const MAX_TILES = 6; // A6: cap visible tiles, rest behind "See all"
  const needsZatca = ZATCA_CATEGORY_SLUGS.includes(category.slug);

  // absolute confirmation link for field agents (P7)
  let confirmUrl = '';
  if (token && user.fieldAgent) {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
    const proto = h.get('x-forwarded-proto') ?? 'https';
    confirmUrl = `${proto}://${host}/confirm?token=${encodeURIComponent(token)}`;
  }
  const opt = (list: readonly string[], key: (v: string) => string) => list.map((v) => ({ value: v, label: t[key(v) as keyof T] as string }));

  return (
    <section>
      {/* S2: product name + logo stay pinned while the reviewer scrolls the form */}
      <div className="card sw-card">
        <div className="sw-head sticky-head">
          <EntityImage url={software.image_url} name={swName(software)} size={48} />
          <div><b>{swName(software)}</b><div className="muted small">{catName(category, lang)}</div></div>
          {/* S4: renamed, keeps the chosen category */}
          <Link href={`/review?category=${category.slug}`} className="small change">✎ {t.changeSoftware}</Link>
        </div>
        {confirmUrl && (
          <div className="flash flash-ok">
            <b>{t.confirmLink}</b>
            <div dir="ltr" className="small" style={{ wordBreak: 'break-all' }}>{confirmUrl}</div>
          </div>
        )}
        <ReviewForm
          key={software.id}
          category={category.slug} software={software.slug} softwareName={swName(software)} lang={lang}
          isUpdate={!!mine} needsZatca={needsZatca} fieldAgent={user.fieldAgent} agentName={user.fullName}
          initial={mine ? {
            rating: mine.rating_overall, duration: mine.usage_duration, pros: mine.pros ?? '', cons: mine.cons ?? '',
            recommend: mine.would_recommend == null ? '' : mine.would_recommend ? 'yes' : 'no',
            role: mine.reviewer_role ?? '', size: mine.company_size ?? '', zatca: mine.zatca_status ?? '',
            stillUsing: mine.still_using == null ? '' : mine.still_using ? 'yes' : 'no', movedTo: mine.moved_to_software_id ?? '',
            ease: mine.rating_ease ?? 0, support: mine.rating_support ?? 0, value: mine.rating_value ?? 0, anonymous: mine.anonymous,
          } : null}
          durations={DURATIONS.map((d) => ({ value: d, label: t[`d_${d}` as keyof T] as string }))}
          roles={opt(ROLES, (v) => `r_${v}`)}
          sizes={COMPANY_SIZES.map((v) => ({ value: v, label: v }))}
          zatcaOptions={opt(ZATCA, (v) => `z_${v}`)}
          others={others.map((s) => ({ value: s.id, label: swName(s) }))}
          t={t as unknown as Record<string, string>}
        />
      </div>

      <h3 className="others-title">{t.otherProducts} {catName(category, lang)}</h3>
      <div className="two-col">
        <div className="panel panel-ok">
          <h4>✔ {t.alreadyReviewed} ({reviewed.length})</h4>
          {reviewed.slice(0, MAX_TILES).map((s) => (
            <div className="mini" key={s.id}>
              <EntityImage url={s.image_url} name={swName(s)} size={32} />
              <div><div>{swName(s)}</div><div className="mini-stars">{stars(byId.get(s.id)!.rating_overall)}</div></div>
              <Link className="btn-ghost" href={link(s.slug)}>{t.view}</Link>
            </div>
          ))}
          {reviewed.length > MAX_TILES && <Link className="small" href={`/review?category=${category.slug}`}>{t.seeAll} ({reviewed.length})</Link>}
        </div>
        <div className="panel panel-todo">
          <h4>◷ {t.notYet} ({notYet.length})</h4>
          {notYet.slice(0, MAX_TILES).map((s) => (
            <div className="mini" key={s.id}>
              <EntityImage url={s.image_url} name={swName(s)} size={32} />
              <div>{swName(s)}</div>
              <Link className="btn-ghost" href={link(s.slug)}>{t.writeReview}</Link>
            </div>
          ))}
          {notYet.length > MAX_TILES && <Link className="small" href={`/review?category=${category.slug}`}>{t.seeAll} ({notYet.length})</Link>}
        </div>
      </div>
    </section>
  );
}
