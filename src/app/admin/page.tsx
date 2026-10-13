import Link from 'next/link';
import { can, requireUser } from '@/lib/auth/current-user';
import { db } from '@/lib/supabase/admin';

async function count(table: string): Promise<number> {
  const { count } = await db().from(table).select('id', { count: 'exact', head: true });
  return count ?? 0;
}

export default async function AdminHome() {
  const user = await requireUser();
  const [roles, users, cats, sw, reviews] = await Promise.all([
    count('rv_roles'), count('rv_users'), count('rv_categories'), count('rv_software'), count('rv_reviews'),
  ]);
  const cards = [
    { href: '/admin/roles', title: 'Roles', n: roles, text: 'Create roles and choose what each role can do.', show: can(user, 'roles.manage') },
    { href: '/admin/users', title: 'Users', n: users, text: 'Create users and give each one a role.', show: can(user, 'users.manage') },
    { href: '/admin/categories', title: 'Categories', n: cats, text: 'Add, edit, delete categories and their images.', show: can(user, 'categories.manage') || can(user, 'images.manage') },
    { href: '/admin/software', title: 'Software', n: sw, text: 'Add, edit, delete software (projects) and their images.', show: can(user, 'software.manage') || can(user, 'images.manage') },
  ];
  return (
    <>
      <h2 className="title">Welcome, {user.fullName}</h2>
      <p className="muted">Reviews written so far: <b>{reviews}</b>. Start here:</p>
      <div className="cards">
        {cards.filter((c) => c.show).map((c) => (
          <Link key={c.href} href={c.href} className="card dash-card">
            <span className="num">{c.n}</span><b>{c.title}</b><span className="muted small">{c.text}</span>
          </Link>
        ))}
      </div>
      <p><Link href="/review" className="btn-ghost">Open the review screen →</Link></p>
    </>
  );
}
