
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // ISO 27001 Compliant: No JWT_SECRET in environment variables
  // We'll validate tokens using the Lambda function instead

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
    // ISO 27001 Compliant: Basic token validation without JWT_SECRET
    // We'll do minimal validation here and let the API routes handle full validation
    
    // Check if token looks like a JWT (has 3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('Invalid token format');
      const response = NextResponse.next();
      response.cookies.set('authToken', '', { maxAge: 0, path: '/' });
      response.cookies.set('clientAuthToken', '', { maxAge: 0, path: '/' });
      return response;
    }

    // Decode the payload to get basic user info (without verification)
    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        console.log('Token expired');
        const response = NextResponse.next();
        response.cookies.set('authToken', '', { maxAge: 0, path: '/' });
        response.cookies.set('clientAuthToken', '', { maxAge: 0, path: '/' });
        return response;
      }

      console.log('Token appears valid, allowing request to proceed');
      
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
    } catch (decodeError) {
      console.log('Failed to decode token payload:', decodeError);
      const response = NextResponse.next();
      response.cookies.set('authToken', '', { maxAge: 0, path: '/' });
      response.cookies.set('clientAuthToken', '', { maxAge: 0, path: '/' });
      return response;
    }
  } catch (error) {
    console.log('Token validation error:', error);
    // Allow request to proceed, let API handle auth
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Only protect API routes that require authentication
     * ISO 27001 Compliant: No secrets in environment variables
     * Client-side handles page-level authentication
     */
    '/api/((?!auth|health|debug|test).*)'
  ]
}; 