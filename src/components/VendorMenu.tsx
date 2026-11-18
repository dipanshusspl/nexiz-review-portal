'use client';
// Added by Prachi, 2026-11-17: the navy "Contact Vendor" button on the product page. Its 3 options open the form in a pop-up (modal)
// over the page. The pop-up shows /go/contact?...&embed=1, which logs the click, then lands on /contact-vendor/<option>?embed=1.
// A spinner shows until the form has loaded, and each option's form page is warmed up when the visitor points at it.
import { useEffect, useRef, useState } from 'react';

const OPTIONS = [
  ['pricing', 'Pricing & Quotation', 'الأسعار وعروض الأسعار'],
  ['info', 'More Information', 'مزيد من المعلومات'],
  ['general', 'General Inquiry', 'استفسار عام'],
] as const;

export default function VendorMenu({ slug, lang }: { slug: string; lang: string }) {
  const ar = lang === 'ar';
  const [menu, setMenu] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const warmed = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSrc(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [src]);

  // Load the form page once in the background, so the pop-up opens faster. It does not log a click (only /go/contact does).
  const warm = (k: string) => {
    if (warmed.current[k]) return;
    warmed.current[k] = true;
    fetch(`/contact-vendor/${k}?product=${encodeURIComponent(slug)}&embed=1`, { credentials: 'same-origin' }).catch(() => {});
  };

  return (
    <div className="vendor-dd">
      <button type="button" className="btn-vendor" style={{ width: '100%' }} aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
        {ar ? 'تواصل مع المورّد' : 'Contact Vendor'} ▾
      </button>

      {menu && (
        <div className="vendor-menu">
          {OPTIONS.map(([k, en, arLabel]) => (
            <button key={k} type="button"
              onMouseEnter={() => warm(k)} onFocus={() => warm(k)} onTouchStart={() => warm(k)}
              onClick={() => { setMenu(false); setReady(false); setSrc(`/go/contact?slug=${encodeURIComponent(slug)}&option=${k}&embed=1`); }}>
              {ar ? arLabel : en}
            </button>
          ))}
        </div>
      )}

      {src && (
        <div role="dialog" aria-modal="true" onClick={() => setSrc(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', width: '100%', maxWidth: 500, height: 'min(88vh, 780px)', background: 'var(--white)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <style>{'@keyframes nxspin { to { transform: rotate(360deg); } }'}</style>
            {!ready && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 36, height: 36, border: '4px solid var(--line)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'nxspin .8s linear infinite' }} />
              </div>
            )}
            <button type="button" aria-label="Close" onClick={() => setSrc(null)}
              style={{ position: 'absolute', top: 8, insetInlineEnd: 12, zIndex: 1, border: 0, background: 'none', fontSize: 28, lineHeight: 1, cursor: 'pointer', color: 'var(--ink)' }}>×</button>
            <iframe src={src} title="Contact Vendor" onLoad={() => setReady(true)}
              style={{ width: '100%', height: '100%', border: 0, opacity: ready ? 1 : 0, transition: 'opacity .15s' }} />
          </div>
        </div>
      )}
    </div>
  );
}