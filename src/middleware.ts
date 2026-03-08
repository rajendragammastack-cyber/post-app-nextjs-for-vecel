import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

const publicPaths = ['/login', '/register'];
const authPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p));
  const isAuthPath = authPaths.some((p) => pathname === p);

  // Logged in user visiting login/register -> redirect to home
  if (token && isAuthPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Not logged in and trying to access protected route (including home) -> redirect to login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
