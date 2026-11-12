'use client';
import Link from 'next/link';
import { useState } from 'react';
import EntityImage from './EntityImage';
import { SearchIcon } from './Icons';

/** meta = "12 products · 34 reviews" (categories). note = honest line when a live category is still thin. */
export type Tile = { id: string; href: string; name: string; imageUrl: string | null; hue: number; meta?: string; note?: string };

export default function TileGrid({ tiles, placeholder, empty }: { tiles: Tile[]; placeholder: string; empty: string }) {
  const [q, setQ] = useState('');
  const shown = tiles.filter((t) => t.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <div className="search"><SearchIcon className="search-ico" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      </div>
      {tiles.length === 0 && <p className="muted">{empty}</p>}
      <div className="tiles">
        {shown.map((t) => (
          <Link key={t.id} href={t.href} className={t.meta ? 'tile cat-tile' : 'tile'} title={t.name}>
            {t.meta
              ? <span className="cat-ico" aria-hidden>{t.name.trim().charAt(0).toUpperCase()}</span>
              : <EntityImage url={t.imageUrl} name={t.name} size={56} />}
            <span className="tile-name">{t.name}</span>
            {t.meta && <span className="tile-meta fig">{t.meta}</span>}
            {t.note && <span className="tile-note">{t.note}</span>}
          </Link>
        ))}
      </div>
    </>
  );
}
