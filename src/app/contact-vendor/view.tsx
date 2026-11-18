// Added by Prachi, 2026-11-17: the "Contact Vendor" form. Shared by the three pages /contact-vendor/pricing, /contact-vendor/info and /contact-vendor/general
// (each opened by /go/contact?slug=<slug>&option=..., which logs the click first). Shown in a pop-up on the product page (embed=1) or as a normal page.
// Open without login (see middleware.ts). The pricing option also asks branches, system users, employees and business activity,
// unless we already hold them for the logged-in user.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { submitContact } from '@/app/actions/contact';
import Flash from '@/components/Flash';
import Footer from '@/components/Footer';
import LangSwitch from '@/components/LangSwitch';
import TrustBar from '@/components/TrustBar';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getLang } from '@/lib/i18n';
import { knownBusiness } from '@/lib/lead-profile';
import { RANGES } from '@/lib/lead-ranges';
import { db } from '@/lib/supabase/admin';

const TXT = {
  en: {
    title: 'Contact vendor', for: 'Product', opt: { pricing: 'Pricing & Quotation', info: 'More Information', general: 'General Inquiry' } as Record<string, string>,
    name: 'Your name', email: 'Business email', company: 'Company name', cr: 'CR number (optional)', crHint: '10 digits',
    branches: 'Number of branches', users: 'Number of system users', employees: 'Number of employees', activity: 'Business activity', message: 'Message (optional)',
    bizTitle: 'Business requirements', choose: 'Select…',
    haveBiz: 'We already have your business details, so we are not asking for them again.',
    consent: 'I agree that Nexiz may share these details with the vendor of this product so they can contact me.',
    send: 'Send request', doneTitle: 'Request sent', doneText: 'Your Lead ID is {id}. Keep it if you need to refer to this request.', back: 'Back to the product',
    errors: { required: 'Please fill in your name and company.', email: 'Please enter a valid email address.', cr: 'The CR number must be 10 digits.', consent: 'Please tick the box to allow sharing your details with the vendor.', pricing: 'Please choose the number of branches, system users and employees, and enter your business activity.', option: 'Invalid request type.', product: 'That product was not found.', save: 'Your request could not be saved. Please try again.' } as Record<string, string>,
  },
  ar: {
    title: 'تواصل مع المورّد', for: 'المنتج', opt: { pricing: 'الأسعار وعروض الأسعار', info: 'مزيد من المعلومات', general: 'استفسار عام' } as Record<string, string>,
    name: 'اسمك', email: 'البريد الإلكتروني للعمل', company: 'اسم الشركة', cr: 'رقم السجل التجاري (اختياري)', crHint: '١٠ أرقام',
    branches: 'عدد الفروع', users: 'عدد مستخدمي النظام', employees: 'عدد الموظفين', activity: 'النشاط التجاري', message: 'رسالة (اختياري)',
    bizTitle: 'متطلبات العمل', choose: 'اختر…',
    haveBiz: 'لدينا بيانات نشاطك التجاري مسبقًا، لذلك لن نطلبها مرة أخرى.',
    consent: 'أوافق على أن تشارك Nexiz هذه البيانات مع مورّد هذا المنتج ليتواصل معي.',
    send: 'إرسال الطلب', doneTitle: 'تم إرسال الطلب', doneText: 'رقم طلبك هو {id}. احتفظ به للرجوع إلى هذا الطلب.', back: 'العودة إلى المنتج',
    errors: { required: 'يرجى إدخال الاسم واسم الشركة.', email: 'يرجى إدخال بريد إلكتروني صحيح.', cr: 'يجب أن يتكوّن رقم السجل التجاري من ١٠ أرقام.', consent: 'يرجى تحديد المربع للسماح بمشاركة بياناتك مع المورّد.', pricing: 'يرجى اختيار عدد الفروع والمستخدمين والموظفين وإدخال النشاط التجاري.', option: 'نوع الطلب غير صالح.', product: 'لم يتم العثور على المنتج.', save: 'تعذّر حفظ طلبك. حاول مرة أخرى.' } as Record<string, string>,
  },
};

export type ContactSearch = { product?: string; click?: string; done?: string; error?: string; embed?: string };

export default async function ContactVendorView({ option, sp }: { option: 'pricing' | 'info' | 'general'; sp: ContactSearch }) {
  const slug = (sp.product ?? '').trim();
  if (!slug) notFound();
  const { data: sw } = await db().from('rv_software').select('slug,name,display_name').eq('slug', slug).maybeSingle();
  if (!sw) notFound();

  const lang = await getLang();
  const x = TXT[lang];
  const me = await getCurrentUser().catch(() => null);
  const known = option === 'pricing' && me ? await knownBusiness(me.id) : null;
  const product = (sw.display_name || sw.name) as string;
  const embed = sp.embed === '1';   // opened inside the pop-up on the product page: no header, footer or language switch
  const self = `/contact-vendor/${option}?product=${encodeURIComponent(slug)}`;

  return (
    <>
      {!embed && <TrustBar lang={lang} />}
      <main className="login-wrap" style={{ minHeight: embed ? undefined : 'calc(100vh - 150px)' }}>
        <div style={{ width: '100%', maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!embed && <LangSwitch lang={lang} to={self} />}
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
            <form action={submitContact} className="login-card" style={{ maxWidth: 'none' }}>
              <h1>{x.title}: {x.opt[option]}</h1>
              <p className="muted small">{x.for}: <b>{product}</b></p>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="option" value={option} />
              <input type="hidden" name="click" value={sp.click ?? ''} />
              {embed && <input type="hidden" name="embed" value="1" />}
              <label>{x.name}<input name="name" required maxLength={120} defaultValue={me?.fullName ?? ''} autoComplete="name" /></label>
              <label>{x.email}<input name="email" type="email" required maxLength={254} defaultValue={me?.email ?? ''} autoComplete="email" dir="ltr" /></label>
              <label>{x.company}<input name="company" required maxLength={120} autoComplete="organization" /></label>
              <label>{x.cr} <small className="muted">({x.crHint})</small><input name="cr_number" inputMode="numeric" pattern="\d{10}" maxLength={10} dir="ltr" /></label>

              {option === 'pricing' && (known
                ? <p className="muted small">{x.haveBiz}</p>
                : (
                  <div className="biz-box">
                    <b>{x.bizTitle}</b>
                    {([['branches', x.branches], ['system_users', x.users], ['employees', x.employees]] as const).map(([k, label]) => (
                      <label key={k}>{label}
                        <select name={k} required defaultValue="">
                          <option value="" disabled>{x.choose}</option>
                          {RANGES[k].map(([v, en, ar]) => <option key={v} value={v}>{lang === 'ar' ? ar : en}</option>)}
                        </select>
                      </label>
                    ))}
                    <label>{x.activity}<input name="business_activity" required maxLength={120} /></label>
                  </div>
                ))}

              <label>{x.message}<textarea name="message" rows={3} maxLength={1000} /></label>
              {/* unchecked on purpose: the visitor has to tick it */}
              <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontWeight: 400 }}>
                <input type="checkbox" name="consent" required style={{ width: 'auto', marginTop: 4 }} />
                <span className="small">{x.consent}</span>
              </label>
              <button className="btn-vendor wide">{x.send}</button>
            </form>
          )}
        </div>
      </main>
      {!embed && <Footer lang={lang} />}
    </>
  );
}