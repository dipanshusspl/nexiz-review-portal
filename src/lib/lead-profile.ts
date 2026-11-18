// Added by Prachi, 2026-11-17: business details we already hold for a logged-in user (from an earlier pricing request),
// so the pricing form does not ask for them again.
import 'server-only';
import { db } from '@/lib/supabase/admin';

export type KnownBusiness = { branches_count: string; system_users_count: string; employees_count: string; business_activity: string };

export async function knownBusiness(userId: string): Promise<KnownBusiness | null> {
  const { data } = await db().from('rv_demo_requests')
    .select('branches_count,system_users_count,employees_count,business_activity')
    .eq('user_id', userId)
    .not('branches_count', 'is', null).not('system_users_count', 'is', null)
    .not('employees_count', 'is', null).not('business_activity', 'is', null)
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  return (data as KnownBusiness | null) ?? null;
}