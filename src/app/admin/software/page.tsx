import Link from 'next/link';
import { redirect } from 'next/navigation';
import ConfirmButton from '@/components/ConfirmButton';
import EntityImage from '@/components/EntityImage';
import Flash from '@/components/Flash';
import { deleteSoftware, saveSoftware, setSoftwareImage } from '@/app/actions/admin';
import { can, requireUser } from '@/lib/auth/current-user';
import { listCategories, listSoftware } from '@/lib/data';

export default async function SoftwarePage({ searchParams }: { searchParams: Promise<{ edit?: string; ok?: string; error?: string }> }) {
  const user = await requireUser();
  const manage = can(user, 'software.manage');
  const images = can(user, 'images.manage');
  if (!manage && !images) redirect('/review?error=forbidden');
  const sp = await searchParams;
  const [items, cats] = await Promise.all([listSoftware(), listCategories()]);
  const catById = new Map(cats.map((c) => [c.id, c.name_en]));
  const editing = manage ? items.find((s) => s.id === sp.edit) : undefined;
  return (
    <>
      <h2 className="title">Software (projects)</h2>
      <Flash ok={sp.ok} error={sp.error} />
      {manage && (
        <form action={saveSoftware} className="card form-stack" key={editing?.id ?? 'new'}>
          <h3>{editing ? `Edit: ${editing.name}` : 'Add software'}</h3>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid2">
            <label>Name<input name="name" defaultValue={editing?.name} required /></label>
            <label>Category
              <select name="category_id" defaultValue={editing?.category_id} required>
                <option value="">Select...</option>
                {cats.map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
              </select></label>
            <label>Website<input name="website" type="url" defaultValue={editing?.website ?? ''} placeholder="https://" /></label>
            <label>Sort order<input name="sort_order" type="number" defaultValue={editing?.sort_order ?? 0} /></label>
            <label>Slug (optional)<input name="slug" defaultValue={editing?.slug} /></label>
          </div>
          <label>Description<textarea name="description" rows={3} defaultValue={editing?.description ?? ''} maxLength={1000} /></label>
          {images && (
            <>
              <label>Image URL (first choice){editing?.image_url && ' - leave empty to keep the current image'}
                <input name="image_url" type="url" placeholder="https://example.com/logo.png" /></label>
              <label>...or upload a file (used only when the URL box is empty; PNG / JPG / WEBP, max 2 MB)
                <input name="image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
            </>
          )}
          <div className="row"><button className="btn-primary">{editing ? 'Save software' : 'Add software'}</button>
            {editing && <Link href="/admin/software" className="btn-ghost">Cancel</Link>}</div>
        </form>
      )}
      <table className="table">
        <thead><tr><th>Image</th><th>Software</th><th>Category</th><th></th></tr></thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id}>
              <td><EntityImage url={s.image_url} name={s.name} size={44} showName /></td>
              <td><b>{s.name}</b><div className="muted small">{s.website}</div></td>
              <td>{catById.get(s.category_id) ?? '?'}</td>
              <td className="actions">
                {!manage && images && (
                  <form action={setSoftwareImage} className="inline-upload">
                    <input type="hidden" name="id" value={s.id} />
                    <input name="image_url" type="url" placeholder="Image URL (https://...)" />
                    <span className="or">or</span>
                    <input name="image" type="file" accept="image/png,image/jpeg,image/webp" />
                    <button className="btn-ghost">Save image</button>
                  </form>
                )}
                {manage && <Link href={`/admin/software?edit=${s.id}`} className="btn-ghost">Edit</Link>}
                {manage && (
                  <form action={deleteSoftware}><input type="hidden" name="id" value={s.id} />
                    <ConfirmButton message={`Delete "${s.name}" and all its reviews?`}>Delete</ConfirmButton></form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
