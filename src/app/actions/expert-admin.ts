'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/current-user';
import { back, dbMessage, slugify, str } from '@/lib/form';

/* ----------------------- software typed by experts that is not in the catalogue ----------------------- */
const PENDING = '/admin/pending-software';

/** The admin matches the typed name to a product that already exists: the review now links to that product page. */
export async function matchPendingSoftware(fd: FormData) {
  await requirePermission('software.manage');
  const id = str(fd, 'id', 60), softwareId = str(fd, 'software_id', 60);
  if (!softwareId) return back(PENDING, 'error', 'Choose the product it matches.');
  const { data: p } = await db().from('rv_pending_software').select('id,review_id').eq('id', id).maybeSingle();
  if (!p) return back(PENDING, 'error', 'Not found.');
  const { error } = await db().from('rv_expert_software_reviews').update({ software_id: softwareId, custom_software_name: null }).eq('id', p.review_id);
  if (error) return back(PENDING, 'error', error.code === '23505' ? 'That expert already has a review for this product.' : dbMessage(error));
  await db().from('rv_pending_software').update({ status: 'matched', software_id: softwareId, resolved_at: new Date().toISOString() }).eq('id', id);
  revalidatePath(PENDING);
  return back(PENDING, 'ok', 'Matched. The review now links to the product page.');
}

/** The admin creates a new product from the typed name (after checking it is real) and links the review to it. */
export async function createFromPendingSoftware(fd: FormData) {
  await requirePermission('software.manage');
  const id = str(fd, 'id', 60), name = str(fd, 'name', 120), categoryId = str(fd, 'category_id', 60);
  if (!name || !categoryId) return back(PENDING, 'error', 'Name and category are required.');
  const { data: p } = await db().from('rv_pending_software').select('id,review_id').eq('id', id).maybeSingle();
  if (!p) return back(PENDING, 'error', 'Not found.');
  const { data: sw, error } = await db().from('rv_software').insert({
    name, display_name: name, category_id: categoryId, slug: slugify(name), sort_order: 0, updated_at: new Date().toISOString(),
  }).select('id').single();
  if (error || !sw) return back(PENDING, 'error', dbMessage(error, 'Could not create the product (is there one with this name already? Use "Match" instead).'));
  await db().from('rv_expert_software_reviews').update({ software_id: sw.id, custom_software_name: null }).eq('id', p.review_id);
  await db().from('rv_pending_software').update({ status: 'created', software_id: sw.id, resolved_at: new Date().toISOString() }).eq('id', id);
  revalidatePath(PENDING);
  return back(PENDING, 'ok', 'Product created and linked to the review.');
}

export async function dismissPendingSoftware(fd: FormData) {
  await requirePermission('software.manage');
  await db().from('rv_pending_software').update({ status: 'dismissed', resolved_at: new Date().toISOString() }).eq('id', str(fd, 'id', 60));
  revalidatePath(PENDING);
  return back(PENDING, 'ok', 'Dismissed. The review stays without a product page.');
}

/* ----------------------- function lists (admin editable) ----------------------- */
const FUNCS = '/admin/functions';
const GROUPS = ['accounting', 'erp_extra', 'pos'];

export async function saveFunctionOption(fd: FormData) {
  await requirePermission('software.manage');
  const id = str(fd, 'id', 60), group = str(fd, 'function_group', 20), nameEn = str(fd, 'name_en', 160), nameAr = str(fd, 'name_ar', 160);
  if (!GROUPS.includes(group) || !nameEn || !nameAr) return back(FUNCS, 'error', 'Group, English name and Arabic name are required.');
  const row = { function_group: group, name_en: nameEn, name_ar: nameAr, sort_order: Number(fd.get('sort_order')) || 0, is_active: fd.get('is_active') === 'on' || !id };
  const { error } = id
    ? await db().from('rv_function_options').update(row).eq('id', id)
    : await db().from('rv_function_options').insert({ ...row, code: slugify(nameEn).replace(/-/g, '_').slice(0, 40) || `fn_${Date.now().toString(36)}` });
  revalidatePath(FUNCS);
  return error ? back(FUNCS, 'error', dbMessage(error)) : back(FUNCS, 'ok', id ? 'Function updated.' : 'Function added.');
}

/** Deactivate instead of deleting, so old reviews that used the function keep their label. */
export async function deleteFunctionOption(fd: FormData) {
  await requirePermission('software.manage');
  await db().from('rv_function_options').update({ is_active: false }).eq('id', str(fd, 'id', 60));
  revalidatePath(FUNCS);
  return back(FUNCS, 'ok', 'Function hidden from new reviews.');
}

export async function setCategoryFunctionGroup(fd: FormData) {
  await requirePermission('software.manage');
  const group = str(fd, 'function_group', 20);
  if (!['accounting', 'erp', 'pos'].includes(group)) return back(FUNCS, 'error', 'Choose POS, ERP or Accounting.');
  const { error } = await db().from('rv_categories').update({ function_group: group }).eq('id', str(fd, 'id', 60));
  revalidatePath(FUNCS);
  return error ? back(FUNCS, 'error', dbMessage(error)) : back(FUNCS, 'ok', 'Category updated.');
}
