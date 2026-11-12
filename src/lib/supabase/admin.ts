import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

/** Server-only Supabase client (service-role key). All DB access in this app goes through here. */
export function db(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('SUPABASE_URL is required.');
  if (!key) throw new Error('SUPABASE_SECRET_KEY is required.');
  cached = createClient(url, key, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
    global: { headers: { 'X-Client-Info': 'nexiz-review-portal/1.0' } },
  });
  return cached;
}

export const IMAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'nexiz-images';
