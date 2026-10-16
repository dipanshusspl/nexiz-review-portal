import { redirect } from 'next/navigation';
import { login } from '@/app/actions/auth';
import Flash from '@/components/Flash';
import Link from 'next/link';
import { getCurrentUser, homePath } from '@/lib/auth/current-user';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const me = await getCurrentUser();
  if (me) redirect(homePath(me));
  const sp = await searchParams;
  return (
    <main className="login-wrap">
      <form action={login} className="login-card">
        <div className="brand big"><span className="logo">N</span>Nexiz AI</div>
        <h1>Sign in</h1>
        <Flash error={sp.error} />
        <label>Email<input name="email" type="email" required autoComplete="username" autoFocus /></label>
        <label>Password<input name="password" type="password" required autoComplete="current-password" /></label>
        <button className="btn-primary wide">Sign in</button>
        <p className="muted small">Accounts are created by an administrator.</p>
        <Link href="/products" className="btn-ghost wide" style={{ textAlign: 'center' }}>Browse products and reviews (no login)</Link>
      </form>
    </main>
  );
}
