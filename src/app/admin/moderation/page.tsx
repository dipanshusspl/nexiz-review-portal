import Flash from '@/components/Flash';
import { approveReview, flagDispute, rejectReview } from '@/app/actions/moderation';
import { requirePermission } from '@/lib/auth/current-user';
import { ESCALATION_LABEL } from '@/lib/review-rules';
import { db } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;
const SLA_HOURS = 48;

export default async function Moderation({ searchParams }: { searchParams: Promise<{ tab?: string; ok?: string; error?: string }> }) {
  await requirePermission('reviews.moderate');
  const sp = await searchParams;
  const tab = sp.tab === 'approved' || sp.tab === 'rejected' ? sp.tab : 'pending';

  const [pub, exp, reasons, { data: sws }] = await Promise.all([
    db().from('rv_reviews').select('*').eq('status', tab).order('created_at', { ascending: false }).limit(100),
    db().from('rv_expert_software_reviews').select('*').eq('status', tab).eq('is_complete', true).order('created_at', { ascending: false }).limit(100),
    db().from('rv_reject_reasons').select('code,name_en').order('sort_order'),
    db().from('rv_software').select('id,name,display_name'),
  ]);
  const swName = new Map<string, string>(((sws ?? []) as Row[]).map((s) => [s.id, s.display_name || s.name]));
  const userIds = [...new Set(((pub.data ?? []) as Row[]).flatMap((r) => [r.user_id, r.collected_by]).filter(Boolean))];
  const profIds = [...new Set(((exp.data ?? []) as Row[]).map((r) => r.profile_id))];
  const [{ data: users }, { data: profs }] = await Promise.all([
    userIds.length ? db().from('rv_users').select('id,full_name,email').in('id', userIds) : Promise.resolve({ data: [] as Row[] }),
    profIds.length ? db().from('rv_expert_profiles').select('id,full_name,email,status').in('id', profIds) : Promise.resolve({ data: [] as Row[] }),
  ]);
  const uMap = new Map<string, Row>(((users ?? []) as Row[]).map((u) => [u.id, u]));
  const pMap = new Map<string, Row>(((profs ?? []) as Row[]).map((p) => [p.id, p]));

  type Card = { kind: 'user' | 'expert'; id: string; row: Row; at: string; esc: boolean };
  const cards: Card[] = [
    ...((pub.data ?? []) as Row[]).map((r): Card => ({ kind: 'user', id: r.id, row: r, at: r.created_at ?? '', esc: !!r.escalated })),
    ...((exp.data ?? []) as Row[]).map((r): Card => ({ kind: 'expert', id: r.id, row: r, at: r.created_at ?? '', esc: true })),
  ];
  // escalated first, then oldest first (the 48h clock is running)
  cards.sort((a, b) => (tab === 'pending' ? (Number(b.esc) - Number(a.esc)) || a.at.localeCompare(b.at) : b.at.localeCompare(a.at)));

  const hoursOld = (at: string) => (at ? Math.floor((Date.now() - new Date(at).getTime()) / 3600_000) : 0);
  const rating = (r: Row) => r.rating_overall ?? r.overall_rating;

  return (
    <div>
      <h1>Review moderation</h1>
      <p className="muted small">User reviews publish automatically. Everything here needs a person: every expert review, and any review that was escalated. You can approve, reject with a reason, or flag a vendor dispute. You cannot edit review text.</p>
      <Flash ok={sp.ok} error={sp.error} map={{}} />
      <div className="row" style={{ gap: 8, margin: '12px 0' }}>
        {(['pending', 'approved', 'rejected'] as const).map((k) => <a key={k} href={`/admin/moderation?tab=${k}`} className={tab === k ? 'btn-primary' : 'btn-ghost'}>{k[0].toUpperCase() + k.slice(1)}</a>)}
      </div>
      {cards.length === 0 && <p className="muted">Nothing here.</p>}
      {cards.map(({ kind, id, row, at }) => {
        const age = hoursOld(at);
        const prof = kind === 'expert' ? pMap.get(row.profile_id) : null;
        const author = kind === 'expert' ? prof : uMap.get(row.user_id);
        const unverifiedField = kind === 'user' && row.source === 'field' && !row.verified;
        return (
          <div key={kind + id} className="card" style={{ marginBottom: 12, padding: 16 }}>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge">{kind === 'expert' ? 'Expert' : row.source === 'field' ? 'Field user' : 'User'}</span>
              <b>{swName.get(row.software_id) ?? row.custom_software_name ?? 'Unknown product'}</b>
              <span className="muted small">by {author?.full_name || '—'} ({author?.email || '—'}){row.source === 'field' && uMap.get(row.collected_by) ? ` · collected by ${uMap.get(row.collected_by)!.full_name}` : ''}</span>
              <span className="muted small">rating {rating(row) ?? '—'}/5</span>
              {tab === 'pending' && <span className="small" style={{ color: age > SLA_HOURS ? '#8c2f2f' : undefined }}>{age}h waiting{age > SLA_HOURS ? ' (past 48h target)' : ''}</span>}
            </div>
            {row.escalation_reason && <p className="small" style={{ marginTop: 6 }}><b>Escalated:</b> {ESCALATION_LABEL[row.escalation_reason] ?? row.escalation_reason}</p>}
            {kind === 'expert' && !row.escalation_reason && <p className="small muted" style={{ marginTop: 6 }}>{ESCALATION_LABEL.expert}</p>}
            {unverifiedField && <p className="small" style={{ marginTop: 6, color: '#8a5304' }}>Waiting for the respondent to confirm. It cannot be approved until they do.</p>}
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              {kind === 'user' ? (
                <>
                  <div><b className="small">Role / size:</b> {row.reviewer_role} · {row.company_size} · <b className="small">Recommend:</b> {String(row.would_recommend)} · <b className="small">Still using:</b> {String(row.still_using)}</div>
                  <div><b className="small">Works well:</b> {row.pros}</div>
                  <div><b className="small">Doesn&apos;t:</b> {row.cons}</div>
                </>
              ) : (
                <>
                  <div><b className="small">Title:</b> {row.review_title}</div>
                  <div><b className="small">Problem it solved:</b> {row.main_problem}</div>
                  <div><b className="small">Biggest difficulty:</b> {row.biggest_difficulty || '—'}</div>
                  <div><b className="small">Improvement wish:</b> {row.wishlist}</div>
                  <div><b className="small">Who should not buy:</b> {row.who_should_not_buy}</div>
                  <div><b className="small">Compliance:</b> {Object.entries(row.compliance ?? {}).map(([k, v]) => `${k}: ${v}`).join(' · ') || '—'}</div>
                  <div><b className="small">Features:</b> {(row.features_used ?? []).join(', ') || '—'} · <b className="small">Anonymous:</b> {String(row.anonymous)}</div>
                </>
              )}
            </div>
            <div className="row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {tab !== 'approved' && (
                <form action={approveReview}><input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={id} />
                  <button className="btn-primary" disabled={unverifiedField}>Approve</button></form>
              )}
              {tab !== 'rejected' && (
                <form action={rejectReview} className="row" style={{ gap: 6 }}>
                  <input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={id} />
                  <select name="reason" required defaultValue=""><option value="" disabled>Reason…</option>
                    {((reasons.data ?? []) as Row[]).map((r) => <option key={r.code} value={r.code}>{r.name_en}</option>)}</select>
                  <button className="btn-ghost">Reject</button>
                </form>
              )}
              <form action={flagDispute}><input type="hidden" name="kind" value={kind} /><input type="hidden" name="id" value={id} /><button className="btn-ghost">Flag vendor dispute</button></form>
            </div>
          </div>
        );
      })}
    </div>
  );
}
