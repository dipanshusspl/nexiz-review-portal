'use client';
// Added by Prachi, 2026-11-11: Back button of the profile page. Goes to the page the visitor came from; if the page was opened directly (no history), goes to the list.
import { useRouter } from 'next/navigation';
import s from './profile.module.css';

export default function BackButton({ lang }: { lang: 'en' | 'ar' }) {
  const router = useRouter();
  const go = () => {
    if (window.history.length > 1) router.back();
    else router.push('/review');
  };
  return (
    <button type="button" onClick={go} className={s.back}>
      <span aria-hidden>{lang === 'ar' ? '→' : '←'}</span>{lang === 'ar' ? 'رجوع' : 'Back'}
    </button>
  );
}