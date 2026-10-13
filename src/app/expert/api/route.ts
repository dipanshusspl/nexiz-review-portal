import { can, getCurrentUser } from '@/lib/auth/current-user';
import { ExpertInputError, saveExpertProfile } from '@/lib/expert';

export const dynamic = 'force-dynamic';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

/** Saves the logged-in expert's profile (draft or final). The user id always comes from the session, never from the request. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user, 'expert.panel')) return json({ ok: false, error: 'Forbidden' }, 403);
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) return json({ ok: false, error: 'Bad request' }, 400);

  const raw = await req.text();
  if (raw.length > 1_500_000) return json({ ok: false, error: 'Request too large.' }, 413);
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return json({ ok: false, error: 'Bad request' }, 400); }

  try {
    const { photo_url, status } = await saveExpertProfile(user, body);
    return json({ ok: true, photo_url, status });
  } catch (e) {
    if (e instanceof ExpertInputError) return json({ ok: false, error: e.message }, 400);
    console.error('expert save failed', e);
    return json({ ok: false, error: 'Could not save. Please try again.' }, 500);
  }
}
