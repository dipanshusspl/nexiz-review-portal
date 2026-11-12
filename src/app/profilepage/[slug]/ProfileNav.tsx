'use client';
// Added by Prachi, 2026-11-11: side menu of the profile page.
// A plain #anchor link adds a history entry on every click, so the Back button stepped through the menu clicks instead of leaving the page.
// These links only scroll (and keep the real href for open-in-new-tab / keyboard), so Back goes to the previous page like on every other page.
import s from './profile.module.css';

export type NavItem = { id: string; label: string; n: number };

export default function ProfileNav({ overview, items }: { overview: string; items: NavItem[] }) {
  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <nav className={s.nav}>
      <a href="#top" className={s.on} onClick={(e) => go(e, 'top')}>{overview}</a>
      {items.map((i) => (
        <a key={i.id} href={`#${i.id}`} onClick={(e) => go(e, i.id)}><span>{i.label}</span><span className={s.n}>{i.n}</span></a>
      ))}
    </nav>
  );
}