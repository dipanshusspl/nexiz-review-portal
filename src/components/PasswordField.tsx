'use client';
import { useState } from 'react';

/** Password input with a show / hide eye button. */
export default function PasswordField({ label, name, autoComplete, lang }: { label: string; name: string; autoComplete?: string; lang: 'en' | 'ar' }) {
  const [show, setShow] = useState(false);
  const text = show ? (lang === 'ar' ? 'إخفاء كلمة المرور' : 'Hide password') : (lang === 'ar' ? 'إظهار كلمة المرور' : 'Show password');
  return (
    <label>
      {label}
      <span style={{ position: 'relative', display: 'block', direction: 'ltr' }}>
        <input name={name} type={show ? 'text' : 'password'} required autoComplete={autoComplete} dir="ltr" style={{ width: '100%', paddingRight: 44 }} />
        <button type="button" onClick={() => setShow(!show)} aria-label={text} title={text} aria-pressed={show}
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 0, padding: 4, cursor: 'pointer', color: '#5a7367', display: 'grid' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" />
            {show && <path d="M3 3l18 18" />}
          </svg>
        </button>
      </span>
    </label>
  );
}