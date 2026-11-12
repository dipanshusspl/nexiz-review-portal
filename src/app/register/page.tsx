import { redirect } from 'next/navigation';
import Link from 'next/link';
import { registerExpert } from '@/app/actions/register';
import Flash from '@/components/Flash';
import Footer from '@/components/Footer';
import TrustBar from '@/components/TrustBar';
import LangSwitch from '@/components/LangSwitch';
import { getCurrentUser, homePath } from '@/lib/auth/current-user';
import { getLang } from '@/lib/i18n';
import { authText, errorsAr } from '@/lib/auth-text';

export default async function RegisterPage({ searchParams }: {
  searchParams: Promise<{ error?: string; name?: string; email?: string }>;
}) {
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
      <LangSwitch lang={lang} to="/register" />
      <form action={registerExpert} className="login-card" style={{ maxWidth: 'none' }}>
        <div className="brand big"><span className="logo">N</span>Nexiz AI</div>
        <h1>{t.registerTitle}</h1>
        <Flash error={sp.error} map={lang === 'ar' ? errorsAr : undefined} />
        <label>{t.fullName}<input name="full_name" required maxLength={120} defaultValue={sp.name ?? ''} autoComplete="name" autoFocus /></label>
        <label>{t.email}<input name="email" type="email" required defaultValue={sp.email ?? ''} autoComplete="email" dir="ltr" /></label>
        <label>{t.password}<input name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" dir="ltr" /></label>
        <label>{t.confirm}<input name="confirm" type="password" required minLength={8} maxLength={72} autoComplete="new-password" dir="ltr" /></label>
        <p className="muted small">{t.rules}</p>
        <button className="btn-primary wide">{t.register}</button>
        <Link href="/login" className="btn-ghost wide" style={{ textAlign: 'center' }}>{t.backToLogin}</Link>
      </form>
      </div>
    </main>
    <Footer lang={lang} />
    </>
  );
}