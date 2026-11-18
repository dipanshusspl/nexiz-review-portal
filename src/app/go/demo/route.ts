// Added by Prachi, 2026-11-17: every click on "Request a Demo" goes through here first.
// It writes one row to rv_cta_clicks, then sends the visitor on to /request-demo. A plain <a> must be used (not <Link>), because Link prefetch would count as a click.
import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getLang } from '@/lib/i18n';
import { db } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const slug = (req.nextUrl.searchParams.get('slug') ?? '').trim().slice(0, 120);
  const dest = new URL('/request-demo', req.nextUrl.origin);
    if (req.nextUrl.searchParams.get('embed') === '1') dest.searchParams.set('embed', '1');   // opened inside the pop-up
  if (!slug) return NextResponse.redirect(dest);
  dest.searchParams.set('product', slug);

  // A failed log must never stop the visitor from reaching the form.
  try {
    const [{ data: sw }, user, lang] = await Promise.all([
      db().from('rv_software').select('id').eq('slug', slug).maybeSingle(),
      getCurrentUser().catch(() => null),
      getLang(),
    ]);
    const { data: click, error } = await db().from('rv_cta_clicks').insert({
      software_id: sw?.id ?? null, software_slug: slug, cta: 'demo', user_id: user?.id ?? null, lang,
    }).select('id').single();
    if (error) console.error('cta click not written:', error.message);
    else if (click) dest.searchParams.set('click', click.id);
  } catch (e) {
    console.error('cta click not written:', e);
  }
  return NextResponse.redirect(dest);
}