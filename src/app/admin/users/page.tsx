import Link from 'next/link';
import ConfirmButton from '@/components/ConfirmButton';
import Flash from '@/components/Flash';
import { deleteUser, saveUser } from '@/app/actions/admin';
import { requirePermission } from '@/lib/auth/current-user';
import { db } from '@/lib/supabase/admin';

type Row = { id: string; email: string; full_name: string; role_id: string; is_active: boolean; last_login_at: string | null; role: { name: string } | { name: string }[] | null };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ edit?: string; ok?: string; error?: string }> }) {
  const me = await requirePermission('users.manage');
  const sp = await searchParams;
  const [{ data: u }, { data: r }] = await Promise.all([
    db().from('rv_users').select('id,email,full_name,role_id,is_active,last_login_at,role:rv_roles(name)').order('created_at'),
    db().from('rv_roles').select('id,name').order('name'),
  ]);
  const users = (u ?? []) as Row[];
  const roles = (r ?? []) as { id: string; name: string }[];
  const roleName = (x: Row) => (Array.isArray(x.role) ? x.role[0]?.name : x.role?.name) ?? '?';
  const editing = users.find((x) => x.id === sp.edit);
  return (
    <>
      <h2 className="title">Users</h2>
      <Flash ok={sp.ok} error={sp.error} />
      <form action={saveUser} className="card form-stack" key={editing?.id ?? 'new'} autoComplete="off">
        <h3>{editing ? `Edit user: ${editing.email}` : 'Create a user'}</h3>
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <label>Full name<input name="full_name" defaultValue={editing?.full_name} required /></label>
        <label>Email<input name="email" type="email" defaultValue={editing?.email} required readOnly={!!editing} /></label>
        <label>Role
          <select name="role_id" defaultValue={editing?.role_id} required>
            <option value="">Select a role...</option>
            {roles.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
        </label>
        <label>{editing ? 'New password (leave empty to keep)' : 'Password (min 8 characters)'}
          <input name="password" type="password" minLength={8} required={!editing} autoComplete="new-password" /></label>
        {editing && <label className="check"><input type="checkbox" name="is_active" defaultChecked={editing.is_active} /> Active (can log in)</label>}
        <div className="row"><button className="btn-primary">{editing ? 'Save user' : 'Create user'}</button>
          {editing && <Link href="/admin/users" className="btn-ghost">Cancel</Link>}</div>
      </form>

      <table className="table">
        <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last login</th><th></th></tr></thead>
        <tbody>
          {users.map((x) => (
            <tr key={x.id}>
              <td><b>{x.full_name}</b><div className="muted small">{x.email}</div></td>
              <td><span className="badge">{roleName(x)}</span></td>
              <td>{x.is_active ? 'Active' : 'Disabled'}</td>
              <td className="small">{x.last_login_at ? new Date(x.last_login_at).toLocaleString('en-GB') : '—'}</td>
              <td className="actions">
                <Link href={`/admin/users?edit=${x.id}`} className="btn-ghost">Edit</Link>
                {x.id !== me.id && (
                  <form action={deleteUser}><input type="hidden" name="id" value={x.id} />
                    <ConfirmButton message={`Delete ${x.email}? Their reviews are deleted too.`}>Delete</ConfirmButton></form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
