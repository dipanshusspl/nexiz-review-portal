import Link from 'next/link';
import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import { can, canOpenAdmin, requireUser } from '@/lib/auth/current-user';
import { getDict, getLang } from '@/lib/i18n';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!canOpenAdmin(user)) redirect('/review?error=forbidden');
  const lang = await getLang();
  const nav = [
    { href: '/admin', label: 'Dashboard', show: true },
    { href: '/admin/roles', label: 'Roles', show: can(user, 'roles.manage') },
    { href: '/admin/users', label: 'Users', show: can(user, 'users.manage') },
    { href: '/admin/categories', label: 'Categories', show: can(user, 'categories.manage') || can(user, 'images.manage') },
    { href: '/admin/software', label: 'Software', show: can(user, 'software.manage') || can(user, 'images.manage') },
  ];
  return (
    <>
      <Header user={user} lang={lang} t={getDict(lang)} current="/admin" />
      <div className="admin" dir="ltr" lang="en">
        <nav className="admin-nav">
          {nav.filter((n) => n.show).map((n) => <Link key={n.href} href={n.href}>{n.label}</Link>)}
        </nav>
        <main className="admin-main">{children}</main>
      </div>
    </>
  );
}
