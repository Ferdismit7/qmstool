import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import OktaProvider from 'next-auth/providers/okta';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    recommendations: [],
  };

  try {
    // Step 1: Initialize secrets
    console.log('[Okta Config Test] Step 1: Initializing secrets...');
    try {
      await initializeSecrets();
      results.checks.secretsInitialized = true;
      console.log('[Okta Config Test] ✅ Secrets initialized');
    } catch (error) {
      results.checks.secretsInitialized = false;
      results.errors.push(`Secrets initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return NextResponse.json(results, { status: 500 });
    }

    // Step 2: Check environment variables
    console.log('[Okta Config Test] Step 2: Checking environment variables...');
    const envVars = {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID,
      OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET,
      OKTA_ISSUER: process.env.OKTA_ISSUER,
    };

    results.checks.environmentVariables = {
      NEXTAUTH_SECRET: {
        exists: !!envVars.NEXTAUTH_SECRET,
        length: envVars.NEXTAUTH_SECRET?.length || 0,
        preview: envVars.NEXTAUTH_SECRET ? `${envVars.NEXTAUTH_SECRET.substring(0, 8)}...` : 'MISSING',
      },
      NEXTAUTH_URL: {
        exists: !!envVars.NEXTAUTH_URL,
        value: envVars.NEXTAUTH_URL || 'MISSING',
      },
      OKTA_CLIENT_ID: {
        exists: !!envVars.OKTA_CLIENT_ID,
        length: envVars.OKTA_CLIENT_ID?.length || 0,
        preview: envVars.OKTA_CLIENT_ID ? `${envVars.OKTA_CLIENT_ID.substring(0, 8)}...` : 'MISSING',
      },
      OKTA_CLIENT_SECRET: {
        exists: !!envVars.OKTA_CLIENT_SECRET,
        length: envVars.OKTA_CLIENT_SECRET?.length || 0,
        preview: envVars.OKTA_CLIENT_SECRET ? '***SET***' : 'MISSING',
      },
      OKTA_ISSUER: {
        exists: !!envVars.OKTA_ISSUER,
        value: envVars.OKTA_ISSUER || 'MISSING',
      },
    };

    // Check for missing variables
    const missing = Object.entries(envVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      results.errors.push(`Missing environment variables: ${missing.join(', ')}`);
      results.recommendations.push('Ensure all required environment variables are set in AWS Secrets Manager');
    }

    // Step 3: Test Okta Provider construction
    console.log('[Okta Config Test] Step 3: Testing Okta provider construction...');
    let providerConstructed = false;
    let providerError: string | null = null;
    try {
      if (envVars.OKTA_CLIENT_ID && envVars.OKTA_CLIENT_SECRET && envVars.OKTA_ISSUER) {
        OktaProvider({
          clientId: envVars.OKTA_CLIENT_ID,
          clientSecret: envVars.OKTA_CLIENT_SECRET,
          issuer: envVars.OKTA_ISSUER,
        });
        providerConstructed = true;
        results.checks.providerConstruction = { success: true };
        console.log('[Okta Config Test] ✅ Provider constructed successfully');
      } else {
        providerError = 'Cannot construct provider - missing required environment variables';
        results.checks.providerConstruction = { success: false, error: providerError };
      }
    } catch (error) {
      providerError = error instanceof Error ? error.message : 'Unknown error';
      results.checks.providerConstruction = { success: false, error: providerError };
      results.errors.push(`Provider construction failed: ${providerError}`);
      console.log('[Okta Config Test] ❌ Provider construction failed:', providerError);
    }

    // Step 4: Test Okta discovery endpoint
    console.log('[Okta Config Test] Step 4: Testing Okta discovery endpoint...');
    let discoveryStatus = 'Not tested';
    let discoveryData: Record<string, unknown> | null = null;
    let discoveryError: string | null = null;

    if (envVars.OKTA_ISSUER) {
      try {
        const wellKnownUrl = `${envVars.OKTA_ISSUER}/.well-known/openid-configuration`;
        console.log('[Okta Config Test] Fetching:', wellKnownUrl);
        
        const discoveryResponse = await fetch(wellKnownUrl, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        discoveryStatus = `HTTP ${discoveryResponse.status}`;
        
        if (discoveryResponse.ok) {
          const discoveryJson = await discoveryResponse.json();
          discoveryData = {
            issuer: discoveryJson.issuer,
            authorization_endpoint: discoveryJson.authorization_endpoint,
            token_endpoint: discoveryJson.token_endpoint,
            userinfo_endpoint: discoveryJson.userinfo_endpoint,
            jwks_uri: discoveryJson.jwks_uri,
          };
          results.checks.discoveryEndpoint = { success: true, status: discoveryStatus, data: discoveryData };
          console.log('[Okta Config Test] ✅ Discovery endpoint accessible');
        } else {
          const errorText = await discoveryResponse.text();
          discoveryError = `HTTP ${discoveryResponse.status}: ${errorText.substring(0, 200)}`;
          results.checks.discoveryEndpoint = { success: false, status: discoveryStatus, error: discoveryError };
          results.errors.push(`Discovery endpoint failed: ${discoveryError}`);
        }
      } catch (error) {
        discoveryError = error instanceof Error ? error.message : 'Unknown error';
        results.checks.discoveryEndpoint = { success: false, error: discoveryError };
        results.errors.push(`Discovery endpoint error: ${discoveryError}`);
        console.log('[Okta Config Test] ❌ Discovery endpoint error:', discoveryError);
      }
    } else {
      results.checks.discoveryEndpoint = { success: false, error: 'OKTA_ISSUER not set' };
    }

    // Step 5: Calculate expected callback URL
    console.log('[Okta Config Test] Step 5: Calculating callback URL...');
    if (envVars.NEXTAUTH_URL) {
      const callbackUrl = `${envVars.NEXTAUTH_URL}/api/auth/callback/okta`;
      results.checks.callbackUrl = {
        expected: callbackUrl,
        note: 'This URL must be configured in your Okta application settings',
      };
      results.recommendations.push(`Ensure this redirect URI is configured in Okta: ${callbackUrl}`);
    }

    // Step 6: Test getAuthOptions function
    console.log('[Okta Config Test] Step 6: Testing getAuthOptions function...');
    let authOptionsTest = { success: false, error: null as string | null };
    try {
      const { getAuthOptions } = await import('@/lib/auth-config');
      const authOptions = await getAuthOptions();
      authOptionsTest.success = true;
      authOptionsTest.error = null;
      results.checks.getAuthOptions = authOptionsTest;
      console.log('[Okta Config Test] ✅ getAuthOptions works');
    } catch (error) {
      authOptionsTest.error = error instanceof Error ? error.message : 'Unknown error';
      authOptionsTest.success = false;
      results.checks.getAuthOptions = authOptionsTest;
      results.errors.push(`getAuthOptions failed: ${authOptionsTest.error}`);
      console.log('[Okta Config Test] ❌ getAuthOptions failed:', authOptionsTest.error);
    }

    // Summary
    const allChecksPassed = 
      results.checks.secretsInitialized &&
      !missing.length &&
      providerConstructed &&
      results.checks.discoveryEndpoint?.success &&
      authOptionsTest.success;

    results.summary = {
      allChecksPassed,
      totalChecks: 6,
      passedChecks: Object.values(results.checks).filter((check: any) => check?.success !== false).length,
      totalErrors: results.errors.length,
    };

    if (!allChecksPassed) {
      results.recommendations.push('Review the errors above and ensure Okta application is configured correctly');
      results.recommendations.push('Check AWS Secrets Manager to ensure all secrets are stored correctly');
      results.recommendations.push('Verify the redirect URI in Okta matches the callbackUrl shown above');
    }

    return NextResponse.json(results, { 
      status: allChecksPassed ? 200 : 500 
    });

  } catch (error) {
    results.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return NextResponse.json(results, { status: 500 });
  }
}

