import Flash from '@/components/Flash';
import ConfirmButton from '@/components/ConfirmButton';
import Link from 'next/link';
import { deleteRole, saveRole } from '@/app/actions/admin';
import { requirePermission } from '@/lib/auth/current-user';
import { PERMISSIONS } from '@/lib/permissions';
import { db } from '@/lib/supabase/admin';

type Role = { id: string; name: string; description: string | null; permissions: string[]; is_system: boolean };

export default async function RolesPage({ searchParams }: { searchParams: Promise<{ edit?: string; ok?: string; error?: string }> }) {
  await requirePermission('roles.manage');
  const sp = await searchParams;
  const { data } = await db().from('rv_roles').select('*').order('created_at');
  const roles = (data ?? []) as Role[];
  const editing = roles.find((r) => r.id === sp.edit);
  const isAdmin = editing?.name === 'admin';
  return (
    <>
      <h2 className="title">Roles</h2>
      <Flash ok={sp.ok} error={sp.error} />
      <form action={saveRole} className="card form-stack" key={editing?.id ?? 'new'}>
        <h3>{editing ? `Edit role: ${editing.name}` : 'Create a role'}</h3>
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <label>Role name<input name="name" defaultValue={editing?.name} required readOnly={editing?.is_system} placeholder="e.g. expert" /></label>
        <label>Description<input name="description" defaultValue={editing?.description ?? ''} /></label>
        <fieldset disabled={isAdmin}>
          <legend>Permissions {isAdmin && '(admin always has all)'}</legend>
          {PERMISSIONS.map((p) => (
            <label key={p.key} className="check">
              <input type="checkbox" name="permissions" value={p.key} defaultChecked={isAdmin || editing?.permissions.includes(p.key)} /> {p.label}
            </label>
          ))}
        </fieldset>
        <div className="row"><button className="btn-primary">{editing ? 'Save role' : 'Create role'}</button>
          {editing && <Link href="/admin/roles" className="btn-ghost">Cancel</Link>}</div>
      </form>

      <table className="table">
        <thead><tr><th>Role</th><th>Permissions</th><th></th></tr></thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.id}>
              <td><b>{r.name}</b>{r.is_system && <span className="badge">system</span>}<div className="muted small">{r.description}</div></td>
              <td className="small">{r.name === 'admin' ? 'all' : r.permissions.join(', ') || '—'}</td>
              <td className="actions">
                <Link href={`/admin/roles?edit=${r.id}`} className="btn-ghost">Edit</Link>
                {!r.is_system && (
                  <form action={deleteRole}><input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message={`Delete role "${r.name}"?`}>Delete</ConfirmButton></form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
