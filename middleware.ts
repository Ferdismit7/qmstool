
import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default withAuth(
  function middleware(request: NextRequest) {
    console.log('Middleware called for path:', request.nextUrl.pathname);
    
    // Skip auth check for auth-related routes
    if (request.nextUrl.pathname.startsWith('/auth')) {
      console.log('Skipping auth check for auth route');
      return NextResponse.next();
    }

    // Skip auth check for static files and images
    if (request.nextUrl.pathname.startsWith('/_next') || 
        request.nextUrl.pathname.startsWith('/favicon.ico') ||
        request.nextUrl.pathname.startsWith('/images/')) {
      console.log('Skipping auth check for static resource');
      return NextResponse.next();
    }

    // For API routes, let them handle their own authentication
    if (request.nextUrl.pathname.startsWith('/api')) {
      console.log('Skipping auth check for API route');
      return NextResponse.next();
    }

    console.log('Request authorized, allowing to proceed');
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to auth pages without token
        if (req.nextUrl.pathname.startsWith('/auth')) {
          return true;
        }
        
        // Allow access to static files
        if (req.nextUrl.pathname.startsWith('/_next') || 
            req.nextUrl.pathname.startsWith('/favicon.ico') ||
            req.nextUrl.pathname.startsWith('/images/')) {
          return true;
        }
        
        // Allow access to API routes (they handle their own auth)
        if (req.nextUrl.pathname.startsWith('/api')) {
          return true;
        }
        
        // For all other routes, require a valid token
        return !!token;
      },
    },
    pages: {
      signIn: "/auth",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Temporarily disable middleware to test NextAuth
     * '/((?!auth|_next|favicon.ico|images|api).*)'
     */
  ]
}; 