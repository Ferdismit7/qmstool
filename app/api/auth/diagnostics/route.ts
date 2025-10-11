import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 [Diagnostics] Starting authentication diagnostics...');

    // Step 1: Initialize secrets
    console.log('🔍 [Diagnostics] Step 1: Initializing secrets...');
    await initializeSecrets();
    console.log('✅ [Diagnostics] Secrets initialized');

    // Step 2: Check environment variables
    const envVars = {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID,
      OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET,
      OKTA_ISSUER: process.env.OKTA_ISSUER,
      DATABASE_URL: process.env.DATABASE_URL,
      LAMBDA_FUNCTION_URL: process.env.LAMBDA_FUNCTION_URL,
      NODE_ENV: process.env.NODE_ENV,
    };

    const status: Record<string, { exists: boolean; length?: number; preview?: string }> = {};
    
    Object.entries(envVars).forEach(([key, value]) => {
      if (value) {
        status[key] = {
          exists: true,
          length: value.length,
          preview: value.length > 20 ? `${value.substring(0, 15)}...` : value,
        };
      } else {
        status[key] = { exists: false };
      }
    });

    console.log('🔍 [Diagnostics] Environment variables:', status);

    // Step 3: Check for missing critical variables
    const missingVars = Object.entries(envVars)
      .filter(([key, value]) => !value && key !== 'DATABASE_URL') // DATABASE_URL is optional for NextAuth
      .map(([key]) => key);

    // Step 4: Test Lambda connectivity
    let lambdaStatus = 'Not tested';
    if (process.env.LAMBDA_FUNCTION_URL) {
      try {
        console.log('🔍 [Diagnostics] Testing Lambda connectivity...');
        const lambdaResponse = await fetch(process.env.LAMBDA_FUNCTION_URL, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        lambdaStatus = lambdaResponse.ok ? '✅ Connected' : `❌ Error: ${lambdaResponse.status}`;
        console.log('🔍 [Diagnostics] Lambda status:', lambdaStatus);
      } catch (error) {
        lambdaStatus = `❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`;
        console.error('🔍 [Diagnostics] Lambda error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      diagnostics: {
        secretsInitialized: true,
        environmentVariables: status,
        missingVariables: missingVars,
        lambdaConnection: lambdaStatus,
      },
      recommendations: missingVars.length > 0 
        ? [
            `Add missing environment variables to AWS Amplify: ${missingVars.join(', ')}`,
            'Ensure AWS Secrets Manager contains all required secrets',
            'Verify Lambda function URL is accessible from Amplify',
          ]
        : ['✅ All required environment variables are present'],
    });
  } catch (error) {
    console.error('❌ [Diagnostics] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

