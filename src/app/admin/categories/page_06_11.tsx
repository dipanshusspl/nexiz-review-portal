import Link from 'next/link';
import ConfirmButton from '@/components/ConfirmButton';
import EntityImage from '@/components/EntityImage';
import Flash from '@/components/Flash';
import { deleteCategory, saveCategory, setCategoryImage } from '@/app/actions/admin';
import { can, requireUser } from '@/lib/auth/current-user';
import { listCategories } from '@/lib/data';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ edit?: string; ok?: string; error?: string }> }) {
  const user = await requireUser();
  const manage = can(user, 'categories.manage');
  const images = can(user, 'images.manage');
  if (!manage && !images) redirect('/review?error=forbidden');
  const sp = await searchParams;
  const cats = await listCategories({ all: true });
  // go-live rule: a category should be live only at 5+ products and 3+ published reviews
  const [{ data: sw }, { data: rv }] = await Promise.all([
    db().from('rv_software').select('id,category_id'),
    db().from('rv_reviews').select('software_id').eq('verified', true),
  ]);
  const swCat = new Map((sw ?? []).map((s: { id: string; category_id: string }) => [s.id, s.category_id]));
  const nProducts = new Map<string, number>(); const nReviews = new Map<string, number>();
  for (const s of sw ?? []) nProducts.set(s.category_id, (nProducts.get(s.category_id) ?? 0) + 1);
  for (const r of rv ?? []) { const c = swCat.get(r.software_id); if (c) nReviews.set(c, (nReviews.get(c) ?? 0) + 1); }
  const parentName = new Map(cats.map((c) => [c.id, c.name_en]));
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
          <label className="check"><input type="checkbox" name="is_live" defaultChecked={editing?.is_live ?? false} /> Live (shown on the public /review page). Hidden categories keep their records and routes.</label>
          <label className="check"><input type="checkbox" name="live_override" defaultChecked={editing?.live_override} /> Force live (override the 5 products / 3 reviews rule, e.g. for a partner demo)</label>
          <label>Sub-tag of (merge into another category)
            <select name="parent_id" defaultValue={editing?.parent_id ?? ''}>
              <option value="">— none (top-level) —</option>
              {cats.filter((c) => c.id !== editing?.id && !c.parent_id).map((c) => <option key={c.id} value={c.id}>{c.name_en}</option>)}
            </select>
          </label>
          {images && (
            <>
              <label>Image URL (first choice){editing?.image_url && ' - leave empty to keep the current image'}
                <input name="image_url" type="url" placeholder="https://example.com/logo.png" /></label>
              <label>...or upload a file (used only when the URL box is empty; PNG / JPG / WEBP, max 2 MB)
                <input name="image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
            </>
          )}
          <div className="row"><button className="btn-primary">{editing ? 'Save category' : 'Add category'}</button>
            {editing && <Link href="/admin/categories" className="btn-ghost">Cancel</Link>}</div>
        </form>
      )}
      <table className="table">
        <thead><tr><th>Image</th><th>Category</th><th>Slug</th><th>Live</th><th>Products</th><th>Verified reviews</th><th>Order</th><th></th></tr></thead>
        <tbody>
          {cats.map((c) => (
            <tr key={c.id}>
              <td><EntityImage url={c.image_url} name={c.name_en} size={44} showName /></td>
              <td><b>{c.name_en}</b><div className="muted small" dir="rtl">{c.name_ar}</div></td>
              <td className="small">{c.slug}{c.parent_id && <div className="muted">sub-tag of {parentName.get(c.parent_id)}</div>}</td>
              <td>{c.is_live ? '✔' : '—'}</td>
              <td className={(nProducts.get(c.id) ?? 0) >= 5 ? '' : 'muted'}>{nProducts.get(c.id) ?? 0}/5</td>
              <td className={(nReviews.get(c.id) ?? 0) >= 3 ? '' : 'muted'}>{nReviews.get(c.id) ?? 0}/3</td>
              <td>{c.sort_order}</td>
              <td className="actions">
                {!manage && images && (
                  <form action={setCategoryImage} className="inline-upload">
                    <input type="hidden" name="id" value={c.id} />
                    <input name="image_url" type="url" placeholder="Image URL (https://...)" />
                    <span className="or">or</span>
                    <input name="image" type="file" accept="image/png,image/jpeg,image/webp" />
                    <button className="btn-ghost">Save image</button>
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
