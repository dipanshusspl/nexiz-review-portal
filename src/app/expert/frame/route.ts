import { can, getCurrentUser } from '@/lib/auth/current-user';
import { EXPERT_PORTFOLIO_HTML } from '@/lib/expert-portfolio-html';
import { loadCatalog, loadExpertState } from '@/lib/expert';

export const dynamic = 'force-dynamic';

/** JSON that is safe to place inside an inline <script> (no "</script>", no U+2028/2029). */
const safeJson = (v: unknown) =>
  JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

/** The client's Expert portfolio screen, filled with live data from the database. Only 'expert.panel' users (and admins) get it. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || !can(user, 'expert.panel')) return new Response('Forbidden', { status: 403 });

  let catalogJson: string, stateJson: string;
  try {
    const [catalog, state] = await Promise.all([loadCatalog(), loadExpertState(user)]);
    catalogJson = safeJson(catalog);
    stateJson = safeJson(state);
  } catch (e) {
    console.error('expert frame load failed', e);
    return new Response('Could not load the expert screen. Please try again.', { status: 500 });
  }

  // ONE pass over the HTML, so text inside the data can never be mistaken for a placeholder.
  const html = EXPERT_PORTFOLIO_HTML.replace(/__(CATALOG|INITIAL_STATE)_JSON__/g, (_m, k: string) =>
    k === 'CATALOG' ? catalogJson : stateJson);

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'private, no-store',
      'x-frame-options': 'SAMEORIGIN',
    },
  });
}

// import { can, getCurrentUser } from '@/lib/auth/current-user';
// import { EXPERT_PORTFOLIO_HTML } from '@/lib/expert-portfolio-html';

// export const dynamic = 'force-dynamic';

// /** The client's Expert portfolio screen. Only users with the 'expert.panel' permission (and admins) get it. */
// export async function GET() {
//   const user = await getCurrentUser();
//   if (!user || !can(user, 'expert.panel')) return new Response('Forbidden', { status: 403 });
//   const html = EXPERT_PORTFOLIO_HTML.replace('__USER_KEY__', user.id.replace(/[^a-zA-Z0-9-]/g, ''));
//   return new Response(html, {
//     headers: {
//       'content-type': 'text/html; charset=utf-8',
//       'cache-control': 'private, no-store',
//       'x-frame-options': 'SAMEORIGIN',
//     },
//   });
// }
