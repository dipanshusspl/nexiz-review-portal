'use client';
// Added 2026-11-19: the pop-up form of "Request a Demo" and "Contact Vendor". It is plain client code, so it opens at once:
// no iframe, no redirect, no server page. The click log and the save run in the background (app/actions/lead-inline.ts).
// On a phone the pop-up becomes a bottom sheet through styles/mobile.css (rule 7a), which matches [role="dialog"].
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { submitLead } from '@/app/actions/lead-inline';
import { RANGES } from '@/lib/lead-ranges';

export type LeadKind = 'demo' | 'contact';
export type LeadOption = 'pricing' | 'info' | 'general';

const TXT = {
  en: {
    demo: 'Request a demo', contact: 'Contact vendor', opt: { pricing: 'Pricing & Quotation', info: 'More Information', general: 'General Inquiry' } as Record<string, string>,
    for: 'Product', name: 'Your name', email: 'Business email', company: 'Company name', cr: 'CR number (optional)', crHint: '10 digits',
    branches: 'Number of branches', users: 'Number of system users', employees: 'Number of employees', activity: 'Business activity', message: 'Message (optional)',
    bizTitle: 'Business requirements', choose: 'Select…', haveBiz: 'We already have your business details, so we are not asking for them again.',
    consent: 'I agree that Nexiz may share these details with the vendor of this product so they can contact me.',
    send: 'Send request', sending: 'Sending…', doneTitle: 'Request sent', doneText: 'Your Lead ID is {id}. Keep it if you need to refer to this request.',
    copy: 'Copy Lead ID', copied: 'Copied ✓', back: 'Back to the product', close: 'Close',
    errors: { required: 'Please fill in your name and company.', email: 'Please enter a valid email address.', cr: 'The CR number must be 10 digits.', consent: 'Please tick the box to allow sharing your details with the vendor.', pricing: 'Please fill in the business requirements.', product: 'This product was not found.', option: 'Please choose an option.', save: 'We could not save your request. Please try again.' } as Record<string, string>,
  },
  ar: {
    demo: 'اطلب عرضًا تجريبيًا', contact: 'تواصل مع المورّد', opt: { pricing: 'الأسعار وعروض الأسعار', info: 'مزيد من المعلومات', general: 'استفسار عام' } as Record<string, string>,
    for: 'المنتج', name: 'اسمك', email: 'البريد الإلكتروني للعمل', company: 'اسم الشركة', cr: 'رقم السجل التجاري (اختياري)', crHint: '١٠ أرقام',
    branches: 'عدد الفروع', users: 'عدد مستخدمي النظام', employees: 'عدد الموظفين', activity: 'النشاط التجاري', message: 'رسالة (اختياري)',
    bizTitle: 'متطلبات العمل', choose: 'اختر…', haveBiz: 'لدينا بيانات نشاطك التجاري مسبقًا، لذلك لن نطلبها مرة أخرى.',
    consent: 'أوافق على أن تشارك Nexiz هذه البيانات مع مورّد هذا المنتج ليتواصل معي.',
    send: 'إرسال الطلب', sending: 'جارٍ الإرسال…', doneTitle: 'تم إرسال الطلب', doneText: 'رقم طلبك هو {id}. احتفظ به للرجوع إلى هذا الطلب.',
    copy: 'نسخ رقم الطلب', copied: 'تم النسخ ✓', back: 'العودة إلى المنتج', close: 'إغلاق',
    errors: { required: 'يرجى إدخال الاسم واسم الشركة.', email: 'يرجى إدخال بريد إلكتروني صحيح.', cr: 'يجب أن يتكوّن رقم السجل التجاري من ١٠ أرقام.', consent: 'يرجى تحديد المربع للسماح بمشاركة بياناتك مع المورّد.', pricing: 'يرجى إدخال متطلبات العمل.', product: 'لم يتم العثور على المنتج.', option: 'يرجى اختيار خيار.', save: 'تعذّر حفظ طلبك. حاول مرة أخرى.' } as Record<string, string>,
  },
};

type Props = {
  kind: LeadKind; option?: LeadOption; slug: string; product: string; lang: string;
  me?: { name: string; email: string } | null;
  knownBiz?: boolean;                          // pricing only: we already hold this user's business details
  click: Promise<string | null> | null;        // the click log that started in the background when the button was pressed
  onClose: () => void;
};

export default function LeadModal({ kind, option, slug, product, lang, me, knownBiz, click, onClose }: Props) {
  const ar = lang === 'ar';
  const x = TXT[ar ? 'ar' : 'en'];
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [leadId, setLeadId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();                       // the browser has already checked required / pattern / email
    if (busy) return;
    const fd = new FormData(e.currentTarget);
    setBusy(true); setErr('');
    fd.set('click', (await (click ?? Promise.resolve(null)).catch(() => null)) ?? '');
    try {
      const r = await submitLead(fd);
      if (r.ok) setLeadId(r.leadId); else setErr(x.errors[r.error] ?? x.errors.save);
    } catch {
      setErr(x.errors.save);
    }
    setBusy(false);
  };

  const copy = async () => {
    if (!leadId) return;
    try { await navigator.clipboard.writeText(leadId); } catch {
      const t = document.createElement('textarea');
      t.value = leadId; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch { /* nothing else to try */ }
      document.body.removeChild(t);
    }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  const isContact = kind === 'contact';
  const title = isContact ? `${x.contact}: ${x.opt[option ?? 'general']}` : x.demo;
  const [before, after] = x.doneText.split('{id}');

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} onClick={onClose} dir={ar ? 'rtl' : 'ltr'}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ position: 'relative', width: '100%', maxWidth: 500, maxHeight: 'min(88vh, 760px)', display: 'flex', flexDirection: 'column', background: 'var(--white)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        <button type="button" aria-label={x.close} onClick={onClose}
          style={{ position: 'absolute', top: 8, insetInlineEnd: 12, zIndex: 1, border: 0, background: 'none', fontSize: 28, lineHeight: 1, cursor: 'pointer', color: 'var(--ink)' }}>×</button>
        <div style={{ overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {leadId ? (
            <div className="login-card" style={{ maxWidth: 'none', border: 0, boxShadow: 'none' }}>
              <h1>{x.doneTitle}</h1>
              <p>{before}<b dir="ltr" style={{ userSelect: 'all' }}>{leadId}</b>{after}</p>
              <button type="button" className="btn-ghost wide" onClick={copy} aria-live="polite" style={{ textAlign: 'center' }}>{copied ? x.copied : x.copy}</button>
              <button type="button" className="btn-ghost wide" onClick={onClose} style={{ textAlign: 'center' }}>{x.back}</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="login-card" style={{ maxWidth: 'none', border: 0, boxShadow: 'none' }}>
              <h1>{title}</h1>
              <p className="muted small">{x.for}: <b>{product}</b></p>
              {err && <p role="alert" style={{ margin: 0, padding: '10px 12px', borderRadius: 10, background: '#fdecea', color: '#a32d2d', fontSize: 14 }}>{err}</p>}
              <input type="hidden" name="kind" value={kind} />
              <input type="hidden" name="slug" value={slug} />
              {isContact && <input type="hidden" name="option" value={option ?? 'general'} />}
              <label>{x.name}<input name="name" required maxLength={120} defaultValue={me?.name ?? ''} autoComplete="name" /></label>
              <label>{x.email}<input name="email" type="email" required maxLength={254} defaultValue={me?.email ?? ''} autoComplete="email" dir="ltr" /></label>
              <label>{x.company}<input name="company" required maxLength={120} autoComplete="organization" /></label>
              <label>{x.cr} <small className="muted">({x.crHint})</small><input name="cr_number" inputMode="numeric" pattern="\d{10}" maxLength={10} dir="ltr" /></label>

              {isContact && option === 'pricing' && (knownBiz
                ? <p className="muted small">{x.haveBiz}</p>
                : (
                  <div className="biz-box">
                    <b>{x.bizTitle}</b>
                    {([['branches', x.branches], ['system_users', x.users], ['employees', x.employees]] as const).map(([k, label]) => (
                      <label key={k}>{label}
                        <select name={k} required defaultValue="">
                          <option value="" disabled>{x.choose}</option>
                          {RANGES[k].map(([v, en, arLabel]) => <option key={v} value={v}>{ar ? arLabel : en}</option>)}
                        </select>
                      </label>
                    ))}
                    <label>{x.activity}<input name="business_activity" required maxLength={120} /></label>
                  </div>
                ))}

              {isContact && <label>{x.message}<textarea name="message" rows={3} maxLength={1000} /></label>}
              {/* unchecked on purpose: the visitor has to tick it */}
              <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontWeight: 400 }}>
                <input type="checkbox" name="consent" required style={{ width: 'auto', marginTop: 4 }} />
                <span className="small">{x.consent}</span>
              </label>
              <button className={isContact ? 'btn-vendor wide' : 'btn-demo wide'} disabled={busy}>{busy ? x.sending : x.send}</button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}