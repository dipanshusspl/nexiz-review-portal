import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/app/actions/password-reset';
import Flash from '@/components/Flash';
import Footer from '@/components/Footer';
import TrustBar from '@/components/TrustBar';
import LangSwitch from '@/components/LangSwitch';
import { RESET_COOKIE, verifyResetToken } from '@/lib/auth/password-reset';
import { getLang } from '@/lib/i18n';
import { authText, errorsAr } from '@/lib/auth-text';

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  // Only reachable after the emailed code was entered correctly.
  const ok = await verifyResetToken((await cookies()).get(RESET_COOKIE)?.value);
  if (!ok) redirect('/forgot-password');
  const sp = await searchParams;
  const lang = await getLang();
  const t = authText(lang);
  return (
    <>
    <TrustBar lang={lang} />
    <main className="login-wrap" style={{ minHeight: 'calc(100vh - 150px)' }}>
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <LangSwitch lang={lang} to="/forgot-password/reset" />
      <form action={resetPassword} className="login-card" style={{ maxWidth: 'none' }}>
        <div className="brand big"><span className="logo">N</span>Nexiz AI</div>
        <h1>{t.resetTitle}</h1>
        <Flash error={sp.error} map={lang === 'ar' ? errorsAr : undefined} />
        <label>{t.newPassword}<input name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" autoFocus dir="ltr" /></label>
        <label>{t.confirmNew}<input name="confirm" type="password" required minLength={8} maxLength={72} autoComplete="new-password" dir="ltr" /></label>
        <p className="muted small">{t.rules}</p>
        <button className="btn-primary wide">{t.saveNew}</button>
        <Link href="/login" className="btn-ghost wide" style={{ textAlign: 'center' }}>{t.backToLogin}</Link>
      </form>
      </div>
    </main>
    <Footer lang={lang} />
    </>
  );
}
