import { db } from '@/lib/supabase/admin';
import { categoryStats, GO_LIVE_MIN_PRODUCTS, GO_LIVE_MIN_REVIEWS } from '@/lib/stats';

export const dynamic = 'force-dynamic';

/**
 * Nightly go-live (client answer 4). Vercel Cron calls this once a night (see vercel.json).
 *  - A hidden top-level category goes live at 5+ products and 3+ published (verified + approved) reviews.
 *  - It only OPENS categories. It never closes one: links and search results may already point at it.
 *  - live_override = true forces a category live (partner demo / launch).
 * Protected by CRON_SECRET: Vercel sends "Authorization: Bearer <CRON_SECRET>".
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return new Response('Unauthorized', { status: 401 });

  const [{ data: cats, error }, stats] = await Promise.all([
    db().from('rv_categories').select('id,slug,is_live,live_override,parent_id'),
    categoryStats(),
  ]);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  const opened: string[] = [];
  for (const c of (cats ?? []) as { id: string; slug: string; is_live: boolean; live_override: boolean; parent_id: string | null }[]) {
    if (c.is_live || c.parent_id) continue; // already live, or a sub-tag folded into its parent
    const s = stats.get(c.id) ?? { products: 0, reviews: 0 };
    if (c.live_override || (s.products >= GO_LIVE_MIN_PRODUCTS && s.reviews >= GO_LIVE_MIN_REVIEWS)) {
      const { error: e } = await db().from('rv_categories').update({ is_live: true, went_live_at: new Date().toISOString() }).eq('id', c.id);
      if (!e) opened.push(c.slug);
    }
  }
  return Response.json({ ok: true, opened });
}
