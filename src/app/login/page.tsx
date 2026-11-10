import { redirect } from 'next/navigation';
import { login } from '@/app/actions/auth';
import Flash from '@/components/Flash';
import Link from 'next/link';
import { getCurrentUser, homePath } from '@/lib/auth/current-user';
import Footer from '@/components/Footer';
import TrustBar from '@/components/TrustBar';
import LangSwitch from '@/components/LangSwitch';
import { getLang } from '@/lib/i18n';
import { authText, errorsAr } from '@/lib/auth-text';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const me = await getCurrentUser();
  if (me) redirect(homePath(me));
  const sp = await searchParams;
  const lang = await getLang();
  const t = authText(lang);
  return (
    <>
    <TrustBar lang={lang} />
    <main className="login-wrap" style={{ minHeight: 'calc(100vh - 150px)' }}>
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <LangSwitch lang={lang} to="/login" />
      <form action={login} className="login-card" style={{ maxWidth: 'none' }}>
        <div className="brand big"><span className="logo">N</span>Nexiz AI</div>
        <h1>{t.signIn}</h1>
        <Flash error={sp.error} map={lang === 'ar' ? errorsAr : undefined} />
        <label>{t.email}<input name="email" type="email" required autoComplete="username" autoFocus dir="ltr" /></label>
        <label>{t.password}<input name="password" type="password" required autoComplete="current-password" dir="ltr" /></label>
        <button className="btn-primary wide">{t.signIn}</button>
        <Link href="/register" className="btn-ghost wide" style={{ textAlign: 'center' }}>{t.registerBtn}</Link>
        {/* <Link href="/products" className="btn-ghost wide" style={{ textAlign: 'center' }}>{t.browse}</Link> */}
      </form>
      </div>
    </main>
    <Footer lang={lang} />
    </>
  );
}