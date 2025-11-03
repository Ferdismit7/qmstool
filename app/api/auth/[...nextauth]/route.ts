import { initializeSecrets } from "@/lib/awsSecretsManager";
import { NextResponse } from "next/server";

// Ensure this route runs on the Node.js runtime (some providers don't work on Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Cache the handler to avoid recreating it on every request
let cachedHandler: ReturnType<typeof NextAuth> | null = null;
let handlerInitializing = false;

// Initialize secrets before creating the NextAuth handler
async function getHandler() {
  // Return cached handler if available
  if (cachedHandler) {
    return cachedHandler;
  }

  // Prevent concurrent initialization
  if (handlerInitializing) {
    // Wait a bit and try again
    await new Promise(resolve => setTimeout(resolve, 100));
    if (cachedHandler) {
      return cachedHandler;
    }
  }

  try {
    handlerInitializing = true;
    console.log('[NextAuth] Initializing handler...');
    
    // Ensure secrets are loaded before importing auth config
    await initializeSecrets();
    
    // Verify critical environment variables are set
    if (!process.env.NEXTAUTH_SECRET || !process.env.NEXTAUTH_URL) {
      throw new Error('NEXTAUTH_SECRET or NEXTAUTH_URL not available after secrets initialization');
    }

    if (!process.env.OKTA_CLIENT_ID || !process.env.OKTA_CLIENT_SECRET || !process.env.OKTA_ISSUER) {
      throw new Error('Okta configuration not available after secrets initialization');
    }

    const NextAuth = (await import('next-auth')).default;
    const { getAuthOptions } = await import('@/lib/auth-config');
    const authOptions = await getAuthOptions();
    
    cachedHandler = NextAuth(authOptions);
    console.log('[NextAuth] Handler initialized and cached successfully');
    
    return cachedHandler;
  } catch (error) {
    console.error('[NextAuth] Failed to initialize handler:', error);
    // Clear cache on error to allow retry
    cachedHandler = null;
    throw error;
  } finally {
    handlerInitializing = false;
  }
}

export const GET = async (req: Request, ctx: unknown) => {
  try {
    // Log the incoming request URL for debugging
    const url = new URL(req.url);
    console.log('[NextAuth][GET] Request path:', url.pathname, 'Query:', url.search);
    
    // Check if this is a callback request
    if (url.pathname.includes('/callback/')) {
      console.log('[NextAuth][GET] OAuth callback detected, initializing handler...');
    }
    
    const handler = await getHandler();
    const res = await handler(req as unknown as Request, ctx as unknown as Record<string, unknown>);
    
    // Log response status
    const status = typeof res?.status === 'number' ? res.status : 'unknown';
    console.log('[NextAuth][GET] Handler response status:', status);
    
    try {
      // If NextAuth returned a 500 or redirect to error page, surface the body to help debugging
      if (typeof res?.status === 'number' && res.status >= 500) {
        const text = await res.text();
        console.error('[NextAuth][GET] Error response body:', text?.slice(0, 500));
        return NextResponse.json({ success: false, route: 'GET', upstreamStatus: res.status, upstreamBody: text?.slice(0, 2000) }, { status: 500 });
      }
      
      // Check if response is redirecting to error page
      if (typeof res?.status === 'number' && (res.status === 302 || res.status === 307 || res.status === 308)) {
        const headers = res.headers as Headers;
        const location = headers.get('location');
        if (location?.includes('/auth/error')) {
          console.warn('[NextAuth][GET] Redirecting to error page:', location);
          // Try to get error details from URL if present
          try {
            const errorUrl = new URL(location, req.url);
            const errorParam = errorUrl.searchParams.get('error');
            if (errorParam) {
              console.error('[NextAuth][GET] NextAuth error code:', errorParam);
            }
          } catch (e) {
            console.log('[NextAuth][GET] Could not parse error URL:', e);
          }
        }
      }
    } catch (e) {
      console.log('[NextAuth][GET] Could not inspect response:', e);
    }
    return res;
  } catch (error) {
    console.error('[NextAuth][GET] Initialization/handler error:', error);
    console.error('[NextAuth][GET] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ success: false, route: 'GET', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
};

export const POST = async (req: Request, ctx: unknown) => {
  try {
    // Log the incoming request URL for debugging
    const url = new URL(req.url);
    console.log('[NextAuth][POST] Request path:', url.pathname, 'Query:', url.search);
    
    const handler = await getHandler();
    const res = await handler(req as unknown as Request, ctx as unknown as Record<string, unknown>);
    
    // Log response status
    const status = typeof res?.status === 'number' ? res.status : 'unknown';
    console.log('[NextAuth][POST] Handler response status:', status);
    
    try {
      if (typeof res?.status === 'number' && res.status >= 500) {
        const text = await res.text();
        console.error('[NextAuth][POST] Error response body:', text?.slice(0, 500));
        return NextResponse.json({ success: false, route: 'POST', upstreamStatus: res.status, upstreamBody: text?.slice(0, 2000) }, { status: 500 });
      }
      
      // Check if response is redirecting to error page
      if (typeof res?.status === 'number' && (res.status === 302 || res.status === 307 || res.status === 308)) {
        const headers = res.headers as Headers;
        const location = headers.get('location');
        if (location?.includes('/auth/error')) {
          console.warn('[NextAuth][POST] Redirecting to error page:', location);
          const errorUrl = new URL(location, req.url);
          const errorParam = errorUrl.searchParams.get('error');
          if (errorParam) {
            console.error('[NextAuth][POST] NextAuth error code:', errorParam);
          }
        }
      }
    } catch (e) {
      console.log('[NextAuth][POST] Could not inspect response:', e);
    }
    return res;
  } catch (error) {
    console.error('[NextAuth][POST] Initialization/handler error:', error);
    console.error('[NextAuth][POST] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ success: false, route: 'POST', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
};
