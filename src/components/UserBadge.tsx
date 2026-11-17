import type { Badge } from '@/lib/badges';

const LABEL = {
  gold: { en: 'Nexiz golden badge: expert with 3 or more reviews', ar: 'الشارة الذهبية من نكسيز: خبير بثلاث مراجعات أو أكثر' },
  white: { en: 'Nexiz badge: expert with at least 1 review', ar: 'شارة نكسيز: خبير لديه مراجعة واحدة على الأقل' },
} as const;

/** The small Nexiz "N" badge. Shows nothing when the person has no badge. */
export default function UserBadge({ badge, size = 20, lang = 'en' }: { badge: Badge; size?: number; lang?: 'en' | 'ar' }) {
  if (!badge) return null;
  const label = LABEL[badge][lang];
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/badges/nexiz-badge-${badge}.png`} width={size} height={size} alt={label} title={label} style={{ verticalAlign: 'middle', marginInlineStart: 6 }} />;
}
