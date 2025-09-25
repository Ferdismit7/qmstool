import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// SECURITY FIX: Removed JWT_SECRET logging - NEVER log secrets
// console.log('MIDDLEWARE JWT_SECRET:', process.env.JWT_SECRET); // REMOVED

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

  // Skip auth check for static files and images
  if (request.nextUrl.pathname.startsWith('/_next') || 
      request.nextUrl.pathname.startsWith('/favicon.ico') ||
      request.nextUrl.pathname.startsWith('/images/')) {
    console.log('Skipping auth check for static resource');
    return NextResponse.next();
  }

  // Check if JWT_SECRET is available (for build-time safety)
  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET not available in middleware - redirecting to auth');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Check for token in HttpOnly cookies first (most secure)
  let token = request.cookies.get('authToken')?.value;
  console.log('Token from HttpOnly cookies:', token ? 'Found' : 'Not found');

  // If not in HttpOnly cookies, check client-side cookies
  if (!token) {
    token = request.cookies.get('clientAuthToken')?.value;
    console.log('Token from client cookies:', token ? 'Found' : 'Not found');
  }

  // If not in cookies, check Authorization header
  if (!token) {
    const authHeader = request.headers.get('authorization');
    console.log('Authorization header:', authHeader);
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log('Token from Authorization header:', token ? 'Found' : 'Not found');
    }
  }

  if (!token) {
    console.log('No token found in cookies or headers, redirecting to auth');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    console.log('Token verified successfully, payload:', payload);
    
    // Add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId?.toString() || '');
    requestHeaders.set('x-user-email', payload.email?.toString() || '');
    requestHeaders.set('x-user-username', payload.username?.toString() || '');
    requestHeaders.set('x-user-business-area', payload.businessArea?.toString() || '');
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.log('Token verification failed:', error);
    console.log('Token that failed:', token.substring(0, 20) + '...');
    
    // Clear invalid cookies
    const response = NextResponse.redirect(new URL('/auth', request.url));
    response.cookies.set('authToken', '', { maxAge: 0, path: '/' });
    response.cookies.set('clientAuthToken', '', { maxAge: 0, path: '/' });
    
    return response;
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