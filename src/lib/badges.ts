import 'server-only';
import { db } from '@/lib/supabase/admin';

/** 'gold' = golden N, 'white' = white N, null = no badge. Badges are for EXPERTS only (customers never get one). */
export type Badge = 'gold' | 'white' | null;

/** Client rules. Change the numbers here and nowhere else. */
export const WHITE_MIN_REVIEWS = 1; // expert with at least 1 review   -> white N
export const GOLD_MIN_REVIEWS = 3;  // expert with 3 or more reviews    -> golden N

/**
 * Which expert review statuses count. 'approved' = only reviews that are live (every expert review is read by a person at
 * Nexiz first, so the badge never shows before that). To count a review as soon as it is submitted use ['pending', 'approved'].
 */
const COUNTED = ['approved'];

const badgeFor = (n: number): Badge => (n >= GOLD_MIN_REVIEWS ? 'gold' : n >= WHITE_MIN_REVIEWS ? 'white' : null);
const chunk = <T,>(a: T[], n: number): T[][] => { const o: T[][] = []; for (let i = 0; i < a.length; i += n) o.push(a.slice(i, i + n)); return o; };

/** profile id -> number of counted (approved) expert reviews. */
export async function getReviewCountsByProfileId(profileIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (const ids of chunk([...new Set(profileIds.filter(Boolean))], 100)) {
    for (let from = 0; ; from += 1000) { // page through, so more than 1000 reviews are never cut off
      const { data } = await db().from('rv_expert_software_reviews').select('profile_id')
        .in('profile_id', ids).eq('is_complete', true).in('status', COUNTED).range(from, from + 999);
      const rows = (data ?? []) as { profile_id: string }[];
      for (const r of rows) counts.set(r.profile_id, (counts.get(r.profile_id) ?? 0) + 1);
      if (rows.length < 1000) break;
    }
  }
  return counts;
}

/** profile id -> badge, for many profiles at once (used by the admin pages). */
export async function getBadgesByProfileId(profileIds: string[]): Promise<Map<string, Badge>> {
  const counts = await getReviewCountsByProfileId(profileIds);
  const out = new Map<string, Badge>();
  for (const id of profileIds) out.set(id, badgeFor(counts.get(id) ?? 0));
  return out;
}

/** user id -> badge, for many users at once. Users without an expert profile are simply left out (no badge). */
export async function getBadgesByUserId(userIds: string[]): Promise<Map<string, Badge>> {
  const profByUser = new Map<string, string>();
  for (const ids of chunk([...new Set(userIds.filter(Boolean))], 100)) {
    const { data } = await db().from('rv_expert_profiles').select('id,user_id').in('user_id', ids);
    for (const p of (data ?? []) as { id: string; user_id: string }[]) profByUser.set(p.user_id, p.id);
  }
  const byProfile = await getBadgesByProfileId([...profByUser.values()]);
  const out = new Map<string, Badge>();
  for (const [uid, pid] of profByUser) out.set(uid, byProfile.get(pid) ?? null);
  return out;
}

/** One user's badge. Worked out fresh on every request, so it appears as soon as the review count reaches the level. */
export async function getBadge(userId: string): Promise<Badge> {
  return (await getBadgesByUserId([userId])).get(userId) ?? null;
}
