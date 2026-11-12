import Link from 'next/link';
import { setLanguage } from '@/app/actions/auth';
import type { Lang } from '@/lib/i18n';

/** Header for pages a visitor can open without logging in (product page, verification, privacy). */
export default function PublicHeader({ lang, current, loggedIn, t }: { lang: Lang; current: string; loggedIn: boolean; t: { login: string; reviewIt: string } }) {
  return (
    <header className="pubhead">
      <Link href="/review" className="brand"><span className="logo">N</span>Nexiz AI</Link>
      <div className="topbar-right">
        <form action={setLanguage} className="langs">
          <input type="hidden" name="to" value={current} />
          <button name="lang" value="en" className={lang === 'en' ? 'on' : ''}>EN</button>
          <button name="lang" value="ar" className={lang === 'ar' ? 'on' : ''}>العربية</button>
        </form>
        <Link href={loggedIn ? '/review' : '/login'} className="btn-ghost">{loggedIn ? t.reviewIt : t.login}</Link>
      </div>
    </header>
  );
}
