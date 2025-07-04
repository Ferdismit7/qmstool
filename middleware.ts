import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
console.log('MIDDLEWARE JWT_SECRET:', process.env.JWT_SECRET);
export async function middleware(request: NextRequest) {
  // Skip auth check for auth-related routes
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('authToken')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}; 