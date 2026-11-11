import Flash from '@/components/Flash';
import { deleteFunctionOption, saveFunctionOption, setCategoryFunctionGroup } from '@/app/actions/expert-admin';
import { requirePermission } from '@/lib/auth/current-user';
import { listCategories } from '@/lib/data';
import { db } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;
const GROUPS: [string, string][] = [['accounting', 'Accounting systems'], ['erp_extra', 'ERP (added to the accounting list)'], ['pos', 'POS']];

/** The "Which functions have you personally used?" lists. Edited here, no code change needed. */
export default async function FunctionsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requirePermission('software.manage');
  const sp = await searchParams;
  const [{ data }, cats] = await Promise.all([
    db().from('rv_function_options').select('*').order('sort_order'), listCategories({ all: true }),
  ]);
  const rows = (data ?? []) as Row[];
  const catRows = (await db().from('rv_categories').select('id,function_group')).data as Row[] | null;
  const grp = new Map<string, string>((catRows ?? []).map((c) => [c.id, c.function_group || 'accounting']));
  return (
    <>
      <h2 className="title">Function lists</h2>
      <Flash ok={sp.ok} error={sp.error} />
      <h3>Which list does each category use?</h3>
      <table className="table"><tbody>
        {cats.map((c) => (
          <tr key={c.id}><td>{c.name_en}</td><td>
            <form action={setCategoryFunctionGroup} className="row" style={{ gap: 8 }}>
              <input type="hidden" name="id" value={c.id} />
              <select name="function_group" defaultValue={grp.get(c.id)}>
                <option value="accounting">Accounting systems</option><option value="erp">ERP</option><option value="pos">POS</option></select>
              <button className="btn-ghost">Save</button>
            </form></td></tr>
        ))}
      </tbody></table>
      {GROUPS.map(([g, title]) => (
        <div key={g} style={{ marginTop: 20 }}>
          <h3>{title}</h3>
          <table className="table">
            <thead><tr><th>English</th><th>Arabic</th><th>Order</th><th>Shown</th><th></th></tr></thead>
            <tbody>
              {rows.filter((r) => r.function_group === g).map((r) => (
                <tr key={r.id}>
                  <td colSpan={5}>
                    <form action={saveFunctionOption} className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                      <input type="hidden" name="id" value={r.id} /><input type="hidden" name="function_group" value={g} />
                      <input name="name_en" defaultValue={r.name_en} required maxLength={160} aria-label="English name" />
                      <input name="name_ar" defaultValue={r.name_ar} required maxLength={160} dir="rtl" aria-label="Arabic name" />
                      <input name="sort_order" type="number" defaultValue={r.sort_order} style={{ width: 80 }} aria-label="Order" />
                      <label className="row" style={{ gap: 4 }}><input type="checkbox" name="is_active" defaultChecked={r.is_active} /> shown</label>
                      <button className="btn-ghost">Save</button>
                    </form>
                    <form action={deleteFunctionOption} style={{ display: 'inline' }}><input type="hidden" name="id" value={r.id} /><button className="btn-ghost small">Hide</button></form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <form action={saveFunctionOption} className="row card" style={{ gap: 8, flexWrap: 'wrap', padding: 12 }}>
            <input type="hidden" name="function_group" value={g} />
            <input name="name_en" placeholder="New function (English)" required maxLength={160} />
            <input name="name_ar" placeholder="الوظيفة (بالعربية)" required maxLength={160} dir="rtl" />
            <input name="sort_order" type="number" placeholder="Order" style={{ width: 80 }} />
            <button className="btn-primary">Add</button>
          </form>
        </div>
      ))}
    </>
  );
}
