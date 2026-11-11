import Flash from '@/components/Flash';
import { createFromPendingSoftware, dismissPendingSoftware, matchPendingSoftware } from '@/app/actions/expert-admin';
import { requirePermission } from '@/lib/auth/current-user';
import { listCategories, listSoftware } from '@/lib/data';
import { db } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;
const GROUP: Record<string, string> = { pos: 'POS', erp: 'ERP', accounting: 'Accounting' };

/** Software names that experts typed because theirs was not in the list. They never enter the catalogue by themselves. */
export default async function PendingSoftwarePage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requirePermission('software.manage');
  const sp = await searchParams;
  const [{ data }, items, cats] = await Promise.all([
    db().from('rv_pending_software').select('*').eq('status', 'pending').order('created_at'),
    listSoftware(), listCategories({ all: true }),
  ]);
  const rows = (data ?? []) as Row[];
  const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
  const { data: users } = userIds.length ? await db().from('rv_users').select('id,full_name,email').in('id', userIds) : { data: [] as Row[] };
  const uMap = new Map<string, Row>(((users ?? []) as Row[]).map((u) => [u.id, u]));
  return (
    <>
      <h2 className="title">Software typed by experts (waiting)</h2>
      <p className="muted small">The review is already in moderation. It links to a product page only after you match it to an existing product or create the product here.</p>
      <Flash ok={sp.ok} error={sp.error} />
      {rows.length === 0 && <p className="muted">Nothing waiting.</p>}
      {rows.map((r) => (
        <div key={r.id} className="card form-stack" style={{ marginBottom: 12 }}>
          <div><b>{r.name}</b> <span className="badge">{GROUP[r.function_group] ?? 'Accounting'}</span>
            <div className="muted small">typed by {uMap.get(r.user_id)?.full_name ?? '—'} ({uMap.get(r.user_id)?.email ?? '—'}) · {String(r.created_at).slice(0, 10)}</div></div>
          <form action={matchPendingSoftware} className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <input type="hidden" name="id" value={r.id} />
            <select name="software_id" required defaultValue=""><option value="" disabled>Match to an existing product…</option>
              {items.map((s) => <option key={s.id} value={s.id}>{s.display_name || s.name}</option>)}</select>
            <button className="btn-primary">Match</button>
          </form>
          <form action={createFromPendingSoftware} className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <input type="hidden" name="id" value={r.id} />
            <input name="name" defaultValue={r.name} required maxLength={120} aria-label="Product name" />
            <select name="category_id" required defaultValue=""><option value="" disabled>Category…</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}</select>
            <button className="btn-ghost">Create new product</button>
          </form>
          <form action={dismissPendingSoftware}><input type="hidden" name="id" value={r.id} /><button className="btn-ghost">Dismiss</button></form>
        </div>
      ))}
    </>
  );
}
