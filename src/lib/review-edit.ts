/**
 * Added by Prachi, 2026-11-03.
 * Rules for saving an edited web review. Pure functions only (no database, no 'server-only'),
 * so they can be unit-tested with `npm test`.
 *
 * Spec p.4: evidence is append-only; corrections create new versions instead of rewriting.
 * Spec p.11: "validated" means a reviewer or a deterministic process accepted it under a known policy,
 *            so a user may not release their own pending review by editing it.
 */

/**
 * Added by Prachi, 2026-11-03: Policy switch (to confirm with Nexiz): when a live (approved) review is edited, does it go back to a person?
 * true  = the edited review is hidden until a moderator approves it again (safer).
 * false = the edit stays live, as new reviews do; the old text is still kept in history.
 */
export const EDIT_REQUIRES_MODERATION = true;

/** Added by Prachi, 2026-11-03: Fields a reader can see. A change to any of these counts as an edit of the review's content. */
export const CONTENT_FIELDS = [
  'rating_overall', 'rating_ease', 'rating_support', 'rating_value',
  'usage_duration', 'pros', 'cons', 'would_recommend',
  'reviewer_role', 'company_size', 'zatca_status',
  'still_using', 'moved_to_software_id', 'anonymous',
] as const;

export type ReviewLike = Record<string, unknown>;
// Changed by Prachi, 2026-11-03: added 'retired' (Spec p.11). A retired review no longer counts but is kept.
export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'retired';

const norm = (v: unknown) => (v === undefined || v === '' ? null : v);

export function reviewContentChanged(prev: ReviewLike, next: ReviewLike): boolean {
  return CONTENT_FIELDS.some((k) => norm(prev[k]) !== norm(next[k]));
}

/** Added by Prachi, 2026-11-03: The status a web review gets when it is saved. */
export function statusAfterSave(o: {
  previous: ReviewStatus | null;   // null = brand new review
  contentChanged: boolean;
  escalated: boolean;              // an escalation rule fired (extreme ratings, burst)
  editsNeedModeration?: boolean;
}): 'pending' | 'approved' {
  const editsNeedModeration = o.editsNeedModeration ?? EDIT_REQUIRES_MODERATION;
  if (o.escalated) return 'pending';
  // a rejected or pending review can only be released by a moderator, never by editing it
  if (o.previous === 'rejected' || o.previous === 'pending' || o.previous === 'retired') return 'pending'; // Changed by Prachi, 2026-11-03: retired added
  if (o.previous === 'approved' && o.contentChanged && editsNeedModeration) return 'pending';
  return 'approved';
}

/** Added by Prachi, 2026-11-03: What is stored in history: the row as it was, without the confirmation token. */
export function snapshotOf(row: ReviewLike): ReviewLike {
  const { confirm_token: _token, ...rest } = row;
  return rest;
}