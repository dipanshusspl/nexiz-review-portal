/**
 * Added by Prachi, 2026-11-05 (gap 6.9). Writes one verification record (how a review was verified) and one audit line.
 * Best effort: it never throws, so saving a review is not blocked if the table is missing (sql/006_review_portal_batch2.sql).
 */
import 'server-only';
import { db } from '@/lib/supabase/admin';
import { audit } from '@/lib/audit';
import type { VerificationMethod } from '@/lib/verification';

export async function recordVerification(
  reviewId: string,
  method: VerificationMethod,
  verifiedBy: string | null,
  note?: string | null,
): Promise<boolean> {
  try {
    const { error } = await db().from('rv_review_verifications').upsert(
      { review_id: reviewId, method, verified_by: verifiedBy, evidence_note: note ?? null },
      { onConflict: 'review_id,method', ignoreDuplicates: true },
    );
    if (error) { console.error('verification record not saved:', error.message); return false; }
    await audit(verifiedBy, 'review.verify', 'review', reviewId, { method });
    return true;
  } catch (e) {
    console.error('verification record not saved:', e);
    return false;
  }
}