import { initializeSecrets } from "@/lib/awsSecretsManager";
import { NextResponse } from "next/server";

// Ensure this route runs on the Node.js runtime (some providers don't work on Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Initialize secrets before creating the NextAuth handler
async function getHandler() {
  // Ensure secrets are loaded before importing auth config
  await initializeSecrets();
  const NextAuth = (await import('next-auth')).default;
  const { authOptions } = await import('@/lib/auth-config');
  return NextAuth(authOptions);
}

export const GET = async (req: Request, ctx: unknown) => {
  try {
    const handler = await getHandler();
    const res = await handler(req as unknown as Request, ctx as unknown as Record<string, unknown>);
    try {
      // If NextAuth returned a 500, surface the body to help debugging
      if (typeof res?.status === 'number' && res.status >= 500) {
        const text = await res.text();
        return NextResponse.json({ success: false, route: 'GET', upstreamStatus: res.status, upstreamBody: text?.slice(0, 2000) }, { status: 500 });
      }
    } catch {}
    return res;
  } catch (error) {
    console.error('[NextAuth][GET] Initialization/handler error:', error);
    return NextResponse.json({ success: false, route: 'GET', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
};

export const POST = async (req: Request, ctx: unknown) => {
  try {
    const handler = await getHandler();
    const res = await handler(req as unknown as Request, ctx as unknown as Record<string, unknown>);
    try {
      if (typeof res?.status === 'number' && res.status >= 500) {
        const text = await res.text();
        return NextResponse.json({ success: false, route: 'POST', upstreamStatus: res.status, upstreamBody: text?.slice(0, 2000) }, { status: 500 });
      }
    } catch {}
    return res;
  } catch (error) {
    console.error('[NextAuth][POST] Initialization/handler error:', error);
    return NextResponse.json({ success: false, route: 'POST', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
};
