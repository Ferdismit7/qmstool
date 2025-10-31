import { NextResponse } from 'next/server';
import { initializeSecrets, getSecrets } from '@/lib/awsSecretsManager';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SecretsTestResult {
  timestamp: string;
  tests: {
    lambdaUrlConfigured?: {
      hasLambdaUrl: boolean;
      hasNextPublicLambdaUrl: boolean;
      finalUrl: string;
    };
    secretsLoaded?: {
      success: boolean;
      secretsFound?: Record<string, boolean>;
      preview?: Record<string, string>;
      error?: string;
    };
    environmentVariablesAfterInit?: {
      NEXTAUTH_SECRET?: { exists: boolean; length: number };
      NEXTAUTH_URL?: { exists: boolean; value: string };
      OKTA_CLIENT_ID?: { exists: boolean; length: number };
      OKTA_CLIENT_SECRET?: { exists: boolean; length: number };
      OKTA_ISSUER?: { exists: boolean; value: string };
      error?: string;
    };
  };
  errors: string[];
}

export async function GET() {
  const results: SecretsTestResult = {
    timestamp: new Date().toISOString(),
    tests: {},
    errors: [],
  };

  try {
    // Test 1: Check if Lambda URL is configured
    const lambdaUrl = process.env.LAMBDA_FUNCTION_URL || process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL;
    results.tests.lambdaUrlConfigured = {
      hasLambdaUrl: !!process.env.LAMBDA_FUNCTION_URL,
      hasNextPublicLambdaUrl: !!process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL,
      finalUrl: lambdaUrl ? 'SET' : 'NOT SET',
    };

    // Test 2: Try to load secrets
    try {
      console.log('[Secrets Test] Attempting to load secrets...');
      const secrets = await getSecrets();
      
      results.tests.secretsLoaded = {
        success: true,
        secretsFound: {
          DATABASE_URL: !!secrets.DATABASE_URL,
          JWT_SECRET: !!secrets.JWT_SECRET,
          NEXTAUTH_SECRET: !!secrets.NEXTAUTH_SECRET,
          NEXTAUTH_URL: !!secrets.NEXTAUTH_URL,
          OKTA_CLIENT_ID: !!secrets.OKTA_CLIENT_ID,
          OKTA_CLIENT_SECRET: !!secrets.OKTA_CLIENT_SECRET,
          OKTA_ISSUER: !!secrets.OKTA_ISSUER,
          S3_BUCKET_NAME: !!secrets.S3_BUCKET_NAME,
          REGION: !!secrets.REGION,
          ACCESS_KEY_ID: !!secrets.ACCESS_KEY_ID,
          SECRET_ACCESS_KEY: !!secrets.SECRET_ACCESS_KEY,
        },
        preview: {
          NEXTAUTH_URL: secrets.NEXTAUTH_URL || 'MISSING',
          OKTA_ISSUER: secrets.OKTA_ISSUER || 'MISSING',
          OKTA_CLIENT_ID: secrets.OKTA_CLIENT_ID ? `${secrets.OKTA_CLIENT_ID.substring(0, 8)}...` : 'MISSING',
          OKTA_CLIENT_SECRET: secrets.OKTA_CLIENT_SECRET ? '***SET***' : 'MISSING',
          NEXTAUTH_SECRET: secrets.NEXTAUTH_SECRET ? '***SET***' : 'MISSING',
        },
      };
    } catch (error) {
      results.tests.secretsLoaded = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      results.errors.push(`Failed to load secrets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test 3: Check environment variables after initialization
    try {
      await initializeSecrets();
      
      results.tests.environmentVariablesAfterInit = {
        NEXTAUTH_SECRET: {
          exists: !!process.env.NEXTAUTH_SECRET,
          length: process.env.NEXTAUTH_SECRET?.length || 0,
        },
        NEXTAUTH_URL: {
          exists: !!process.env.NEXTAUTH_URL,
          value: process.env.NEXTAUTH_URL || 'MISSING',
        },
        OKTA_CLIENT_ID: {
          exists: !!process.env.OKTA_CLIENT_ID,
          length: process.env.OKTA_CLIENT_ID?.length || 0,
        },
        OKTA_CLIENT_SECRET: {
          exists: !!process.env.OKTA_CLIENT_SECRET,
          length: process.env.OKTA_CLIENT_SECRET?.length || 0,
        },
        OKTA_ISSUER: {
          exists: !!process.env.OKTA_ISSUER,
          value: process.env.OKTA_ISSUER || 'MISSING',
        },
      };

      // Check if all critical vars are present
      const criticalVars = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL', 'OKTA_CLIENT_ID', 'OKTA_CLIENT_SECRET', 'OKTA_ISSUER'];
      const missingCritical = criticalVars.filter(v => !process.env[v]);
      
      if (missingCritical.length > 0) {
        results.errors.push(`Missing critical environment variables after initialization: ${missingCritical.join(', ')}`);
      }
    } catch (error) {
      results.tests.environmentVariablesAfterInit = {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      results.errors.push(`Failed to initialize secrets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return NextResponse.json(results, { 
      status: results.errors.length === 0 ? 200 : 500 
    });
  } catch (error) {
    results.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return NextResponse.json(results, { status: 500 });
  }
}

