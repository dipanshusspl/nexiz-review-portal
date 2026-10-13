import Link from 'next/link';
import ConfirmButton from '@/components/ConfirmButton';
import EntityImage from '@/components/EntityImage';
import Flash from '@/components/Flash';
import { deleteCategory, saveCategory, setCategoryImage } from '@/app/actions/admin';
import { can, requireUser } from '@/lib/auth/current-user';
import { listCategories } from '@/lib/data';
import { redirect } from 'next/navigation';

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ edit?: string; ok?: string; error?: string }> }) {
  const user = await requireUser();
  const manage = can(user, 'categories.manage');
  const images = can(user, 'images.manage');
  if (!manage && !images) redirect('/review?error=forbidden');
  const sp = await searchParams;
  const cats = await listCategories();
  const editing = manage ? cats.find((c) => c.id === sp.edit) : undefined;
  return (
    <>
      <h2 className="title">Categories</h2>
      <Flash ok={sp.ok} error={sp.error} />
      {manage && (
        <form action={saveCategory} className="card form-stack" key={editing?.id ?? 'new'}>
          <h3>{editing ? `Edit: ${editing.name_en}` : 'Add a category'}</h3>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid2">
            <label>Name (English)<input name="name_en" defaultValue={editing?.name_en} required /></label>
            <label>Name (Arabic)<input name="name_ar" defaultValue={editing?.name_ar ?? ''} dir="rtl" /></label>
            <label>Slug (optional, used in the URL)<input name="slug" defaultValue={editing?.slug} /></label>
            <label>Sort order<input name="sort_order" type="number" defaultValue={editing?.sort_order ?? 0} /></label>
          </div>
          {images && <label>Image (PNG / JPG / WEBP, max 2 MB){editing?.image_url && ' — leave empty to keep the current one'}
            <input name="image" type="file" accept="image/png,image/jpeg,image/webp" /></label>}
          <div className="row"><button className="btn-primary">{editing ? 'Save category' : 'Add category'}</button>
            {editing && <Link href="/admin/categories" className="btn-ghost">Cancel</Link>}</div>
        </form>
      )}
      <table className="table">
        <thead><tr><th>Image</th><th>Category</th><th>Slug</th><th>Order</th><th></th></tr></thead>
        <tbody>
          {cats.map((c) => (
            <tr key={c.id}>
              <td><EntityImage url={c.image_url} name={c.name_en} size={44} /></td>
              <td><b>{c.name_en}</b><div className="muted small" dir="rtl">{c.name_ar}</div></td>
              <td className="small">{c.slug}</td><td>{c.sort_order}</td>
              <td className="actions">
                {!manage && images && (
                  <form action={setCategoryImage} className="inline-upload">
                    <input type="hidden" name="id" value={c.id} />
                    <input name="image" type="file" accept="image/png,image/jpeg,image/webp" required />
                    <button className="btn-ghost">Upload image</button>
                  </form>
                )}
                {manage && <Link href={`/admin/categories?edit=${c.id}`} className="btn-ghost">Edit</Link>}
                {manage && (
                  <form action={deleteCategory}><input type="hidden" name="id" value={c.id} />
                    <ConfirmButton message={`Delete category "${c.name_en}"?`}>Delete</ConfirmButton></form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
