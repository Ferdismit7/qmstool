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