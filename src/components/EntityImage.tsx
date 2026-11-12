'use client';
import { useState } from 'react';

/** No image, or broken URL: showName=true shows the item's NAME in a small box, otherwise a letter tile. */
export default function EntityImage({ url, name, size = 56, showName = false }: { url?: string | null; name: string; size?: number; showName?: boolean }) {
  const [bad, setBad] = useState(false);
  if (url && !bad) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={name} title={name} width={size} height={size} className="ent-img" style={{ width: size, height: size }}
        loading="lazy" referrerPolicy="no-referrer" onError={() => setBad(true)}
        ref={(el) => { if (el && el.complete && el.naturalWidth === 0) setBad(true); }} />
    );
  }
  if (showName) return <span className="ent-noimg" title={name}>{name}</span>;
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span className="ent-fallback" title={name} style={{ width: size, height: size, background: `hsl(${hue} 45% 92%)`, color: `hsl(${hue} 55% 30%)`, fontSize: size * 0.42 }}>
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}