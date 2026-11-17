/**
 * Added by Prachi, 2026-11-03.
 * Writes one line to rv_audit_log (who did what, to which record, when).
 * Spec p.22: validation, rejection, publication, role changes and similar actions must be auditable.
 * It never throws: if the log cannot be written (for example sql/005_review_portal_changes.sql has not been run yet), the action itself still works
 * and the problem is printed to the server log.
 */
import 'server-only';
import { db } from '@/lib/supabase/admin';

export async function audit(
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, unknown> = {},
): Promise<void> {
  try {
    const { error } = await db().from('rv_audit_log').insert({
      actor_id: actorId, action, entity_type: entityType, entity_id: entityId, details,
    });
    if (error) console.error('audit log not written:', action, error.message);
  } catch (e) {
    console.error('audit log not written:', action, e);
  }
}