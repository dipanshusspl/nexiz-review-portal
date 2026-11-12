'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * One global loading indicator:
 *  - a thin bar across the top while the app moves to another page (link click) or a form is being submitted;
 *  - the clicked submit button gets a spinner and ignores further clicks (no double submits).
 * It stops as soon as the new URL arrives (path or query changes), when the page is restored, or after 20 s as a safety net.
 */
export default function LoadingBar() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const btn = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const stop = () => {
      setBusy(false);
      if (timer.current) clearTimeout(timer.current);
      btn.current?.classList.remove('is-loading');
      btn.current = null;
    };
    const start = (b?: HTMLElement | null) => {
      setBusy(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(stop, 20000);
      if (b) { b.classList.add('is-loading'); btn.current = b; }
    };
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const u = new URL(a.href, window.location.href);
      if (u.origin !== window.location.origin) return;
      if (u.pathname === window.location.pathname && u.search === window.location.search) return;
      start();
    };
    const onSubmit = (e: SubmitEvent) => start((e.submitter as HTMLElement | null) ?? null);
    document.addEventListener('click', onClick);
    document.addEventListener('submit', onSubmit);
    window.addEventListener('pageshow', stop);
    (window as unknown as { __navStop?: () => void }).__navStop = stop;
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('submit', onSubmit);
      window.removeEventListener('pageshow', stop);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // the new page arrived
  useEffect(() => { (window as unknown as { __navStop?: () => void }).__navStop?.(); }, [pathname, params]);

  return <div className={busy ? 'navbar busy' : 'navbar'} role="progressbar" aria-hidden={!busy} aria-label="Loading" />;
}
