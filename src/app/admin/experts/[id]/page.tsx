import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requirePermission } from '@/lib/auth/current-user';
import { db } from '@/lib/supabase/admin';
import { lookups } from '@/lib/expert';
import { getBadgesByProfileId, getReviewCountsByProfileId } from '@/lib/badges';
import UserBadge from '@/components/UserBadge';

export const dynamic = 'force-dynamic';
/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

/** Read-only expert profile for admins. Opened from the "View expert profile" button on the moderation page. */
export default async function ExpertProfileAdmin({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('reviews.moderate');
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data: p } = await db().from('rv_expert_profiles').select('*').eq('id', id).maybeSingle();
  if (!p) notFound();

  const [lk, exp, svc, certs, projs, revs, sws, badges, counts] = await Promise.all([
    lookups(),
    db().from('rv_expert_profile_expertise').select('expertise_code,other_text').eq('profile_id', id),
    db().from('rv_expert_profile_services').select('service_code,other_text').eq('profile_id', id),
    db().from('rv_expert_certificates').select('*').eq('profile_id', id).order('sort_order'),
    db().from('rv_expert_projects').select('*').eq('profile_id', id).order('sort_order'),
    db().from('rv_expert_software_reviews').select('id,software_id,custom_software_name,status,is_complete,created_at').eq('profile_id', id).order('created_at', { ascending: false }),
    db().from('rv_software').select('id,name,display_name'),
    getBadgesByProfileId([id]),
    getReviewCountsByProfileId([id]),
  ]);

  // code -> English label, from every lookup list
  const label = new Map<string, string>();
  for (const l of [lk.roles, lk.experience, lk.expertise, lk.services]) for (const o of l as Row[]) label.set(o.code, o.en);
  for (const o of lk.options as Row[]) label.set(`${o.group_code}:${o.code}`, o.en);
  const L = (code?: string | null, other?: string | null, group?: string) =>
    (code && (group ? label.get(`${group}:${code}`) : label.get(code))) || other || code || '—';
  const swName = new Map<string, string>(((sws.data ?? []) as Row[]).map((s) => [s.id, s.display_name || s.name]));
  const photo = p.photo_url ? String(p.photo_url) : '';
  const link = (u?: string | null) => (u && /^https?:\/\//i.test(u) ? <a href={u} target="_blank" rel="noopener noreferrer">{u}</a> : u || '—');

  return (
    <>
      <p><Link href="/admin/users">← Users</Link> · <Link href="/admin/moderation">Moderation</Link></p>
      <div className="card" style={{ padding: 20, marginBottom: 14 }}>
        <div className="row" style={{ gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {photo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={photo} alt="" width={84} height={84} style={{ borderRadius: '50%', objectFit: 'cover' }} referrerPolicy="no-referrer" />}
          <div>
            <h1 className="title" style={{ margin: 0 }}>{p.full_name || '—'} <UserBadge badge={badges.get(id) ?? null} size={20} /></h1>
            <div className="muted small">{p.email || '—'} · {p.phone || 'no phone'} · profile status: <b>{p.status}</b> · {counts.get(id) ?? 0} approved review(s)</div>
          </div>
        </div>
        <dl style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 16px' }}>
          <dt className="muted">Professional role</dt><dd>{L(p.professional_role_code, p.professional_role_other)}</dd>
          <dt className="muted">Experience</dt><dd>{L(p.experience_range_code)}</dd>
          <dt className="muted">LinkedIn</dt><dd>{link(p.linkedin_url)}</dd>
          <dt className="muted">Language</dt><dd>{p.language === 'en' ? 'English' : 'Arabic'}</dd>
          <dt className="muted">Open to expert work</dt><dd>{p.consent_expert ? 'Yes' : 'No'}</dd>
          <dt className="muted">Bio</dt><dd style={{ whiteSpace: 'pre-wrap' }}>{p.bio || '—'}</dd>
        </dl>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2>Expertise</h2>
        <p>{((exp.data ?? []) as Row[]).map((r) => L(r.expertise_code, r.other_text)).join(' · ') || '—'}</p>
        <h2>Services</h2>
        <p>{((svc.data ?? []) as Row[]).map((r) => L(r.service_code, r.other_text)).join(' · ') || '—'}</p>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 14 }}>
        <h2>Certificates</h2>
        {((certs.data ?? []) as Row[]).length === 0 ? <p className="muted">None</p> : (
          <ul>{((certs.data ?? []) as Row[]).map((c) => (
            <li key={c.id}>{L(c.title_code, c.title_other, 'cert_title')} — {L(c.issuer_code, c.issuer_other, 'cert_issuer')}{c.year ? ` (${c.year})` : ''}{c.link ? <> · {link(c.link)}</> : null}</li>
          ))}</ul>
        )}
        <h2>Projects</h2>
        {((projs.data ?? []) as Row[]).length === 0 ? <p className="muted">None</p> : (
          <ul>{((projs.data ?? []) as Row[]).map((r) => (
            <li key={r.id} style={{ marginBottom: 8 }}>
              <b>{r.title || '—'}</b>{r.year ? ` (${r.year})` : ''}<br />
              <span className="muted small">{L(r.type_code, r.type_other, 'project_type')} · {L(r.role_code, r.role_other, 'project_role')} · {L(r.industry_code, r.industry_other, 'industry')}{r.software_other ? ` · ${r.software_other}` : ''}</span>
              {r.result ? <div style={{ whiteSpace: 'pre-wrap' }}>{r.result}</div> : null}
            </li>
          ))}</ul>
        )}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h2>Reviews by this expert</h2>
        {((revs.data ?? []) as Row[]).length === 0 ? <p className="muted">None</p> : (
          <ul>{((revs.data ?? []) as Row[]).map((r) => (
            <li key={r.id}>{swName.get(r.software_id) ?? r.custom_software_name ?? 'Unknown product'} — <b>{r.is_complete ? r.status : 'draft'}</b> <span className="muted small">{String(r.created_at).slice(0, 10)}</span></li>
          ))}</ul>
        )}
      </div>
    </>
  );
}
