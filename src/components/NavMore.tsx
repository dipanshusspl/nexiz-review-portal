'use client';
// Added 2026-11-18: on a phone the top-bar menu (Products, Solutions, Resources, About Us) is replaced by one 3-dot button.
// It opens a small list with the same items. On a wider screen this button is hidden (see src/styles/mobile.css) and the normal menu shows.
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function NavMore({ products, solutions, resources, about, soon, label }: { products: string; solutions: string; resources: string; about: string; soon: string; label: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent | TouchEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('touchstart', away);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('touchstart', away); document.removeEventListener('keydown', key); };
  }, [open]);

  return (
    <div ref={box} className="mp-more">
      <button type="button" className="mp-moreBtn" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
      </button>
      {open && (
        <div className="mp-morePop" role="menu">
          <Link href="/products" role="menuitem" onClick={() => setOpen(false)}>{products}</Link>
          <span role="menuitem" aria-disabled="true" className="mp-moreOff">{solutions}<small>{soon}</small></span>
          <span role="menuitem" aria-disabled="true" className="mp-moreOff">{resources}<small>{soon}</small></span>
          <span role="menuitem" aria-disabled="true" className="mp-moreOff">{about}<small>{soon}</small></span>
        </div>
      )}
    </div>
  );
}