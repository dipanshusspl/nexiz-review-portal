/**
 * Added by Prachi, 2026-11-05 (gap 6.9). Pure functions only, so they can be unit-tested with `npm test`.
 *
 * WHAT "verified" MEANS in this portal (it is the flag the public counts depend on):
 *   - a WEB review is verified because it comes from an account an admin created. There is no public sign-up.
 *   - a FIELD review is verified when the respondent taps the confirmation link.
 * That is the BASIC level. It does not mean the person's work email, LinkedIn or an invoice was checked.
 * A moderator can record the higher levels later, one record per method, in rv_review_verifications.
 *
 * Spec section 4.2, priority 5 (about p.10): verified user or expert evidence is observed behaviour, not an official source.
 * Spec section 24 (about p.82): the main platform keeps review verification as child records (review_verifications).
 */
export type VerificationMethod = 'account' | 'respondent_confirmed' | 'work_email' | 'linkedin' | 'invoice';
export type VerificationLevel = 'basic' | 'identity' | 'proof';

export const VERIFICATION_METHODS = ['account', 'respondent_confirmed', 'work_email', 'linkedin', 'invoice'] as const;
/** The methods a moderator can add by hand. The first two are recorded by the system. */
export const ADDED_METHODS = ['work_email', 'linkedin', 'invoice'] as const;

export const METHOD_LEVEL: Record<VerificationMethod, VerificationLevel> = {
  account: 'basic', respondent_confirmed: 'basic', work_email: 'identity', linkedin: 'identity', invoice: 'proof',
};
export const METHOD_LABEL: Record<VerificationMethod, string> = {
  account: 'account created by an admin',
  respondent_confirmed: 'respondent confirmed by link',
  work_email: 'work email checked',
  linkedin: 'LinkedIn profile checked',
  invoice: 'invoice or proof of use seen',
};
export const LEVEL_LABEL: Record<VerificationLevel, string> = {
  basic: 'Basic', identity: 'Identity checked', proof: 'Proof of use seen',
};

const ORDER: VerificationLevel[] = ['basic', 'identity', 'proof'];

export const isVerificationMethod = (v: unknown): v is VerificationMethod =>
  typeof v === 'string' && (VERIFICATION_METHODS as readonly string[]).includes(v);

export const isAddedMethod = (v: unknown): v is (typeof ADDED_METHODS)[number] =>
  typeof v === 'string' && (ADDED_METHODS as readonly string[]).includes(v);

/** The highest level reached by the recorded methods. Unknown methods are ignored. null = nothing recorded. */
export function verificationLevel(methods: readonly string[]): VerificationLevel | null {
  let best = -1;
  for (const m of methods) if (isVerificationMethod(m)) best = Math.max(best, ORDER.indexOf(METHOD_LEVEL[m]));
  return best < 0 ? null : ORDER[best];
}