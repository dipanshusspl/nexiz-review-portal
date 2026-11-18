// Added by Prachi, 2026-11-17: admin list of "Request a Demo" leads, with click totals and the vendor forwarding record.
import Link from 'next/link';
import { forwardLead, setLeadStatus } from '@/app/actions/demo-admin';
import Flash from '@/components/Flash';
import { requirePermission } from '@/lib/auth/current-user';
import { db } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;
const STATUSES = ['new', 'forwarded', 'contacted', 'closed'] as const;
const fmt = (v: string | null) => (v ? new Date(v).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : '—');

export default async function DemoRequestsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; status?: string }> }) {
  await requirePermission('software.manage');
  const sp = await searchParams;
  const filter = (STATUSES as readonly string[]).includes(sp.status ?? '') ? sp.status! : '';

  let q = db().from('rv_demo_requests').select('*').order('created_at', { ascending: false }).limit(200);
  if (filter) q = q.eq('status', filter);
  const [{ data }, clicks, leadsAll, forwardedAll] = await Promise.all([
    q,
    db().from('rv_cta_clicks').select('id', { count: 'exact', head: true }),
    db().from('rv_demo_requests').select('id', { count: 'exact', head: true }),
    db().from('rv_demo_requests').select('id', { count: 'exact', head: true }).eq('status', 'forwarded'),
  ]);
  const rows = (data ?? []) as Row[];

  const swIds = [...new Set(rows.map((r) => r.software_id).filter(Boolean))];
  const { data: sws } = swIds.length ? await db().from('rv_software').select('id,name,display_name,vendor_name').in('id', swIds) : { data: [] as Row[] };
  const swMap = new Map<string, Row>(((sws ?? []) as Row[]).map((s) => [s.id, s]));
  const { data: fw } = rows.length
    ? await db().from('rv_lead_forwards').select('*').in('lead_id', rows.map((r) => r.id)).order('forwarded_at', { ascending: false })
    : { data: [] as Row[] };
  const fwMap = new Map<string, Row[]>();
  for (const f of (fw ?? []) as Row[]) fwMap.set(f.lead_id, [...(fwMap.get(f.lead_id) ?? []), f]);

  const nClicks = clicks.count ?? 0, nLeads = leadsAll.count ?? 0;
  return (
    <>
      <h2 className="title">Demo and vendor requests</h2>
      <Flash ok={sp.ok} error={sp.error} />
      <div className="cards">
        <div className="card dash-card"><span className="num">{nClicks}</span><b>CTA clicks (demo + vendor)</b></div>
        <div className="card dash-card"><span className="num">{nLeads}</span><b>Requests sent</b><span className="muted small">{nClicks ? `${Math.round((nLeads / nClicks) * 100)}% of clicks` : ''}</span></div>
        <div className="card dash-card"><span className="num">{forwardedAll.count ?? 0}</span><b>Forwarded to a vendor</b></div>
      </div>

      <p className="small" style={{ margin: '12px 0' }}>
        <Link href="/admin/demo-requests" className="btn-ghost">All</Link>{' '}
        {STATUSES.map((s) => <span key={s}><Link href={`/admin/demo-requests?status=${s}`} className="btn-ghost">{s}</Link>{' '}</span>)}
      </p>
      {rows.length === 0 && <p className="muted">No demo requests{filter ? ` with status "${filter}"` : ''} yet.</p>}

      {rows.map((r) => {
        const sw = swMap.get(r.software_id);
        const forwards = fwMap.get(r.id) ?? [];
        return (
          <div key={r.id} className="card form-stack" style={{ marginBottom: 12 }}>
            <div>
              <b>{r.lead_id}</b> <span className="badge">{r.status}</span> <span className="badge">{r.request_type}</span>
              <div className="muted small">{fmt(r.created_at)} · Product: <b>{sw ? sw.display_name || sw.name : r.software_slug}</b>{r.user_id ? ' · logged-in visitor' : ''}</div>
            </div>
            <div className="small">
              <b>{r.name}</b> · <span dir="ltr">{r.email}</span> · {r.company}
              {r.cr_number && <> · CR <span dir="ltr">{r.cr_number}</span></>}
            </div>
            <div className="muted small">
              Consent to share with vendor: <b>{r.consent_vendor_share ? `yes (${fmt(r.consent_at)})` : 'no'}</b>
            </div>

            {(r.branches_count != null || r.message) && (
              <div className="small">
                {r.branches_count != null && <>Branches: <b>{r.branches_count}</b> · Users: <b>{r.system_users_count}</b> · Employees: <b>{r.employees_count}</b> · Activity: <b>{r.business_activity}</b></>}
                {r.message && <div className="muted">Message: {r.message}</div>}
              </div>
            )}

            {forwards.length > 0 && (
              <div className="small">
                <b>Forwarded:</b>
                {forwards.map((f) => <div key={f.id} className="muted">{fmt(f.forwarded_at)} → {f.vendor_name}{f.vendor_email ? ` (${f.vendor_email})` : ''}</div>)}
              </div>
            )}

            {r.consent_vendor_share ? (
              <form action={forwardLead} className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                <input type="hidden" name="id" value={r.id} />
                <input name="vendor_name" required placeholder="Vendor name" defaultValue={sw?.vendor_name ?? ''} />
                <input name="vendor_email" type="email" placeholder="Vendor email (optional)" dir="ltr" />
                <button className="btn-primary">{forwards.length ? 'Forward again' : 'Mark as forwarded'}</button>
              </form>
            ) : <p className="muted small">Cannot be forwarded: the customer did not agree to share their details.</p>}

            <form action={setLeadStatus} className="row" style={{ gap: 8 }}>
              <input type="hidden" name="id" value={r.id} />
              <select name="status" defaultValue={r.status}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              <button className="btn-ghost">Change status</button>
            </form>
          </div>
        );
      })}
    </>
  );
}