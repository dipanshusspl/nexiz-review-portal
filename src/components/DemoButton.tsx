'use client';
// Added by Prachi, 2026-11-17: the orange "Request a Demo" button on the product page. It opens the demo form in a pop-up (modal)
// over the page. The pop-up shows /go/demo?...&embed=1, which logs the click, then lands on /request-demo?...&embed=1.
// A spinner shows until the form has loaded, and the form page is warmed up when the visitor points at the button.
import { useEffect, useRef, useState } from 'react';

export default function DemoButton({ slug, lang }: { slug: string; lang: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const warmed = useRef(false);

  useEffect(() => {
    if (!src) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSrc(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [src]);

  // Load the form page once in the background, so the pop-up opens faster. It does not log a click (only /go/demo does).
  const warm = () => {
    if (warmed.current) return;
    warmed.current = true;
    fetch(`/request-demo?product=${encodeURIComponent(slug)}&embed=1`, { credentials: 'same-origin' }).catch(() => {});
  };

  return (
    <>
      <button type="button" className="btn-demo wide" style={{ marginTop: 0 }}
        onMouseEnter={warm} onFocus={warm} onTouchStart={warm}
        onClick={() => { setReady(false); setSrc(`/go/demo?slug=${encodeURIComponent(slug)}&embed=1`); }}>
        {lang === 'ar' ? 'اطلب عرضًا تجريبيًا' : 'Request a Demo'}
      </button>

      {src && (
        <div role="dialog" aria-modal="true" onClick={() => setSrc(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', width: '100%', maxWidth: 500, height: 'min(88vh, 720px)', background: 'var(--white)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
            <style>{'@keyframes nxspin { to { transform: rotate(360deg); } }'}</style>
            {!ready && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 36, height: 36, border: '4px solid var(--line)', borderTopColor: '#ff6a00', borderRadius: '50%', animation: 'nxspin .8s linear infinite' }} />
              </div>
            )}
            <button type="button" aria-label="Close" onClick={() => setSrc(null)}
              style={{ position: 'absolute', top: 8, insetInlineEnd: 12, zIndex: 1, border: 0, background: 'none', fontSize: 28, lineHeight: 1, cursor: 'pointer', color: 'var(--ink)' }}>×</button>
            <iframe src={src} title="Request a Demo" onLoad={() => setReady(true)}
              style={{ width: '100%', height: '100%', border: 0, opacity: ready ? 1 : 0, transition: 'opacity .15s' }} />
          </div>
        </div>
      )}
    </>
  );
}