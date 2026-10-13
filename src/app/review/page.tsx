import Link from 'next/link';
import { redirect } from 'next/navigation';
import EntityImage from '@/components/EntityImage';
import Flash from '@/components/Flash';
import Header from '@/components/Header';
import ReviewForm from '@/components/ReviewForm';
import Stepper from '@/components/Stepper';
import TileGrid, { type Tile } from '@/components/TileGrid';
// import { requireUser } from '@/lib/auth/current-user';
import { catName, getCategoryBySlug, getSoftwareBySlug, listCategories, listSoftware, listUserReviews } from '@/lib/data';
import { DURATIONS, getDict, getLang } from '@/lib/i18n';
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
    saved: t.saved, forbidden: t.e_forbidden, invalid: t.e_invalid, notfound: t.e_notfound, failed: t.e_failed,
  };

  const category = sp.category ? await getCategoryBySlug(sp.category) : null;
  const software = category && sp.software ? await getSoftwareBySlug(sp.software) : null;
  if (sp.category && !category) redirect('/review?error=notfound');
  if (software && software.category_id !== category?.id) redirect('/review?error=notfound');
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
        {step === 3 && category && software && <Step3 userId={user.id} category={category} software={software} lang={lang} t={t} />}
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
    </section>
  );
}

async function Step2({ category, lang, t }: { category: Awaited<ReturnType<typeof getCategoryBySlug>> & {}; lang: 'en' | 'ar'; t: T }) {
  const items = await listSoftware(category.id);
  const tiles: Tile[] = items.map((s) => ({
    id: s.id, href: `/review?category=${category.slug}&software=${s.slug}`, name: s.name, imageUrl: s.image_url, hue: hueOf(s.name),
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

async function Step3({ userId, category, software, lang, t }: {
  userId: string; category: NonNullable<Awaited<ReturnType<typeof getCategoryBySlug>>>;
  software: NonNullable<Awaited<ReturnType<typeof getSoftwareBySlug>>>; lang: 'en' | 'ar'; t: T;
}) {
  const siblings = await listSoftware(category.id);
  const reviews = await listUserReviews(userId, siblings.map((s) => s.id));
  const mine = reviews.find((r) => r.software_id === software.id) ?? null;
  const others = siblings.filter((s) => s.id !== software.id);
  const byId = new Map(reviews.map((r) => [r.software_id, r]));
  const reviewed = others.filter((s) => byId.has(s.id));
  const notYet = others.filter((s) => !byId.has(s.id));
  const link = (slug: string) => `/review?category=${category.slug}&software=${slug}`;

  return (
    <section>
      <div className="card sw-card">
        <div className="sw-head">
          <EntityImage url={software.image_url} name={software.name} size={48} />
          <div><b>{software.name}</b><div className="muted small">{catName(category, lang)}</div></div>
          <Link href={`/review?category=${category.slug}`} className="small change">✎ {t.changeSoftware}</Link>
        </div>
        <ReviewForm
          key={software.id}
          category={category.slug} software={software.slug} softwareName={software.name} lang={lang}
          initial={mine ? { rating: mine.rating, duration: mine.duration, comment: mine.comment ?? '' } : null}
          durations={DURATIONS.map((d) => ({ value: d, label: t[`d_${d}` as keyof T] as string }))}
          labels={{ yourRating: t.yourRating, outOf5: t.outOf5, howLong: t.howLong, yourReview: t.yourReview,
            placeholder: t.sharePlaceholder, record: t.record, stop: t.stop, submit: mine ? t.update : t.submit }}
        />
      </div>

      <h3 className="others-title">{t.otherProducts} {catName(category, lang)}</h3>
      <div className="two-col">
        <div className="panel panel-ok">
          <h4>✔ {t.alreadyReviewed} ({reviewed.length})</h4>
          {reviewed.map((s) => (
            <div className="mini" key={s.id}>
              <EntityImage url={s.image_url} name={s.name} size={32} />
              <div><div>{s.name}</div><div className="mini-stars">{stars(byId.get(s.id)!.rating)}</div></div>
              <Link className="btn-ghost" href={link(s.slug)}>{t.view}</Link>
            </div>
          ))}
        </div>
        <div className="panel panel-todo">
          <h4>◷ {t.notYet} ({notYet.length})</h4>
          {notYet.map((s) => (
            <div className="mini" key={s.id}>
              <EntityImage url={s.image_url} name={s.name} size={32} />
              <div>{s.name}</div>
              <Link className="btn-ghost" href={link(s.slug)}>{t.writeReview}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
