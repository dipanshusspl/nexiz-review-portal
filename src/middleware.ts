import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth/session';

/** Cheap gate: no valid signed cookie -> /login. Real permission checks happen on the server per page/action. */
export async function middleware(req: NextRequest) {
  const uid = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!uid) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Changed by Prachi, 2026-11-11: tech-stack added to the paths that need no login (like product and profilepage).
// Changed by Prachi, 2026-11-17: review added, so /review opens without login. Saving a review still needs login (checked in actions/review.ts).
export const config = {
  // matcher: ['/((?!login|confirm|product|profilepage|tech-stack|verification|privacy|api/cron|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],   // old, before 2026-11-17
  // matcher: ['/((?!login|confirm|product|profilepage|review|request-demo|go/demo|tech-stack|verification|privacy|api/cron|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
  //matcher: ['/((?!login|confirm|product|profilepage|review|expert|auth/|forgot-password|request-demo|go/demo|contact-vendor|go/contact|tech-stack|verification|privacy|api/cron|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
  matcher: ['/((?!login|confirm|product|profilepage|compare|review|expert|auth/|forgot-password|request-demo|go/demo|contact-vendor|go/contact|tech-stack|verification|privacy|api/cron|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
}
