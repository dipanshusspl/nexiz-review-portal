'use client';
// Changed 2026-11-19 ("static" version): the orange "Request a Demo" button opens the form at once, inside the page.
// Before, it opened an iframe on /go/demo, which logged the click, redirected to /request-demo and loaded that page (about 5 seconds).
// Now the form is client code (LeadModal) and the click is logged in the background (logCtaClick). /go/demo and /request-demo still work as before.
import { useCallback, useState } from 'react';
import { logCtaClick } from '@/app/actions/lead-inline';
import LeadModal from './LeadModal';

export default function DemoButton({ slug, lang, product, me }: { slug: string; lang: string; product: string; me?: { name: string; email: string } | null }) {
  const [open, setOpen] = useState(false);
  const [click, setClick] = useState<Promise<string | null> | null>(null);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button type="button" className="btn-demo wide" style={{ marginTop: 0 }}
        onClick={() => { setClick(logCtaClick({ slug, cta: 'demo' }).catch(() => null)); setOpen(true); }}>
        {lang === 'ar' ? 'اطلب عرضًا تجريبيًا' : 'Request a Demo'}
      </button>
      {open && <LeadModal kind="demo" slug={slug} product={product} lang={lang} me={me} click={click} onClose={close} />}
    </>
  );
}