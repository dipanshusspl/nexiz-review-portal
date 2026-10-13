import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { canOpenAdmin, type CurrentUser } from '@/lib/auth/current-user';

/** Slim top bar for the Expert panel. (The language switch lives inside the client's screen itself.) */
export default function ExpertBar({ user }: { user: CurrentUser }) {
  return (
    <header className="topbar">
      <Link href="/expert" className="brand"><span className="logo">N</span>Nexiz AI</Link>
      <div className="topbar-right">
        <details className="menu">
          <summary className="avatar" aria-label="account">{user.fullName.charAt(0).toUpperCase()}</summary>
          <div className="menu-pop">
            <div className="who"><b>{user.fullName}</b><small>{user.email}</small><small className="role">{user.roleName}</small></div>
            {canOpenAdmin(user) && <Link href="/admin">Admin panel</Link>}
            <Link href="/account/password">Change password</Link>
            <form action={logout}><button>Log out</button></form>
          </div>
        </details>
      </div>
    </header>
  );
}
