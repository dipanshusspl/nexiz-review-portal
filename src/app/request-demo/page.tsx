// Added by Prachi, 2026-11-17: the "Request a Demo" form, opened by /go/demo?slug=<slug> (which logs the click first).
// Shown in a pop-up on the product page (embed=1) or as a normal page.
// Open without login (see middleware.ts). Name and email are filled in for a logged-in visitor, but can be changed.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { submitDemo } from '@/app/actions/demo';
import Flash from '@/components/Flash';
import Footer from '@/components/Footer';
import LangSwitch from '@/components/LangSwitch';
import TrustBar from '@/components/TrustBar';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getLang } from '@/lib/i18n';
import { db } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const TXT = {
  en: {
    title: 'Request a demo', for: 'Product', name: 'Your name', email: 'Business email', company: 'Company name', cr: 'CR number (optional)',
    crHint: '10 digits', consent: 'I agree that Nexiz may share these details with the vendor of this product so they can contact me.',
    send: 'Send request', doneTitle: 'Request sent', doneText: 'Your Lead ID is {id}. Keep it if you need to refer to this request.', back: 'Back to the product',
    errors: { required: 'Please fill in your name and company.', email: 'Please enter a valid email address.', cr: 'The CR number must be 10 digits.', consent: 'Please tick the box to allow sharing your details with the vendor.', product: 'That product was not found.', save: 'Your request could not be saved. Please try again.' } as Record<string, string>,
  },
  ar: {
    title: 'اطلب عرضًا تجريبيًا', for: 'المنتج', name: 'اسمك', email: 'البريد الإلكتروني للعمل', company: 'اسم الشركة', cr: 'رقم السجل التجاري (اختياري)',
    crHint: '١٠ أرقام', consent: 'أوافق على أن تشارك Nexiz هذه البيانات مع مورّد هذا المنتج ليتواصل معي.',
    send: 'إرسال الطلب', doneTitle: 'تم إرسال الطلب', doneText: 'رقم طلبك هو {id}. احتفظ به للرجوع إلى هذا الطلب.', back: 'العودة إلى المنتج',
    errors: { required: 'يرجى إدخال الاسم واسم الشركة.', email: 'يرجى إدخال بريد إلكتروني صحيح.', cr: 'يجب أن يتكوّن رقم السجل التجاري من ١٠ أرقام.', consent: 'يرجى تحديد المربع للسماح بمشاركة بياناتك مع المورّد.', product: 'لم يتم العثور على المنتج.', save: 'تعذّر حفظ طلبك. حاول مرة أخرى.' } as Record<string, string>,
  },
};

export default async function RequestDemoPage({ searchParams }: { searchParams: Promise<{ product?: string; click?: string; done?: string; error?: string; embed?: string }> }) {
  const sp = await searchParams;
  const slug = (sp.product ?? '').trim();
  if (!slug) notFound();
  const { data: sw } = await db().from('rv_software').select('slug,name,display_name').eq('slug', slug).maybeSingle();
  if (!sw) notFound();

  const lang = await getLang();
  const x = TXT[lang];
  const me = await getCurrentUser().catch(() => null);
  const product = (sw.display_name || sw.name) as string;
  const embed = sp.embed === '1';   // opened inside the pop-up on the product page: no header, footer or language switch

  return (
    <>
      {!embed && <TrustBar lang={lang} />}
      <main className="login-wrap" style={{ minHeight: embed ? undefined : 'calc(100vh - 150px)' }}>
        <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!embed && <LangSwitch lang={lang} to={`/request-demo?product=${encodeURIComponent(slug)}`} />}
          <Flash error={sp.error ? x.errors[sp.error] ?? x.errors.save : undefined} />
          {sp.done ? (
            <div className="login-card" style={{ maxWidth: 'none' }}>
              <h1>{x.doneTitle}</h1>
              <p>{x.doneText.replace('{id}', sp.done)}</p>
              {embed
                ? <a href={`/profilepage/${slug}`} target="_top" className="btn-ghost wide" style={{ textAlign: 'center' }}>{x.back}</a>
                : <Link href={`/profilepage/${slug}`} className="btn-ghost wide" style={{ textAlign: 'center' }}>{x.back}</Link>}
            </div>
          ) : (
            <form action={submitDemo} className="login-card" style={{ maxWidth: 'none' }}>
              <h1>{x.title}</h1>
              <p className="muted small">{x.for}: <b>{product}</b></p>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="click" value={sp.click ?? ''} />
              {embed && <input type="hidden" name="embed" value="1" />}
              <label>{x.name}<input name="name" required maxLength={120} defaultValue={me?.fullName ?? ''} autoComplete="name" /></label>
              <label>{x.email}<input name="email" type="email" required maxLength={254} defaultValue={me?.email ?? ''} autoComplete="email" dir="ltr" /></label>
              <label>{x.company}<input name="company" required maxLength={120} autoComplete="organization" /></label>
              <label>{x.cr} <small className="muted">({x.crHint})</small><input name="cr_number" inputMode="numeric" pattern="\d{10}" maxLength={10} dir="ltr" /></label>
              {/* unchecked on purpose: the visitor has to tick it */}
              <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontWeight: 400 }}>
                <input type="checkbox" name="consent" required style={{ width: 'auto', marginTop: 4 }} />
                <span className="small">{x.consent}</span>
              </label>
              <button className="btn-demo wide">{x.send}</button>
            </form>
          )}
        </div>
      </main>
      {!embed && <Footer lang={lang} />}
    </>
  );
}