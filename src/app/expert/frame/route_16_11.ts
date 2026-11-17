import { can, getCurrentUser } from '@/lib/auth/current-user';
import { EXPERT_WIZARD_HTML } from '@/lib/expert-wizard-html';
import { loadMyReviews, loadProfileState, loadReviewCatalog } from '@/lib/expert-v2';
import { providerConfigured } from '@/lib/auth/oauth';

export const dynamic = 'force-dynamic';

/** JSON that is safe to place inside an inline <script> (no "</script>", no U+2028/2029). */
const safeJson = (v: unknown) =>
  JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

/**
 * The Expert screen. Anyone can open it and answer step 1 (kept on their device); everything else needs a signed-in expert.
 *   /expert/frame                -> review journey
 *   /expert/frame?view=profile   -> professional profile (signed-in only)
 *   /expert/frame?signin=failed  -> shows "sign-in didn't complete", answers stay
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (user && !can(user, 'expert.panel')) return new Response('Forbidden', { status: 403 });
  const url = new URL(req.url);
  const view = url.searchParams.get('view') === 'profile' && user ? 'profile' : 'review';

  let catalogJson: string, stateJson: string;
  try {
    const [catalog, reviews, profile] = await Promise.all([
      loadReviewCatalog(), user ? loadMyReviews(user) : Promise.resolve([]), user ? loadProfileState(user) : Promise.resolve(null),
    ]);
    catalogJson = safeJson(catalog);
    stateJson = safeJson({
      signedIn: !!user, view, signinFailed: url.searchParams.get('signin') === 'failed',
      user: user ? { name: user.fullName, email: user.email } : null,
      providers: { google: providerConfigured('google'), linkedin: providerConfigured('linkedin') },
      reviews, profile: profile?.profile ?? null, avatar: profile?.avatar ?? '', avatar_from_provider: profile?.avatar_from_provider ?? false,
      specialties: profile?.specialties ?? [], services: profile?.services ?? [], certificates: profile?.certificates ?? [], projects: profile?.projects ?? [],
    });
  } catch (e) {
    console.error('expert frame load failed', e);
    return new Response('Could not load the expert screen. Please try again.', { status: 500 });
  }

  // ONE pass over the HTML, so text inside the data can never be mistaken for a placeholder.
  const html = EXPERT_WIZARD_HTML.replace(/__(CATALOG|STATE)_JSON__/g, (_m, k: string) => (k === 'CATALOG' ? catalogJson : stateJson));
  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store', 'x-frame-options': 'SAMEORIGIN' },
  });
}
