'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/supabase/admin';
import { requirePermission, can } from '@/lib/auth/current-user';
import { hashPassword, passwordProblem } from '@/lib/auth/password';
import { ADMIN_ROLE, ALL_PERMISSIONS } from '@/lib/permissions';
import { ImageError, removeImage, resolveImage } from '@/lib/storage';
import { back, dbMessage, isEmail, optional, slugify, str } from '@/lib/form';

const done = (path: string, msg: string) => { revalidatePath('/admin', 'layout'); revalidatePath('/review'); return back(path, 'ok', msg); };

async function maybeUpload(fd: FormData, folder: 'categories' | 'software'): Promise<string | null> {
  return resolveImage(fd, folder); // URL first, then file upload
}

const imgError = (path: string, e: unknown) => back(path, 'error', e instanceof ImageError ? e.message : 'Image could not be saved.');

/* ------------------------------ ROLES ------------------------------ */
export async function saveRole(fd: FormData) {
  await requirePermission('roles.manage');
  const id = str(fd, 'id', 60);
  const perms = fd.getAll('permissions').map(String).filter((p) => ALL_PERMISSIONS.includes(p));
  const name = str(fd, 'name', 40).toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  const description = optional(fd, 'description', 200);
  const path = '/admin/roles';
  if (id) {
    const { data: role } = await db().from('rv_roles').select('is_system,name').eq('id', id).single();
    if (!role) return back(path, 'error', 'Role not found.');
    const patch: Record<string, unknown> = { description, permissions: role.name === ADMIN_ROLE ? ALL_PERMISSIONS : perms };
    if (!role.is_system && name) patch.name = name;
    const { error } = await db().from('rv_roles').update(patch).eq('id', id);
    return error ? back(path, 'error', dbMessage(error)) : done(path, 'Role updated.');
  }
  if (!name) return back(path, 'error', 'Role name is required.');
  const { error } = await db().from('rv_roles').insert({ name, description, permissions: perms });
  return error ? back(path, 'error', dbMessage(error)) : done(path, `Role "${name}" created.`);
}

export async function deleteRole(fd: FormData) {
  await requirePermission('roles.manage');
  const id = str(fd, 'id', 60);
  const { data: role } = await db().from('rv_roles').select('is_system').eq('id', id).single();
  if (!role) return back('/admin/roles', 'error', 'Role not found.');
  if (role.is_system) return back('/admin/roles', 'error', 'System roles cannot be deleted.');
  const { error } = await db().from('rv_roles').delete().eq('id', id);
  return error ? back('/admin/roles', 'error', 'Role is still assigned to users. Move those users first.') : done('/admin/roles', 'Role deleted.');
}

/* ------------------------------ USERS ------------------------------ */
function roleNameOf(row: { role?: unknown } | null | undefined): string | undefined {
  const r = row?.role as { name?: string } | { name?: string }[] | null | undefined;
  return Array.isArray(r) ? r[0]?.name : r?.name;
}

async function otherActiveAdmins(exceptUserId: string): Promise<number> {
  const { data: r } = await db().from('rv_roles').select('id').eq('name', ADMIN_ROLE).single();
  if (!r) return 0;
  const { count } = await db().from('rv_users').select('id', { count: 'exact', head: true })
    .eq('role_id', r.id).eq('is_active', true).neq('id', exceptUserId);
  return count ?? 0;
}

export async function saveUser(fd: FormData) {
  const me = await requirePermission('users.manage');
  const id = str(fd, 'id', 60);
  const path = '/admin/users';
  const fullName = str(fd, 'full_name', 120);
  const email = str(fd, 'email', 254).toLowerCase();
  const roleId = str(fd, 'role_id', 60);
  const password = String(fd.get('password') ?? '');
  const isActive = fd.get('is_active') === 'on';
  const fieldAgent = fd.get('field_agent') === 'on';
  if (!fullName || !roleId) return back(path, 'error', 'Name and role are required.');

  if (!id) {
    if (!isEmail(email)) return back(path, 'error', 'Enter a valid email.');
    const problem = passwordProblem(password);
    if (problem) return back(path, 'error', problem);
    const { error } = await db().from('rv_users').insert({
      email, full_name: fullName, role_id: roleId, password_hash: await hashPassword(password), is_active: true, field_agent: fieldAgent,
    });
    return error ? back(path, 'error', dbMessage(error)) : done(path, `User ${email} created.`);
  }

  const { data: current } = await db().from('rv_users').select('role:rv_roles(name)').eq('id', id).single();
  const curRole = roleNameOf(current);
  const { data: newRole } = await db().from('rv_roles').select('name').eq('id', roleId).single();
  const losesAdmin = curRole === ADMIN_ROLE && (newRole?.name !== ADMIN_ROLE || !isActive);
  if (losesAdmin && (await otherActiveAdmins(id)) === 0) {
    return back(path, 'error', 'You cannot remove or deactivate the last active admin.');
  }
  if (id === me.id && !isActive) return back(path, 'error', 'You cannot deactivate yourself.');
  const patch: Record<string, unknown> = { full_name: fullName, role_id: roleId, is_active: isActive, field_agent: fieldAgent };
  if (password) {
    const problem = passwordProblem(password);
    if (problem) return back(path, 'error', problem);
    patch.password_hash = await hashPassword(password);
    patch.failed_attempts = 0; patch.locked_until = null;
  }
  const { error } = await db().from('rv_users').update(patch).eq('id', id);
  return error ? back(path, 'error', dbMessage(error)) : done(path, 'User updated.');
}

export async function deleteUser(fd: FormData) {
  const me = await requirePermission('users.manage');
  const id = str(fd, 'id', 60);
  if (id === me.id) return back('/admin/users', 'error', 'You cannot delete yourself.');
  const { data: u } = await db().from('rv_users').select('role:rv_roles(name)').eq('id', id).single();
  const roleName = roleNameOf(u);
  if (roleName === ADMIN_ROLE && (await otherActiveAdmins(id)) === 0) {
    return back('/admin/users', 'error', 'You cannot delete the last active admin.');
  }
  const { error } = await db().from('rv_users').delete().eq('id', id);
  return error ? back('/admin/users', 'error', dbMessage(error)) : done('/admin/users', 'User deleted.');
}

/* ---------------------------- CATEGORIES ---------------------------- */
export async function saveCategory(fd: FormData) {
  const me = await requirePermission('categories.manage');
  const path = '/admin/categories';
  const id = str(fd, 'id', 60);
  const nameEn = str(fd, 'name_en', 100);
  if (!nameEn) return back(path, 'error', 'English name is required.');
  const row: Record<string, unknown> = {
    name_en: nameEn, name_ar: optional(fd, 'name_ar', 100),
    slug: slugify(str(fd, 'slug', 80) || nameEn), sort_order: Number(fd.get('sort_order')) || 0,
    is_live: fd.get('is_live') === 'on', live_override: fd.get('live_override') === 'on', parent_id: optional(fd, 'parent_id', 60),
    updated_at: new Date().toISOString(),
  };
  if (can(me, 'images.manage')) {
    try {
      const url = await maybeUpload(fd, 'categories');
      if (url) {
        if (id) { const { data: old } = await db().from('rv_categories').select('image_url').eq('id', id).single(); await removeImage(old?.image_url); }
        row.image_url = url;
      }
    } catch (e) { return imgError(path, e); }
  }
  const { error } = id ? await db().from('rv_categories').update(row).eq('id', id) : await db().from('rv_categories').insert(row);
  return error ? back(path, 'error', dbMessage(error)) : done(path, id ? 'Category updated.' : 'Category created.');
}

export async function deleteCategory(fd: FormData) {
  await requirePermission('categories.manage');
  const id = str(fd, 'id', 60);
  const { data: old } = await db().from('rv_categories').select('image_url').eq('id', id).single();
  const { error } = await db().from('rv_categories').delete().eq('id', id);
  if (error) return back('/admin/categories', 'error', 'This category still has software. Delete or move that software first.');
  await removeImage(old?.image_url);
  return done('/admin/categories', 'Category deleted.');
}

/** Image-only update for people who have images.manage but not categories.manage (e.g. the expert role). */
export async function setCategoryImage(fd: FormData) {
  await requirePermission('images.manage');
  const path = '/admin/categories';
  const id = str(fd, 'id', 60);
  try {
    const url = await maybeUpload(fd, 'categories');
    if (!url) return back(path, 'error', 'Enter an image URL or choose a file first.');
    const { data: old } = await db().from('rv_categories').select('image_url').eq('id', id).single();
    const { error } = await db().from('rv_categories').update({ image_url: url, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return back(path, 'error', dbMessage(error));
    await removeImage(old?.image_url);
  } catch (e) { return imgError(path, e); }
  return done(path, 'Image updated.');
}

/* ----------------------------- SOFTWARE ----------------------------- */
export async function saveSoftware(fd: FormData) {
  const me = await requirePermission('software.manage');
  const path = '/admin/software';
  const id = str(fd, 'id', 60);
  const name = str(fd, 'name', 120);
  const categoryId = str(fd, 'category_id', 60);
  if (!name || !categoryId) return back(path, 'error', 'Name and category are required.');
  const row: Record<string, unknown> = {
    name, display_name: optional(fd, 'display_name', 120) ?? name, category_id: categoryId, slug: slugify(str(fd, 'slug', 80) || name),
    website: optional(fd, 'website', 300), description: optional(fd, 'description', 1000),
    sort_order: Number(fd.get('sort_order')) || 0, updated_at: new Date().toISOString(),
  };
  if (can(me, 'images.manage')) {
    try {
      const url = await maybeUpload(fd, 'software');
      if (url) {
        if (id) { const { data: old } = await db().from('rv_software').select('image_url').eq('id', id).single(); await removeImage(old?.image_url); }
        row.image_url = url;
      }
    } catch (e) { return imgError(path, e); }
  }
  const { error } = id ? await db().from('rv_software').update(row).eq('id', id) : await db().from('rv_software').insert(row);
  return error ? back(path, 'error', dbMessage(error)) : done(path, id ? 'Software updated.' : 'Software created.');
}

export async function deleteSoftware(fd: FormData) {
  await requirePermission('software.manage');
  const id = str(fd, 'id', 60);
  const { data: old } = await db().from('rv_software').select('image_url').eq('id', id).single();
  const { error } = await db().from('rv_software').delete().eq('id', id);
  if (error) return back('/admin/software', 'error', dbMessage(error));
  await removeImage(old?.image_url);
  return done('/admin/software', 'Software deleted (its reviews were deleted too).');
}

export async function setSoftwareImage(fd: FormData) {
  await requirePermission('images.manage');
  const path = '/admin/software';
  const id = str(fd, 'id', 60);
  try {
    const url = await maybeUpload(fd, 'software');
    if (!url) return back(path, 'error', 'Choose an image first.');
    const { data: old } = await db().from('rv_software').select('image_url').eq('id', id).single();
    const { error } = await db().from('rv_software').update({ image_url: url, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return back(path, 'error', dbMessage(error));
    await removeImage(old?.image_url);
  } catch (e) { return imgError(path, e); }
  return done(path, 'Image updated.');
}
