import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth/session';

/** Cheap gate: no valid signed cookie -> /login. Real permission checks happen on the server per page/action. */
export async function middleware(req: NextRequest) {
  const uid = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!uid) {
    // Public feedback entry: /review?category=accounting-invoicing is reachable without login
    if (req.nextUrl.pathname === '/review' && req.nextUrl.searchParams.get('category') === 'accounting-invoicing') {
      return NextResponse.next();
    }
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
    matcher: ['/((?!login|register|confirm|product|verification|privacy|review|api/cron|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
};
