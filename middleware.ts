import { type NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIX = '/projects';

function isPublic(pathname: string): boolean {
   return (
      pathname === '/login' ||
      pathname === '/signup' ||
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon')
   );
}

// Check cookie presence only — fast, no DB call.
// Full session validation happens in server components via auth.api.getSession().
export function middleware(request: NextRequest): NextResponse {
   const { pathname } = request.nextUrl;

   if (!pathname.startsWith(PROTECTED_PREFIX) || isPublic(pathname)) {
      return NextResponse.next();
   }

   const hasSession =
      request.cookies.has('better-auth.session_token') ||
      request.cookies.has('__Secure-better-auth.session_token');

   if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
   }

   return NextResponse.next();
}

export const config = {
   matcher: ['/projects/:path*'],
};
