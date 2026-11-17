/**
 * Added by Prachi, 2026-11-05 (gap 6.11 and 6.13). The score maths from product.ts, moved here as pure functions
 * (no database, no 'server-only') so it can be unit-tested with `npm test`. product.ts passes the numbers in.
 * Rule kept from the client: user score and expert score are NEVER blended.
 */
export type ScoreItem = { kind: 'expert' | 'user'; score: number | null | undefined; recommend: boolean | null | undefined };

/** Average to one decimal place, or null when there is nothing to average. */
export const avg = (xs: number[]): number | null =>
  (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null);

/** The most common value. On a tie the one seen first wins. */
export function top<T extends string>(xs: T[]): { value: T; n: number } | null {
  const m = new Map<T, number>();
  xs.forEach((x) => m.set(x, (m.get(x) ?? 0) + 1));
  let best: { value: T; n: number } | null = null;
  m.forEach((n, value) => { if (!best || n > best.n) best = { value, n }; });
  return best;
}

/** Company-size buckets used by the public form; expert option labels ("51-200 employees") are mapped to the same buckets. */
export function sizeBucket(label: string | null | undefined): string | null {
  if (!label) return null;
  if (['1-10', '11-50', '51-200', '201-500', '500+'].includes(label)) return label;
  const nums = (label.match(/\d[\d,]*/g) ?? []).map((n) => Number(n.replace(/,/g, '')));
  if (!nums.length) return null;
  const hi = nums[nums.length - 1];
  if (label.includes('+') && hi >= 500) return '500+';
  return hi <= 10 ? '1-10' : hi <= 50 ? '11-50' : hi <= 200 ? '51-200' : hi <= 500 ? '201-500' : '500+';
}

/** Score of one kind of reviewer. Below `min` reviews no number is published. Reviews without a number are not averaged. */
export function scoreSummary(items: ScoreItem[], kind: 'expert' | 'user', min: number) {
  const xs = items.filter((i) => i.kind === kind);
  const enough = xs.length >= min;
  const scores = xs.map((i) => i.score).filter((s): s is number => typeof s === 'number' && Number.isFinite(s));
  return { count: xs.length, score: enough ? avg(scores) : null, enough };
}

/** Share of reviewers who would recommend. Only reviews with a yes or no answer count, and below `min` of them no number is published. */
export function recommendSummary(items: ScoreItem[], min: number) {
  const rec = items.filter((i) => i.recommend !== null && i.recommend !== undefined);
  const pct = rec.length >= min ? Math.round((rec.filter((i) => i.recommend).length / rec.length) * 100) : null;
  return { pct, base: rec.length };
}