import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requestPasswordReset } from '@/app/actions/password-reset';
import Flash from '@/components/Flash';
import Footer from '@/components/Footer';
import TrustBar from '@/components/TrustBar';
import LangSwitch from '@/components/LangSwitch';
import { getCurrentUser, homePath } from '@/lib/auth/current-user';
import { getLang } from '@/lib/i18n';
import { authText, errorsAr } from '@/lib/auth-text';

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string; email?: string }> }) {
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
      <LangSwitch lang={lang} to="/forgot-password" />
      <form action={requestPasswordReset} className="login-card" style={{ maxWidth: 'none' }}>
        <div className="brand big"><span className="logo">N</span>Nexiz AI</div>
        <h1>{t.forgotTitle}</h1>
        <Flash error={sp.error} map={lang === 'ar' ? errorsAr : undefined} />
        <p className="muted small">{t.forgotHelp}</p>
        <label>{t.email}<input name="email" type="email" required autoComplete="email" autoFocus dir="ltr" defaultValue={sp.email ?? ''} /></label>
        <button className="btn-primary wide">{t.sendCode}</button>
        <Link href="/login" className="btn-ghost wide" style={{ textAlign: 'center' }}>{t.backToLogin}</Link>
      </form>
      </div>
    </main>
    <Footer lang={lang} />
    </>
  );
}
