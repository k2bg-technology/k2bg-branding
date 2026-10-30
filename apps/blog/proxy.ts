import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';

// Every /settings route segment and Server Action authorizes itself.
// This cookie-presence redirect and the layout's session guard are defense in depth.
export function proxy(request: NextRequest): NextResponse {
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/settings/:path*'],
};
