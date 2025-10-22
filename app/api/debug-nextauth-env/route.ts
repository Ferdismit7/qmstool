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

import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function GET() {
  try {
    console.log('🔍 [Debug] Starting NextAuth environment check...');
    
    // Initialize secrets
    await initializeSecrets();
    
    // Check environment variables
    const envCheck = {
      NEXTAUTH_SECRET: {
        exists: !!process.env.NEXTAUTH_SECRET,
        length: process.env.NEXTAUTH_SECRET?.length || 0,
        preview: process.env.NEXTAUTH_SECRET ? `${process.env.NEXTAUTH_SECRET.substring(0, 8)}...` : 'NOT SET'
      },
      NEXTAUTH_URL: {
        exists: !!process.env.NEXTAUTH_URL,
        value: process.env.NEXTAUTH_URL || 'NOT SET'
      },
      OKTA_CLIENT_ID: {
        exists: !!process.env.OKTA_CLIENT_ID,
        value: process.env.OKTA_CLIENT_ID || 'NOT SET'
      },
      OKTA_CLIENT_SECRET: {
        exists: !!process.env.OKTA_CLIENT_SECRET,
        length: process.env.OKTA_CLIENT_SECRET?.length || 0,
        preview: process.env.OKTA_CLIENT_SECRET ? `${process.env.OKTA_CLIENT_SECRET.substring(0, 8)}...` : 'NOT SET'
      },
      OKTA_ISSUER: {
        exists: !!process.env.OKTA_ISSUER,
        value: process.env.OKTA_ISSUER || 'NOT SET'
      },
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        preview: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 20)}...` : 'NOT SET'
      },
      LAMBDA_FUNCTION_URL: {
        exists: !!process.env.LAMBDA_FUNCTION_URL,
        value: process.env.LAMBDA_FUNCTION_URL || 'NOT SET'
      }
    };

    const allRequiredSet = envCheck.NEXTAUTH_SECRET.exists && 
                          envCheck.OKTA_CLIENT_ID.exists && 
                          envCheck.OKTA_CLIENT_SECRET.exists && 
                          envCheck.OKTA_ISSUER.exists;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      allRequiredVariablesSet: allRequiredSet,
      message: allRequiredSet ? 'All required NextAuth variables are set' : 'Some required NextAuth variables are missing'
    });
  } catch (error) {
    console.error('❌ [Debug] NextAuth environment check failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}