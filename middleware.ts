import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

console.log('MIDDLEWARE JWT_SECRET:', process.env.JWT_SECRET);

export async function middleware(request: NextRequest) {
  console.log('Middleware called for path:', request.nextUrl.pathname);
  
  // Skip auth check for auth-related routes
  if (request.nextUrl.pathname.startsWith('/auth')) {
    console.log('Skipping auth check for auth route');
    return NextResponse.next();
  }

  // Skip auth check for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    console.log('Skipping auth check for API route');
    return NextResponse.next();
  }

  // Check if JWT_SECRET is available (for build-time safety)
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET not available in middleware');
    return NextResponse.next();
  }

  const token = request.cookies.get('authToken')?.value;

  if (!token) {
    console.log('No token found, redirecting to auth');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    console.log('Token verified successfully');
    return NextResponse.next();
  } catch (error) {
    console.log('Token verification failed:', error);
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