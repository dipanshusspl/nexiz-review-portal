'use client';
// Added 2026-11-18: the "Request sent" screen of the demo and contact-vendor forms.
// 1) The Lead ID (NXZ-000008) has a Copy button.
// 2) Inside the pop-up (embed), "Back to the product" does the same as the × : it closes the pop-up (the page behind stays as it was)
//    instead of reloading the whole product page. Outside a pop-up it is a normal link.
import Link from 'next/link';
import { useState } from 'react';

export const CLOSE_POPUP = 'nexiz-close-popup';

export default function DoneActions({ id, text, slug, embed, back, lang }: { id: string; text: string; slug: string; embed: boolean; back: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  const ar = lang === 'ar';
  const [before, after] = text.split('{id}');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      // older browsers / no permission: select-and-copy fallback
      const t = document.createElement('textarea');
      t.value = id; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch { /* nothing else to try */ }
      document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const closePopup = () => {
    if (window.parent !== window) window.parent.postMessage({ type: CLOSE_POPUP }, window.location.origin);
    else window.location.href = `/profilepage/${slug}`;   // opened on its own, not in a pop-up
  };

  return (
    <>
      <p>{before}<b dir="ltr" style={{ userSelect: 'all' }}>{id}</b>{after}</p>
      <button type="button" className="btn-ghost wide" onClick={copy} aria-live="polite" style={{ textAlign: 'center' }}>
        {copied ? (ar ? 'تم النسخ ✓' : 'Copied ✓') : (ar ? 'نسخ رقم الطلب' : 'Copy Lead ID')}
      </button>
      {embed
        ? <button type="button" className="btn-ghost wide" onClick={closePopup} style={{ textAlign: 'center' }}>{back}</button>
        : <Link href={`/profilepage/${slug}`} className="btn-ghost wide" style={{ textAlign: 'center' }}>{back}</Link>}
    </>
  );
}