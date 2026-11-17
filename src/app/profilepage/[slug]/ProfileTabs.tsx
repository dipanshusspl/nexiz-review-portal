'use client';
// Added by Prachi, 2026-11-13: the tab bar of the profile page. A tab opens the matching row below and scrolls to it.
// It never writes to the address bar, so the Back button still goes to the previous page (see the note in BackButton.tsx).
import { useState } from 'react';
import { Ic, type IconName } from './ProfileIcons';
import s from './profile.module.css';

export type Tab = { id: string; label: string; icon: IconName; n?: number };

export default function ProfileTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  const go = (id: string) => {
    setActive(id);
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'DETAILS') (el as HTMLDetailsElement).open = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <nav className={s.tabs} aria-label="Sections">
      {tabs.map((t) => (
        <button key={t.id} type="button" onClick={() => go(t.id)} className={t.id === active ? `${s.tab} ${s.tabOn}` : s.tab} aria-current={t.id === active ? 'true' : undefined}>
          <Ic name={t.icon} size={17} />
          <span>{t.label}</span>
          {t.n !== undefined && <span className={s.tabN}>{t.n}</span>}
        </button>
      ))}
    </nav>
  );
}