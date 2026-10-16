import 'server-only';
import { db } from '@/lib/supabase/admin';

/** "Every rating is 1" or "every rating is 5". Needs at least 3 ratings, so one lone overall star is not flagged. */
export function extremeRatings(ratings: (number | null | undefined)[]): boolean {
  const r = ratings.filter((x): x is number => typeof x === 'number');
  return r.length >= 3 && (r.every((x) => x === 1) || r.every((x) => x === 5));
}

/** True when this account already has 2+ web reviews in the last hour (so the new one is the 3rd). Field agents are exempt. */
export async function submittedTooFast(userId: string): Promise<boolean> {
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await db().from('rv_reviews').select('id', { count: 'exact', head: true })
    .eq('user_id', userId).eq('source', 'web').gte('created_at', since);
  return (count ?? 0) >= 2;
}

export const ESCALATION_LABEL: Record<string, string> = {
  all_ratings_extreme: 'Every rating is 1 or every rating is 5',
  burst: '3+ reviews from one account within an hour',
  vendor_dispute: 'Vendor has disputed this review',
  expert: 'Expert review (always read by a person)',
};
