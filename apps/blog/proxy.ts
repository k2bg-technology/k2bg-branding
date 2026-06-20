import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

// Next.js 16 renamed `middleware` to `proxy` (nodejs runtime). Optimistic
// redirect based on session-cookie presence only — this is an optimization, not
// the security boundary. app/settings/layout.tsx performs the authoritative
// getSession check that rejects forged or expired cookies.
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/settings/:path*'],
};
