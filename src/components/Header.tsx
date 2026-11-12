import Link from 'next/link';
import { logout, setLanguage } from '@/app/actions/auth';
// import { canOpenAdmin, type CurrentUser } from '@/lib/auth/current-user';
import type { Dict, Lang } from '@/lib/i18n';
import { canOpenAdmin, homePath, isExpertPanelUser, type CurrentUser } from '@/lib/auth/current-user';


export default function Header({ user, lang, t, current }: { user: CurrentUser; lang: Lang; t: Dict; current: string }) {
  return (
    <header className="topbar">
      <Link href={homePath(user)} className="brand"></Link><Link href="/review" className="brand"><span className="logo">N</span>{t.appName}</Link>
      <div className="topbar-right">
        <form action={setLanguage} className="langs">
          <input type="hidden" name="to" value={current} />
          <button name="lang" value="en" className={lang === 'en' ? 'on' : ''}>EN</button>
          <button name="lang" value="ar" className={lang === 'ar' ? 'on' : ''}>العربية</button>
        </form>
        <details className="menu">
          <summary className="avatar" aria-label="account">{user.fullName.charAt(0).toUpperCase()}</summary>
          <div className="menu-pop">
            <div className="who"><b>{user.fullName}</b><small>{user.email}</small><small className="role">{user.roleName}</small></div>
            <Link href={homePath(user)}>{isExpertPanelUser(user) ? 'Expert panel' : t.reviewPage}</Link>
            {canOpenAdmin(user) && <Link href="/admin">{t.adminPanel}</Link>}
            <Link href="/account/password">{t.changePassword}</Link>
            <form action={logout}><button>{t.logout}</button></form>
          </div>
        </details>
      </div>
    </header>
  );
}
