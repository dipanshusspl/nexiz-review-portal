import Footer from '@/components/Footer';
import PublicHeader from '@/components/PublicHeader';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getLang } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

/** PLACEHOLDER: the legal text (PDPL notice, retention period, contact for data requests) must come from Nexiz. */
export default async function Privacy() {
  const lang = await getLang();
  const user = await getCurrentUser();
  const ar = lang === 'ar';
  return (
    <>
      <PublicHeader lang={lang} current="/privacy" loggedIn={!!user} t={ar ? { login: 'تسجيل الدخول', reviewIt: 'قيّم برنامجًا' } : { login: 'Log in', reviewIt: 'Review software' }} />
      <main className="page narrow" style={{ maxWidth: 720 }}>
        <h1 className="title">{ar ? 'الخصوصية' : 'Privacy'}</h1>
        <p className="muted">{ar ? 'سيُضاف نص إشعار الخصوصية ونظام حماية البيانات الشخصية (PDPL) هنا قبل الإطلاق.' : 'The privacy notice and PDPL text will be added here before launch.'}</p>
      </main>
      <Footer lang={lang} />
    </>
  );
}
