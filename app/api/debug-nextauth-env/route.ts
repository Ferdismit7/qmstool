import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function GET() {
  try {
    // Initialize secrets first
    try {
      await initializeSecrets();
    } catch (secretsError) {
      console.error('Failed to initialize secrets:', secretsError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to initialize secrets',
          details: secretsError instanceof Error ? secretsError.message : String(secretsError),
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
    const envVars = {
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID ? 'SET' : 'NOT SET',
      OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET ? 'SET' : 'NOT SET',
      OKTA_ISSUER: process.env.OKTA_ISSUER ? 'SET' : 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'NOT SET',
    };

    const actualValues = {
      OKTA_ISSUER: process.env.OKTA_ISSUER || 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
    };

    return NextResponse.json({
      success: true,
      message: 'NextAuth environment variables debug',
      environmentVariables: envVars,
      actualValues: actualValues,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Debug NextAuth env error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

