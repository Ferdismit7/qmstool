import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import OktaProvider from 'next-auth/providers/okta';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    await initializeSecrets();

    const env = {
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID || '',
      OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET ? 'set' : 'missing',
      OKTA_ISSUER: process.env.OKTA_ISSUER || '',
      NODE_ENV: process.env.NODE_ENV || '',
    };

    // Try provider construction (catches common env/issuer errors early)
    let oktaProviderConstructed = false;
    let oktaProviderError: string | null = null;
    try {
      OktaProvider({
        clientId: process.env.OKTA_CLIENT_ID!,
        clientSecret: process.env.OKTA_CLIENT_SECRET!,
        issuer: process.env.OKTA_ISSUER!,
      });
      oktaProviderConstructed = true;
    } catch (e) {
      oktaProviderError = e instanceof Error ? e.message : 'Unknown provider error';
    }

    // Check Okta discovery document reachability
    let discovery: Record<string, unknown> | null = null;
    let discoveryStatus = 0;
    let discoveryError: string | null = null;
    try {
      const wellKnown = `${process.env.OKTA_ISSUER}/.well-known/openid-configuration`;
      const res = await fetch(wellKnown, { method: 'GET' });
      discoveryStatus = res.status;
      if (res.ok) {
        const json = await res.json();
        discovery = {
          issuer: json.issuer,
          authorization_endpoint: json.authorization_endpoint,
          token_endpoint: json.token_endpoint,
          jwks_uri: json.jwks_uri,
        };
      } else {
        discoveryError = `HTTP ${res.status}`;
      }
    } catch (e) {
      discoveryError = e instanceof Error ? e.message : 'Unknown fetch error';
    }

    return NextResponse.json({
      success: true,
      env,
      oktaProviderConstructed,
      oktaProviderError,
      discoveryStatus,
      discovery,
      discoveryError,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}