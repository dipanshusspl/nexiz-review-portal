'use client';
import { useEffect, useState } from 'react';

/**
 * Success / failure message shown as a toast (auto-hides, can be closed).
 * Pages pass ?ok=... or ?error=... in the URL (that is how every server action reports back). The query is removed after
 * showing, so a refresh does not repeat the message.
 */
export default function Flash({ ok, error, map }: { ok?: string; error?: string; map?: Record<string, string> }) {
  const text = (v: string) => map?.[v] ?? v;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
    const u = new URL(window.location.href);
    if (u.searchParams.has('ok') || u.searchParams.has('error')) {
      u.searchParams.delete('ok'); u.searchParams.delete('error');
      window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash);
    }
    const t = setTimeout(() => setHidden(true), error ? 10000 : 5000);
    return () => clearTimeout(t);
  }, [ok, error]);

  if ((!ok && !error) || hidden) return null;
  const isErr = !!error;
  return (
    <div className="toast-wrap">
      <div className={isErr ? 'toast toast-err' : 'toast toast-ok'} role={isErr ? 'alert' : 'status'}>
        <span className="toast-ico" aria-hidden>{isErr ? '!' : '✓'}</span>
        <span className="toast-text">{text((error || ok) as string)}</span>
        <button type="button" className="toast-x" aria-label="Close" onClick={() => setHidden(true)}>×</button>
      </div>
    </div>
  );
}
