'use client';
// Added by Prachi, 2026-11-13: the tab bar of the profile page. A tab opens the matching row below and scrolls to it.
// It never writes to the address bar, so the Back button still goes to the previous page (see the note in BackButton.tsx).
// Changed 2026-11-19 (phone only): all sections now stay on the page one below the other, the tab bar sticks to the top,
// and the highlighted tab follows the scroll (Overview -> Features -> ... -> Saudi Compliance), like the Compare page.
// On a wider screen nothing changes: the highlight moves only when a tab is clicked, as before.
import { useEffect, useRef, useState } from 'react';
import { Ic, type IconName } from './ProfileIcons';
import s from './profile.module.css';

export type Tab = { id: string; label: string; icon: IconName; n?: number };

const PHONE = '(max-width: 720px)';

export default function ProfileTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  const navRef = useRef<HTMLElement>(null);
  const lockUntil = useRef(0);   // after a tap, ignore the scroll-follow while the page glides to the section

  const go = (id: string) => {
    setActive(id);
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'DETAILS') (el as HTMLDetailsElement).open = true;
    if (window.matchMedia(PHONE).matches) lockUntil.current = Date.now() + 900;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // phone only: the tab whose section is at the top of the screen becomes the highlighted one
  useEffect(() => {
    const mm = window.matchMedia(PHONE);
    let raf = 0;
    const follow = () => {
      raf = 0;
      if (!mm.matches || Date.now() < lockUntil.current) return;
      const bar = navRef.current?.getBoundingClientRect().height ?? 56;
      const line = bar + 24;                       // a section counts as "current" once its top passes this line
      let cur = tabs[0]?.id ?? '';
      for (const t of tabs) {
        const el = document.getElementById(t.id);
        if (el && el.getBoundingClientRect().top <= line) cur = t.id;
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = tabs[tabs.length - 1]?.id ?? cur;
      setActive((a) => (a === cur ? a : cur));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(follow); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    follow();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [tabs]);

  // phone only: keep the highlighted pill in view inside the sideways-scrolling bar
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !window.matchMedia(PHONE).matches) return;
    const on = nav.querySelector<HTMLElement>('[aria-current="true"]');
    if (on) nav.scrollTo({ left: on.offsetLeft - (nav.clientWidth - on.offsetWidth) / 2, behavior: 'smooth' });
  }, [active]);

  return (
    <nav ref={navRef} className={`${s.tabs} mp-tabs`} data-active={active} aria-label="Sections">
      {tabs.map((t) => (
        <button key={t.id} type="button" onClick={() => go(t.id)} className={`${t.id === active ? `${s.tab} ${s.tabOn}` : s.tab} mp-tab`} aria-current={t.id === active ? 'true' : undefined}>
          <Ic name={t.icon} size={17} />
          <span>{t.label}</span>
          {t.n !== undefined && <span className={s.tabN}>{t.n}</span>}
        </button>
      ))}
    </nav>
  );
}