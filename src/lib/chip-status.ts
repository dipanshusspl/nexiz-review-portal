/**
 * Added by Prachi, 2026-11-03.
 * Status of one compliance chip (ZATCA, WPS, GOSI, Qiwa), worked out from reviewers' answers.
 * Pure functions only, so they can be unit-tested with `npm test`.
 *
 * Spec p.10: user and expert answers are reviewer experience, not official evidence.
 * Spec section 1.3 / 8.3: contradictions are preserved and shown, not resolved silently.
 */
export type Answer = 'ok' | 'partial' | 'no';
export type ChipStatus = Answer | 'none' | 'mixed';

/**
 * Added by Prachi, 2026-11-03: policy value to confirm with Nexiz.
 * If no single answer is given by at least this share of the reviewers, the chip says "Reviewers disagree"
 * instead of picking one answer.
 */
export const MIXED_BELOW_SHARE = 0.6;

export type Counts = Record<Answer, number>;

export function chipStatus(
  answers: Answer[],
  minAnswers: number,
  mixedBelowShare: number = MIXED_BELOW_SHARE,
): { status: ChipStatus; answers: number; counts: Counts } {
  const counts: Counts = { ok: 0, partial: 0, no: 0 };
  answers.forEach((a) => { counts[a] += 1; });
  const n = answers.length;
  if (n < minAnswers) return { status: 'none', answers: n, counts };      // too few answers: nothing is published
  const max = Math.max(counts.ok, counts.partial, counts.no);
  if (max / n < mixedBelowShare) return { status: 'mixed', answers: n, counts };
  const status = (['no', 'partial', 'ok'] as Answer[]).find((a) => counts[a] === max) ?? 'none';
  return { status, answers: n, counts };
}