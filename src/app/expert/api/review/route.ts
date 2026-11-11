import { can, getCurrentUser } from '@/lib/auth/current-user';
import { ExpertInputError } from '@/lib/expert';
import { saveReview } from '@/lib/expert-v2';

export const dynamic = 'force-dynamic';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

/**
 * Saves ONE review (draft or submit). The user always comes from the session, never from the request.
 * "ok: true" is only returned after the database confirmed the write, which is what the "Saved" indicator relies on.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return json({ ok: false, error: 'signin' }, 401);
  if (!can(user, 'expert.panel')) return json({ ok: false, error: 'Forbidden' }, 403);
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) return json({ ok: false, error: 'Bad request' }, 400);
  const raw = await req.text();
  if (raw.length > 300_000) return json({ ok: false, error: 'Request too large.' }, 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return json({ ok: false, error: 'Bad request' }, 400); }
  try {
    const r = await saveReview(user, body);
    return r.ok ? json({ ok: true, review: r.review, savedAt: new Date().toISOString() }) : json({ ok: false, errors: r.errors }, 422);
  } catch (e) {
    if (e instanceof ExpertInputError) return json({ ok: false, error: e.message }, 400);
    console.error('expert review save failed', e);
    return json({ ok: false, error: 'Could not save. Please try again.' }, 500);
  }
}
