'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/** Header "Sign in" button. Follows the language chosen inside the expert screen (stored by it as nexiz_lang; Arabic by default). */
export default function ExpertSignInLink() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  useEffect(() => {
    const read = () => { try { setLang(window.localStorage.getItem('nexiz_lang') === 'en' ? 'en' : 'ar'); } catch { /* storage blocked: keep Arabic */ } };
    read();
    window.addEventListener('storage', read); // the frame is same-origin, so its language switch reaches this window
    return () => window.removeEventListener('storage', read);
  }, []);
  return <Link href="/login?next=%2Fexpert" className="btn-ghost">{lang === 'ar' ? 'تسجيل الدخول' : 'Sign in'}</Link>;
}
