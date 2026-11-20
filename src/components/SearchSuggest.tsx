'use client';
// Added 2026-11-18: the "Search products..." box in the top bar (profile page, compare page).
// From the FIRST letter it shows up to 6 matching products under the box (name first, then category). Click or Enter on one opens its profile page;
// Enter with nothing picked, or "See all results", goes to /products?q=... as before. Arrow keys move, Esc closes.
// The list of products is given by the page (small list), so the suggestions appear at once, without waiting for the network.
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import EntityImage from '@/components/EntityImage';
import css from './SearchSuggest.module.css';

export type SuggestItem = { slug: string; name: string; imageUrl: string | null; category: string };
const MAX = 6;

/** Best matches first: name starts with it, then a word in the name starts with it, then name contains it, then category contains it. */
function rank(items: SuggestItem[], q: string): SuggestItem[] {
  const n = q.trim().toLowerCase();
  if (!n) return [];
  const score = (i: SuggestItem) => {
    const name = i.name.toLowerCase();
    if (name.startsWith(n)) return 0;
    if (name.split(/[\s\-_.()/]+/).some((w) => w.startsWith(n))) return 1;
    if (name.includes(n)) return 2;
    if (i.category.toLowerCase().includes(n)) return 3;
    return -1;
  };
  return items.map((i) => ({ i, s: score(i) })).filter((x) => x.s >= 0).sort((a, b) => a.s - b.s || a.i.name.localeCompare(b.i.name)).slice(0, MAX).map((x) => x.i);
}

function Mark({ text, q }: { text: string; q: string }) {
  const n = q.trim();
  const at = n ? text.toLowerCase().indexOf(n.toLowerCase()) : -1;
  if (at < 0) return <>{text}</>;
  return <>{text.slice(0, at)}<mark>{text.slice(at, at + n.length)}</mark>{text.slice(at + n.length)}</>;
}

export default function SearchSuggest({ items, lang, placeholder, className, children }: { items: SuggestItem[]; lang: string; placeholder: string; className?: string; children?: React.ReactNode }) {
  const router = useRouter();
  const box = useRef<HTMLFormElement>(null);
  const listId = useId();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ar = lang === 'ar';

  const found = useMemo(() => rank(items, q), [items, q]);
  const show = open && q.trim().length >= 1;

  // click outside closes the list
  useEffect(() => {
    const away = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, []);

  const go = (slug: string) => { setOpen(false); router.push(`/profilepage/${encodeURIComponent(slug)}`); };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setOpen(false); setActive(-1); return; }
    if (!show || found.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => (a + 1) % found.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => (a <= 0 ? found.length - 1 : a - 1)); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); go(found[active].slug); }   // nothing picked: the form submits to /products?q=
  };

  return (
    <form ref={box} action="/products" method="get" role="search" className={className} style={{ position: 'relative' }} autoComplete="off">
      {children}
      <input
        type="search" name="q" value={q} placeholder={placeholder} aria-label={placeholder}
        role="combobox" aria-expanded={show} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
        onFocus={() => setOpen(true)} onKeyDown={onKey}
      />
      {show && (
        <div className={css.pop} id={listId} role="listbox">
          {found.map((c, i) => (
            <button key={c.slug} id={`${listId}-${i}`} type="button" role="option" aria-selected={i === active}
              className={`${css.row} ${i === active ? css.on : ''}`}
              onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => go(c.slug)}>
              <EntityImage url={c.imageUrl} name={c.name} size={30} />
              <span className={css.txt}><b><Mark text={c.name} q={q} /></b>{c.category && <small>{c.category}</small>}</span>
            </button>
          ))}
          {found.length === 0 && <div className={css.none}>{ar ? 'لا توجد منتجات مطابقة' : 'No matching products'}</div>}
          <button type="submit" className={css.all}>{ar ? `عرض كل النتائج عن «${q.trim()}»` : `See all results for “${q.trim()}”`}</button>
        </div>
      )}
    </form>
  );
}