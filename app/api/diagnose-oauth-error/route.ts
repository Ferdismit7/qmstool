import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import { getAuthOptions } from '@/lib/auth-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Diagnostic endpoint to check OAuth configuration issues
 * Call this when you see a Configuration error after Okta login
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const errorParam = url.searchParams.get('error');
  
  const results: {
    timestamp: string;
    errorCode: string | null;
    diagnosis: Record<string, unknown>;
    checks: Record<string, unknown>;
    fixes: string[];
  } = {
    timestamp: new Date().toISOString(),
    errorCode: errorParam,
    diagnosis: {},
    checks: {},
    fixes: [],
  };

  try {
    await initializeSecrets();

    // Check 1: Verify all environment variables are available
    const envCheck = {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING',
      OKTA_CLIENT_ID: !!process.env.OKTA_CLIENT_ID,
      OKTA_CLIENT_SECRET: !!process.env.OKTA_CLIENT_SECRET,
      OKTA_ISSUER: process.env.OKTA_ISSUER || 'MISSING',
    };
    results.checks.environmentVariables = envCheck;

    // Check 2: Verify NEXTAUTH_URL matches expected callback
    const expectedCallbackUrl = `${process.env.NEXTAUTH_URL}/api/auth/callback/okta`;
    results.checks.callbackUrl = {
      expected: expectedCallbackUrl,
      note: 'This MUST be configured in Okta application settings',
    };

    // Check 3: Test getAuthOptions
    let authOptionsTest = false;
    try {
      await getAuthOptions();
      authOptionsTest = true;
      results.checks.getAuthOptions = { success: true };
    } catch (error) {
      results.checks.getAuthOptions = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      results.fixes.push('Fix getAuthOptions error - check AWS Secrets Manager configuration');
    }

    // Check 4: Verify NEXTAUTH_SECRET length (must be at least 32 chars)
    const secretLength = process.env.NEXTAUTH_SECRET?.length || 0;
    results.checks.secretLength = {
      currentLength: secretLength,
      isValid: secretLength >= 32,
      note: secretLength < 32 ? 'NEXTAUTH_SECRET must be at least 32 characters' : 'OK',
    };

    if (secretLength < 32) {
      results.fixes.push('NEXTAUTH_SECRET is too short - must be at least 32 characters');
    }

    // Diagnosis based on error code
    if (errorParam === 'Configuration') {
      results.diagnosis.problem = 'Configuration error usually means NextAuth cannot initialize the provider during callback';
      results.diagnosis.commonCauses = [
        'Redirect URI mismatch - callback URL not configured correctly in Okta',
        'NEXTAUTH_SECRET is missing or invalid',
        'Environment variables not available during callback processing',
        'Okta provider configuration issue',
      ];

      results.fixes.push(
        `1. Verify redirect URI in Okta: Go to Okta Admin Console > Applications > Your App > General Settings > Sign-in redirect URIs`,
        `2. Add this EXACT URL: ${expectedCallbackUrl}`,
        `3. Make sure there are no trailing slashes or differences`,
        `4. Check NEXTAUTH_SECRET is at least 32 characters in AWS Secrets Manager`,
        `5. Verify all environment variables are set in AWS Secrets Manager`
      );
    }

    // Check 5: Test Okta discovery endpoint
    if (process.env.OKTA_ISSUER) {
      try {
        const wellKnownUrl = `${process.env.OKTA_ISSUER}/.well-known/openid-configuration`;
        const discoveryRes = await fetch(wellKnownUrl);
        results.checks.oktaDiscovery = {
          accessible: discoveryRes.ok,
          status: discoveryRes.status,
          note: discoveryRes.ok ? 'OK' : `Failed: HTTP ${discoveryRes.status}`,
        };
      } catch (error) {
        results.checks.oktaDiscovery = {
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

