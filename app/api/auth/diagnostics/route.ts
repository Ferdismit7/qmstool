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
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
      SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
      REGION: process.env.REGION,
      LAMBDA_FUNCTION_URL: process.env.LAMBDA_FUNCTION_URL,
      NEXT_PUBLIC_LAMBDA_FUNCTION_URL: process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL,
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
      .filter(([key, value]) => !value && key !== 'NEXT_PUBLIC_LAMBDA_FUNCTION_URL')
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

