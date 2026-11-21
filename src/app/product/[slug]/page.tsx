// Changed by Prachi, 2026-11-13: a "Profile page" link added in the header (prod-head).
// Why: the product list, the search and the alternatives now open /profilepage/<slug>, so this reviews page is reached from the
// Reviews row of the profile page. The link gives the way back to the profile page.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EntityImage from '@/components/EntityImage';
import Footer from '@/components/Footer';
import PublicHeader from '@/components/PublicHeader';
import TrustBar from '@/components/TrustBar';
import { getCurrentUser } from '@/lib/auth/current-user';
import { COMPANY_SIZES, DURATIONS, ROLES, getDict, getLang } from '@/lib/i18n';
import { pt, type PT } from '@/lib/i18n-product';
import { loadProduct, MIN_LEAVERS, MIN_REVIEWS_TO_SCORE, type Status } from '@/lib/product';

export const dynamic = 'force-dynamic';

const Stars = ({ n }: { n: number }) => (
  <span aria-hidden style={{ letterSpacing: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => <span key={i} style={{ color: i <= Math.round(n) ? 'var(--ink)' : 'var(--ink-faint)' }}>★</span>)}
  </span>
);

function Score({ label, p, p_: t }: { label: string; p: { count: number; score: number | null }; p_: PT }) {
  return (
    <div className="split-row">
      <span className={`badge-out ${label === t.expertScore ? 'expert' : 'user'}`}>{label}</span>
      {p.score !== null
        ? (<><span className="fig" style={{ fontSize: 18, fontWeight: 600 }}>{p.score.toFixed(1)}</span><Stars n={p.score} /></>)
        : <span className="muted small">{t.tooFew}</span>}
      <span className="muted small fig">{p.count} {p.count === 1 ? t.review : t.reviewsWord}</span>
    </div>
  );
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params;
  const sp = await searchParams;
  const lang = await getLang();
  const t = pt(lang), d = getDict(lang);
  const user = await getCurrentUser();
  const data = await loadProduct(slug, { type: sp.type, size: sp.size, role: sp.role, duration: sp.duration, still: sp.still }, lang);
  if (!data) notFound();
  const { sw, cat, label } = data;
  const catName = cat ? (lang === 'ar' ? cat.name_ar || cat.name_en : cat.name_en) : '';
  const L = (code: string | null) => (code ? label.get(code) ?? code : '');
  // Changed by Prachi, 2026-11-03: added the "mixed" state
  const statusWord: Record<Status | 'mixed', string> = { ok: t.s_ok, partial: t.s_partial, no: t.s_no, none: t.s_none, mixed: t.s_mixed };
  const featLabel = (k: string) => (t[('f_' + k) as keyof PT] as string) ?? k;
  const durLabel = (c: string | null) => (c && DURATIONS.includes(c as (typeof DURATIONS)[number]) ? (d[('d_' + c) as keyof typeof d] as string) : L(c));
  const roleLabel = (c: string | null) => (c && (ROLES as readonly string[]).includes(c) ? (d[('r_' + c) as keyof typeof d] as string) : '');
  const f = { type: sp.type ?? '', size: sp.size ?? '', role: sp.role ?? '', duration: sp.duration ?? '', still: sp.still ?? '' };

  return (
    <>
      <PublicHeader lang={lang} current={`/product/${slug}`} loggedIn={!!user} t={{ login: t.login, reviewIt: t.reviewIt }} />
      <TrustBar lang={lang} />
      <div className="prod">
        {/* 1 header (sticky) */}
        <div className="prod-head">
          <EntityImage url={sw.image_url} name={sw.shownName} size={52} />
          <div>
            <h1>{sw.shownName}</h1>
            <div className="muted small">{[sw.vendor_name && `${t.by} ${sw.vendor_name}`, catName].filter(Boolean).join(' · ')}</div>
          </div>
          {/* Added by Prachi, 2026-11-13: the way back to the profile page (marginInlineStart auto = right side in English, left side in Arabic) */}
          <Link href={`/profilepage/${slug}`} className="btn-ghost" style={{ marginInlineStart: 'auto' }}>{lang === 'ar' ? 'الملف التعريفي' : 'Profile page'}</Link>
        </div>

        {/* 2 rating summary: user and expert scores are never blended */}
        <section className="blk" aria-labelledby="sum">
          <h2 id="sum" className="sr-only" style={{ position: 'absolute', left: -9999 }}>{t.reviews}</h2>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              {data.userP.score !== null
                ? (<><div className="score-xl">{data.userP.score.toFixed(1)}<small> /5</small></div>
                    <div style={{ marginTop: 6 }}><Stars n={data.userP.score} /> <span className="muted small">{t.userScore}</span></div>
                    <div className="muted small fig">{data.userP.count} {t.reviewsWord}</div>
                    <span className="sr-only" style={{ position: 'absolute', left: -9999 }}>{data.userP.score.toFixed(1)} {t.outOf5}</span></>)
                : (<><div className="muted">{t.tooFew}</div><div className="muted small fig">{data.userP.count} {data.userP.count === 1 ? t.review : t.reviewsWord} · {t.userScore}</div></>)}
            </div>
            {/* Changed by Prachi, 2026-11-05 (gap 6.13): the recommend share is shown for users and for experts separately, not blended */}
            <div>
              {data.recommendUser.pct !== null
                ? (<><div className="score-xl">{data.recommendUser.pct}%</div><div className="muted small">{t.wouldRecommend} · {t.users} · <span className="fig">{data.recommendUser.base}</span> {t.reviewsWord}</div></>)
                : (<div className="muted small">{t.tooFew}</div>)}
              {data.recommendExpert.pct !== null && (
                <div className="muted small" style={{ marginTop: 6 }}>{t.expertScore}: <span className="fig">{data.recommendExpert.pct}%</span> {t.wouldRecommend} · <span className="fig">{data.recommendExpert.base}</span> {t.reviewsWord}</div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Score label={t.expertScore} p={data.expertP} p_={t} />
            <Score label={t.users} p={data.userP} p_={t} />
          </div>
        </section>

        {/* 3 Saudi compliance, above the written reviews */}
        <section className="blk">
          <h2>{t.compliance}</h2>
          <p className="muted small" style={{ marginBottom: 12 }}>{t.complianceSub}</p>
          <div className="chips">
            {data.chips.map((c) => (
              <span key={c.key} className={`chip ${c.status}`}>
                <span className="mark" aria-hidden />
                <b className="lt">{t[c.key as keyof PT] as string}</b>
                <span>{statusWord[c.status]}</span>
                {/* Added by Prachi, 2026-11-03: how many reviewers answered, and for a mixed chip how the answers split */}
                {c.status !== 'none' && <span className="muted small">({c.answers} {t.answersWord}{c.status === 'mixed' ? `: ${t.s_ok} ${c.counts.ok} · ${t.s_partial} ${c.counts.partial} · ${t.s_no} ${c.counts.no}` : ''})</span>}
              </span>
            ))}
          </div>
          <p className="muted small" style={{ marginTop: 10 }}>{t.basedOn} <span className="fig">{data.complianceBase}</span> {t.reviewsWord}</p>
        </section>

        {/* 4 at a glance: every figure shows its denominator */}
        <section className="blk">
          <h2>{t.glance}</h2>
          <div className="glance">
            <div><div className="muted small">{t.sizes}</div>
              {data.sizeTop.length ? data.sizeTop.map(([k, n]) => <div key={k}><span className="fig-lg lt">{k}</span> <span className="muted small fig">({n} {t.ofReviews} {data.sizeBase})</span></div>) : <div className="muted small">{t.notEnough}</div>}</div>
            <div><div className="muted small">{t.golive}</div>
              {data.golive ? <><div className="fig-lg">{L(data.golive.value)}</div><div className="muted small fig">{data.golive.n} {t.ofReviews} {data.golive.base} {t.expertReviews}</div></> : <div className="muted small">{t.notEnough}</div>}</div>
            <div><div className="muted small">{t.cost}</div>
              {data.cost ? <><div className="fig-lg">{L(data.cost.value)}</div><div className="muted small fig">{data.cost.n} {t.ofReviews} {data.cost.base} {t.expertReviews}</div></> : <div className="muted small">{t.notEnough}</div>}</div>
            <div><div className="muted small">{t.features}</div>
              {data.features.length ? data.features.map(([k, n]) => <div key={k}>{featLabel(k)} <span className="muted small fig">({n} {t.ofReviews} {data.featuresBase})</span></div>) : <div className="muted small">{t.notEnough}</div>}</div>
          </div>
        </section>

        {/* 6a who this suits (19 Nov: from the experts' new answers; no names shown) */}
        {data.suitsList.length > 0 && (
          <section className="blk">
            <h2>{t.suits}</h2>
            {data.suitsList.map((i) => <blockquote key={i.id}>{i.suits}</blockquote>)}
          </section>
        )}

        {/* 6 who should not buy, its own block (placed before the list so it is not buried) */}
        {data.whoNot.length > 0 && (
          <section className="blk nobuy">
            <h2>{t.whoNot}</h2>
            {data.whoNot.map((i) => <blockquote key={i.id}>{i.whoNot}</blockquote>)}
          </section>
        )}

        {/* 7 what reviewers moved to */}
        {data.leavers >= MIN_LEAVERS && (
          <section className="blk">
            <h2>{t.moved}</h2>
            <p><span className="fig">{data.leavers}</span> {t.of} <span className="fig">{data.total}</span> {t.reviewers} {t.movedOff}
              {data.movedTop && data.movedTop.name && <>, {t.mostOftenTo} <b>{data.movedTop.name}</b></>}.</p>
          </section>
        )}

        {/* 5 reviews + filters */}
        <section className="blk">
          <h2>{t.reviews}</h2>
          <form className="filters" method="get">
            <select name="type" defaultValue={f.type} aria-label={t.filterType}><option value="">{t.filterType}: {t.all}</option><option value="expert">{t.expertBadge}</option><option value="user">{t.userBadge}</option></select>
            <select name="size" defaultValue={f.size} aria-label={t.filterSize}><option value="">{t.filterSize}: {t.all}</option>{COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <select name="role" defaultValue={f.role} aria-label={t.filterRole}><option value="">{t.filterRole}: {t.all}</option>{ROLES.map((r) => <option key={r} value={r}>{d[('r_' + r) as keyof typeof d] as string}</option>)}</select>
            <select name="duration" defaultValue={f.duration} aria-label={t.filterDuration}><option value="">{t.filterDuration}: {t.all}</option>{DURATIONS.map((x) => <option key={x} value={x}>{d[('d_' + x) as keyof typeof d] as string}</option>)}</select>
            <select name="still" defaultValue={f.still} aria-label={t.filterStill}><option value="">{t.filterStill}: {t.all}</option><option value="yes">{t.yes}</option><option value="no">{t.no}</option></select>
            <button className="btn-ghost">{t.apply}</button>
          </form>
          {data.list.length === 0 && <p className="muted">{t.noReviews}</p>}
          {data.list.map((i) => (
            <article key={i.id} className="rev">
              {/* order: badge, role, company size, duration, still using, score, then the pair, then the date. Never a name. */}
              <div className="meta">
                <span className={`badge-out ${i.kind}`}>{i.kind === 'expert' ? t.expertBadge : t.userBadge}</span>
                {(i.kind === 'user' ? roleLabel(i.role) : i.role) && <span style={{ color: 'var(--ink)' }}>{i.kind === 'user' ? roleLabel(i.role) : i.role}</span>}
                {i.size && <span className="lt">{i.size}</span>}
                {i.duration && <span>{durLabel(i.duration)}</span>}
                {i.still !== null && <span>{i.still ? t.still : t.notStill}</span>}
                <span className="fig"><Stars n={i.score} /> {i.score}/5</span>
              </div>
              <div className="pair">
                <div><div className="lbl">{t.worksWell}</div><p>{i.works || t.nothing}</p></div>
                <div><div className="lbl">{t.doesnt}</div><p>{i.doesnt || t.nothing}{i.doesnt && i.resolved ? <span className="muted small"> ({t.resolved}: {i.resolved})</span> : null}</p></div>
              </div>
              {i.date && <div className="muted small" style={{ marginTop: 8 }}>{new Date(i.date).toLocaleDateString(lang === 'ar' ? 'ar-SA-u-nu-latn' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}</div>}
            </article>
          ))}
        </section>

        <p className="muted small" style={{ marginTop: 16 }}>
          {user ? <Link href="/review">{t.reviewIt}</Link> : <Link href="/login">{t.login}</Link>}
          {' · '}<span className="fig">{MIN_REVIEWS_TO_SCORE}</span> {t.reviewsWord} {lang === 'ar' ? 'على الأقل لإظهار درجة' : 'minimum to show a score'}
        </p>
      </div>
      <Footer lang={lang} />
    </>
  );
}