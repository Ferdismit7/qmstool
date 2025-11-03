import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import { getAuthOptions } from '@/lib/auth-config';
import NextAuth from 'next-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Simulate what happens during an OAuth callback
 * This helps diagnose Configuration errors that occur after Okta login
 */
export async function GET() {
  const results: {
    timestamp: string;
    tests: Record<string, unknown>;
    errors: string[];
  } = {
    timestamp: new Date().toISOString(),
    tests: {},
    errors: [],
  };

  try {
    // Test 1: Initialize secrets
    console.log('[Callback Simulation] Step 1: Initializing secrets...');
    try {
      await initializeSecrets();
      results.tests.secretsInitialized = true;
      console.log('[Callback Simulation] ✅ Secrets initialized');
    } catch (error) {
      results.tests.secretsInitialized = false;
      results.errors.push(`Secrets initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return NextResponse.json(results, { status: 500 });
    }

    // Test 2: Get auth options
    console.log('[Callback Simulation] Step 2: Getting auth options...');
    let authOptions;
    try {
      authOptions = await getAuthOptions();
      results.tests.authOptionsRetrieved = true;
      console.log('[Callback Simulation] ✅ Auth options retrieved');
    } catch (error) {
      results.tests.authOptionsRetrieved = false;
      results.errors.push(`getAuthOptions failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return NextResponse.json(results, { status: 500 });
    }

    // Test 3: Create NextAuth handler
    console.log('[Callback Simulation] Step 3: Creating NextAuth handler...');
    try {
      const handler = NextAuth(authOptions);
      results.tests.handlerCreated = true;
      console.log('[Callback Simulation] ✅ NextAuth handler created');
      
      // Verify the handler has required methods
      results.tests.handlerMethods = {
        hasGET: typeof handler === 'function' || typeof (handler as unknown as { GET?: unknown }).GET === 'function',
        hasPOST: typeof handler === 'function' || typeof (handler as unknown as { POST?: unknown }).POST === 'function',
      };
    } catch (error) {
      results.tests.handlerCreated = false;
      results.errors.push(`Handler creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('[Callback Simulation] ❌ Handler creation failed:', error);
    }

    // Test 4: Verify Okta provider configuration
    console.log('[Callback Simulation] Step 4: Verifying Okta provider...');
    if (authOptions.providers && authOptions.providers.length > 0) {
      const oktaProvider = authOptions.providers.find((p: { id?: string }) => p.id === 'okta');
      if (oktaProvider) {
        results.tests.oktaProviderFound = true;
        results.tests.oktaProviderConfig = {
          hasClientId: !!(oktaProvider as unknown as { clientId?: unknown }).clientId,
          hasClientSecret: !!(oktaProvider as unknown as { clientSecret?: unknown }).clientSecret,
          hasIssuer: !!(oktaProvider as unknown as { issuer?: unknown }).issuer,
        };
      } else {
        results.tests.oktaProviderFound = false;
        results.errors.push('Okta provider not found in providers array');
      }
    } else {
      results.errors.push('No providers configured');
    }

    // Test 5: Check NEXTAUTH_SECRET
    console.log('[Callback Simulation] Step 5: Verifying NEXTAUTH_SECRET...');
    results.tests.nextAuthSecret = {
      exists: !!process.env.NEXTAUTH_SECRET,
      length: process.env.NEXTAUTH_SECRET?.length || 0,
      isValid: !!(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length >= 32),
    };

    if (!results.tests.nextAuthSecret.exists || !results.tests.nextAuthSecret.isValid) {
      results.errors.push('NEXTAUTH_SECRET is missing or too short (must be at least 32 characters)');
    }

    // Summary
    const allTestsPassed = 
      results.tests.secretsInitialized &&
      results.tests.authOptionsRetrieved &&
      results.tests.handlerCreated &&
      results.tests.oktaProviderFound &&
      results.tests.nextAuthSecret?.exists &&
      results.tests.nextAuthSecret?.isValid;

    results.summary = {
      allTestsPassed,
      totalTests: 5,
      passedTests: Object.values(results.tests).filter(t => t === true).length,
      totalErrors: results.errors.length,
    };

    if (!allTestsPassed) {
      results.recommendations = [
        'Check AWS Secrets Manager to ensure all secrets are stored correctly',
        'Verify NEXTAUTH_SECRET is at least 32 characters long',
        'Ensure the callback URL is correctly configured in Okta',
        'Check server logs for more detailed error messages during actual callback',
      ];
    }

    return NextResponse.json(results, { 
      status: allTestsPassed ? 200 : 500 
    });

  } catch (error) {
    results.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return NextResponse.json(results, { status: 500 });
  }
}

