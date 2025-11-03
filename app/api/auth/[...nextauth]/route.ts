import { initializeSecrets } from "@/lib/awsSecretsManager";
import { NextResponse } from "next/server";

// Ensure this route runs on the Node.js runtime (some providers don't work on Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Cache the handler to avoid recreating it on every request
// The handler is a function that takes Request and returns Response | Promise<Response>
let cachedHandler: ((req: Request, ctx?: unknown) => Response | Promise<Response>) | null = null;
let handlerInitializing = false;

// Initialize secrets before creating the NextAuth handler
async function getHandler(): Promise<(req: Request, ctx?: unknown) => Response | Promise<Response>> {
  // Always ensure secrets are loaded first (critical for serverless environments)
  console.log('[NextAuth] Ensuring secrets are loaded...');
  await initializeSecrets();
  
  // Verify critical environment variables are set BEFORE using cache
  // This prevents using a cached handler from another instance with missing secrets
  const hasRequiredSecrets = !!(
    process.env.NEXTAUTH_SECRET &&
    process.env.NEXTAUTH_URL &&
    process.env.OKTA_CLIENT_ID &&
    process.env.OKTA_CLIENT_SECRET &&
    process.env.OKTA_ISSUER
  );

  if (!hasRequiredSecrets) {
    // Clear cache if secrets are missing - don't use a stale handler
    console.error('[NextAuth] CRITICAL: Required secrets missing! Clearing cache.');
    console.error('[NextAuth] Missing secrets:', {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      OKTA_CLIENT_ID: !!process.env.OKTA_CLIENT_ID,
      OKTA_CLIENT_SECRET: !!process.env.OKTA_CLIENT_SECRET,
      OKTA_ISSUER: !!process.env.OKTA_ISSUER,
    });
    cachedHandler = null;
    throw new Error('NEXTAUTH_SECRET, NEXTAUTH_URL, or Okta configuration not available after secrets initialization');
  }

  // Return cached handler if available AND secrets are valid
  if (cachedHandler) {
    console.log('[NextAuth] Using cached handler');
    return cachedHandler;
  }

  // Prevent concurrent initialization
  if (handlerInitializing) {
    console.log('[NextAuth] Handler initialization in progress, waiting...');
    // Wait a bit and try again (with retries)
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (cachedHandler) {
        console.log('[NextAuth] Cached handler now available');
        return cachedHandler;
      }
    }
    // If still not initialized after retries, throw error
    throw new Error('Handler initialization timed out');
  }

  try {
    handlerInitializing = true;
    console.log('[NextAuth] Initializing handler...');

    const NextAuth = (await import('next-auth')).default;
    const { getAuthOptions } = await import('@/lib/auth-config');
    const authOptions = await getAuthOptions();
    
    const handler = NextAuth(authOptions);
    console.log('[NextAuth] Handler initialized and cached successfully');
    
    if (!handler) {
      throw new Error('Failed to create NextAuth handler');
    }
    
    cachedHandler = handler;
    return handler;
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
      console.log('[NextAuth][GET] ============================================');
      console.log('[NextAuth][GET] OAuth CALLBACK REQUEST DETECTED');
      console.log('[NextAuth][GET] ============================================');
      console.log('[NextAuth][GET] Checking environment variables BEFORE handler creation:');
      console.log('[NextAuth][GET]   NEXTAUTH_SECRET:', !!process.env.NEXTAUTH_SECRET, process.env.NEXTAUTH_SECRET ? `(${process.env.NEXTAUTH_SECRET.length} chars)` : 'MISSING');
      console.log('[NextAuth][GET]   NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'MISSING');
      console.log('[NextAuth][GET]   OKTA_CLIENT_ID:', !!process.env.OKTA_CLIENT_ID, process.env.OKTA_CLIENT_ID ? `(${process.env.OKTA_CLIENT_ID.substring(0, 8)}...)` : 'MISSING');
      console.log('[NextAuth][GET]   OKTA_CLIENT_SECRET:', !!process.env.OKTA_CLIENT_SECRET, process.env.OKTA_CLIENT_SECRET ? '(SET)' : 'MISSING');
      console.log('[NextAuth][GET]   OKTA_ISSUER:', process.env.OKTA_ISSUER || 'MISSING');
    }
    
    const handler = await getHandler();
    if (!handler) {
      throw new Error('Failed to initialize NextAuth handler');
    }
    
    if (url.pathname.includes('/callback/')) {
      console.log('[NextAuth][GET] Handler created successfully, calling NextAuth...');
    }
    
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
    if (!handler) {
      throw new Error('Failed to initialize NextAuth handler');
    }
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
