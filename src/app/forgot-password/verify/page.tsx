import { redirect } from 'next/navigation';
import Link from 'next/link';
import { resendPasswordOtp, verifyPasswordOtp } from '@/app/actions/password-reset';
import Flash from '@/components/Flash';
import Footer from '@/components/Footer';
import TrustBar from '@/components/TrustBar';
import LangSwitch from '@/components/LangSwitch';
import { getCurrentUser, homePath } from '@/lib/auth/current-user';
import { getLang } from '@/lib/i18n';
import { authText, errorsAr } from '@/lib/auth-text';

export default async function VerifyOtpPage({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; email?: string }> }) {
  const me = await getCurrentUser();
  if (me) redirect(homePath(me));
  const sp = await searchParams;
  const email = (sp.email ?? '').trim().toLowerCase();
  if (!email) redirect('/forgot-password');
  const lang = await getLang();
  const t = authText(lang);
  return (
    <>
    <TrustBar lang={lang} />
    <main className="login-wrap" style={{ minHeight: 'calc(100vh - 150px)' }}>
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <LangSwitch lang={lang} to={`/forgot-password/verify?email=${encodeURIComponent(email)}`} />
      <form action={verifyPasswordOtp} className="login-card" style={{ maxWidth: 'none' }}>
        <div className="brand big"><span className="logo">N</span>Nexiz AI</div>
        <h1>{t.verifyTitle}</h1>
        <Flash ok={sp.ok} error={sp.error} map={lang === 'ar' ? errorsAr : undefined} />
        <p className="muted small">{t.verifyHelp} <bdi dir="ltr"><b>{email}</b></bdi></p>
        <input type="hidden" name="email" value={email} />
        <label>{t.code}
          <input name="code" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" autoFocus dir="ltr"
            placeholder="000000" style={{ letterSpacing: 8, textAlign: 'center', fontSize: 22 }} />
        </label>
        <button className="btn-primary wide">{t.verify}</button>
        <button className="btn-ghost wide" formAction={resendPasswordOtp} formNoValidate>{t.resend}</button>
        <Link href="/forgot-password" className="btn-ghost wide" style={{ textAlign: 'center' }}>{t.changeEmail}</Link>
      </form>
      </div>
    </main>
    <Footer lang={lang} />
    </>
  );
}
