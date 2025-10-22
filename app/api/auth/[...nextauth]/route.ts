import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { initializeSecrets } from "@/lib/awsSecretsManager";
import { NextResponse } from "next/server";

// Ensure this route runs on the Node.js runtime (some providers don't work on Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Initialize secrets before creating the NextAuth handler
async function getHandler() {
  await initializeSecrets();
  return NextAuth(authOptions);
}

export const GET = async (req: Request) => {
  try {
    const handler = await getHandler();
    return handler(req);
  } catch (error) {
    console.error('[NextAuth][GET] Initialization error:', error);
    return NextResponse.json({ success: false, route: 'GET', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
};

export const POST = async (req: Request) => {
  try {
    const handler = await getHandler();
    return handler(req);
  } catch (error) {
    console.error('[NextAuth][POST] Initialization error:', error);
    return NextResponse.json({ success: false, route: 'POST', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
};
