'use client';
// Changed 2026-11-19 ("static" version): the navy "Contact Vendor" button. Its 3 options open the form at once, inside the page.
// Before, each option opened an iframe on /go/contact, which logged the click, redirected to /contact-vendor/<option> and loaded that page.
// Now the form is client code (LeadModal) and the click is logged in the background (logCtaClick).
import { useCallback, useState } from 'react';
import { logCtaClick } from '@/app/actions/lead-inline';
import LeadModal, { type LeadOption } from './LeadModal';

const OPTIONS = [
  ['pricing', 'Pricing & Quotation', 'الأسعار وعروض الأسعار'],
  ['info', 'More Information', 'مزيد من المعلومات'],
  ['general', 'General Inquiry', 'استفسار عام'],
] as const;

export default function VendorMenu({ slug, lang, product, me, knownBiz }: { slug: string; lang: string; product: string; me?: { name: string; email: string } | null; knownBiz?: boolean }) {
  const ar = lang === 'ar';
  const [menu, setMenu] = useState(false);
  const [opt, setOpt] = useState<LeadOption | null>(null);
  const [click, setClick] = useState<Promise<string | null> | null>(null);
  const close = useCallback(() => setOpt(null), []);

  return (
    <div className="vendor-dd">
      <button type="button" className="btn-vendor" style={{ width: '100%' }} aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
        {ar ? 'تواصل مع المورّد' : 'Contact Vendor'} ▾
      </button>

      {menu && (
        <div className="vendor-menu">
          {OPTIONS.map(([k, en, arLabel]) => (
            <button key={k} type="button"
              onClick={() => { setMenu(false); setClick(logCtaClick({ slug, cta: 'contact_vendor', option: k }).catch(() => null)); setOpt(k); }}>
              {ar ? arLabel : en}
            </button>
          ))}
        </div>
      )}

      {opt && <LeadModal kind="contact" option={opt} slug={slug} product={product} lang={lang} me={me} knownBiz={knownBiz} click={click} onClose={close} />}
    </div>
  );
}