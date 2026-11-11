/** The old "save everything" endpoint is retired: it rewrote every review on each save. Use /expert/api/review and /expert/api/profile. */
export const dynamic = 'force-dynamic';
export async function POST() {
  return new Response(JSON.stringify({ ok: false, error: 'This endpoint was replaced.' }), { status: 410, headers: { 'content-type': 'application/json' } });
}
