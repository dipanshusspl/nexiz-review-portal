'use client';
import Link from 'next/link';
import { useState } from 'react';

export type Tile = { id: string; href: string; name: string; imageUrl: string | null; hue: number };

export default function TileGrid({ tiles, placeholder, empty }: { tiles: Tile[]; placeholder: string; empty: string }) {
  const [q, setQ] = useState('');
  const shown = tiles.filter((t) => t.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <div className="search"><span aria-hidden>🔍</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      </div>
      {tiles.length === 0 && <p className="muted">{empty}</p>}
      <div className="tiles">
        {shown.map((t) => (
          <Link key={t.id} href={t.href} className="tile">
            {t.imageUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={t.imageUrl} alt="" className="tile-img" loading="lazy" />
              : <span className="tile-img ent-fallback" style={{ background: `hsl(${t.hue} 45% 92%)`, color: `hsl(${t.hue} 55% 30%)` }}>{t.name.charAt(0).toUpperCase()}</span>}
            <span className="tile-name">{t.name}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
