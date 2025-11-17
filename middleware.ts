import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const shouldBypass = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/auth')) {
    return true;
  }

  if (pathname.startsWith('/api')) {
    return true;
  }

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/images/')
  ) {
    return true;
  }

  return false;
};

const hasClientToken = (request: NextRequest) => {
  const token =
    request.cookies.get('authToken')?.value ||
    request.cookies.get('clientAuthToken')?.value;

  return typeof token === 'string' && token.trim().length > 0;
};

export default function middleware(request: NextRequest) {
  if (shouldBypass(request)) {
    return NextResponse.next();
  }

  if (hasClientToken(request)) {
    return NextResponse.next();
  }

  const signInUrl = new URL('/auth', request.url);
  signInUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ['/((?!api|auth|_next|favicon.ico|images).*)'],
};