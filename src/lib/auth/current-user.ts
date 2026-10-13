import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { ADMIN_ROLE, type PermissionKey } from '@/lib/permissions';
import { SESSION_COOKIE, verifySession } from './session';

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  roleName: string;
  permissions: string[];
};

/** Reads the signed cookie, then loads the user + role FRESH from the DB (role changes apply at once). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const jar = await cookies();
  const id = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!id) return null;
  const { data } = await db()
    .from('rv_users')
    .select('id,email,full_name,is_active,role_id,role:rv_roles(id,name,permissions)')
    .eq('id', id)
    .maybeSingle();
  if (!data || !data.is_active) return null;
  const role = (Array.isArray(data.role) ? data.role[0] : data.role) as
    | { id: string; name: string; permissions: string[] } | null;
  if (!role) return null;
  return {
    id: data.id, email: data.email, fullName: data.full_name,
    roleId: data.role_id, roleName: role.name, permissions: role.permissions ?? [],
  };
});

export function can(user: CurrentUser | null, perm: PermissionKey): boolean {
  if (!user) return false;
  return user.roleName === ADMIN_ROLE || user.permissions.includes(perm);
}

export const canOpenAdmin = (u: CurrentUser | null) =>
  can(u, 'users.manage') || can(u, 'roles.manage') || can(u, 'categories.manage') ||
  can(u, 'software.manage') || can(u, 'images.manage');

  export const isExpertPanelUser = (u: CurrentUser | null): boolean =>
  !!u && u.roleName !== ADMIN_ROLE && u.permissions.includes('expert.panel');

export const homePath = (u: CurrentUser | null): string => (isExpertPanelUser(u) ? '/expert' : '/review');


export async function requireUser(): Promise<CurrentUser> {
  const u = await getCurrentUser();
  if (!u) redirect('/login');
  return u;
}

export async function requirePermission(perm: PermissionKey): Promise<CurrentUser> {
  const u = await requireUser();
  if (!can(u, perm)) redirect('/review?error=forbidden');
  return u;
}
