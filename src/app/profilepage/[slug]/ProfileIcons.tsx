// Added by Prachi, 2026-11-13: small line icons for the redesigned profile page (same 1.6px stroke, colour from the text via currentColor).
export type IconName = 'home' | 'list' | 'plug' | 'tag' | 'shield' | 'shield-check' | 'swap' | 'star' | 'check' | 'chevron' | 'globe' | 'user' | 'doc' | 'grid' | 'bolt' | 'cloud' | 'scale' | 'arrow' | 'chart' | 'spark' | 'language' | 'search';

const D: Record<IconName, React.ReactNode> = {
  home: <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />,
  list: <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />,
  plug: <path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4" />,
  tag: <><path d="M3 12V4h8l10 10-8 8z" /><path d="M7.5 8.5h.01" /></>,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
  'shield-check': <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M8.5 12l2.5 2.5 5-5" /></>,
  swap: <path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />,
  star: <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L12 16.9l-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  doc: <><path d="M7 3h8l4 4v14H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  bolt: <path d="M13 3L5 14h6l-1 7 8-11h-6z" />,
  cloud: <path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 11a3.5 3.5 0 0 1-.5 7z" />,
  scale: <path d="M12 4v16M6 20h12M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chart: <path d="M5 20V10M12 20V4M19 20v-7" />,
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  language: <path d="M4 5h9M8.5 3v2M6 5c0 4 3 7 6 8M12 5c-1 4-4 7-8 8M14 20l4-9 4 9M15.5 17h5" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
};

export function Ic({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {D[name]}
    </svg>
  );
}

/** The picture in the "Check business fit" card: a screen with bars and a tick. */
export function FitIllustration() {
  return (
    <svg viewBox="0 0 220 150" width="100%" height="100%" aria-hidden="true">
      <ellipse cx="112" cy="136" rx="62" ry="7" fill="#efe9d8" />
      <rect x="40" y="18" width="150" height="96" rx="10" fill="#fff" stroke="#e3dccb" strokeWidth="2" />
      <rect x="54" y="30" width="48" height="7" rx="3.5" fill="#efe6c8" />
      <rect x="56" y="82" width="16" height="18" rx="2" fill="#efe6c8" />
      <rect x="78" y="70" width="16" height="30" rx="2" fill="#C9A227" />
      <rect x="100" y="56" width="16" height="44" rx="2" fill="#0B1F3A" />
      <rect x="122" y="44" width="16" height="56" rx="2" fill="#1B3A5C" />
      <rect x="100" y="114" width="22" height="9" rx="2" fill="#0B1F3A" />
      <circle cx="164" cy="48" r="17" fill="#0B1F3A" />
      <path d="M156 48l6 6 11-12" stroke="#C9A227" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M196 20l6-8M204 30l9-2M190 12l1-9" stroke="#D9541E" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}