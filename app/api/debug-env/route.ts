import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function GET() {
  try {
    console.log('Debug Environment endpoint called');
    
    // Try to initialize secrets first
    await initializeSecrets();
    
    const envCheck = {
      // NextAuth variables
      NEXTAUTH_SECRET: {
        exists: !!process.env.NEXTAUTH_SECRET,
        length: process.env.NEXTAUTH_SECRET?.length || 0,
        preview: process.env.NEXTAUTH_SECRET ? `${process.env.NEXTAUTH_SECRET.substring(0, 8)}...` : 'NOT_SET'
      },
      NEXTAUTH_URL: {
        exists: !!process.env.NEXTAUTH_URL,
        value: process.env.NEXTAUTH_URL || 'NOT_SET'
      },
      
      // Okta variables
      OKTA_CLIENT_ID: {
        exists: !!process.env.OKTA_CLIENT_ID,
        length: process.env.OKTA_CLIENT_ID?.length || 0,
        preview: process.env.OKTA_CLIENT_ID ? `${process.env.OKTA_CLIENT_ID.substring(0, 8)}...` : 'NOT_SET'
      },
      OKTA_CLIENT_SECRET: {
        exists: !!process.env.OKTA_CLIENT_SECRET,
        length: process.env.OKTA_CLIENT_SECRET?.length || 0,
        preview: process.env.OKTA_CLIENT_SECRET ? `${process.env.OKTA_CLIENT_SECRET.substring(0, 8)}...` : 'NOT_SET'
      },
      OKTA_ISSUER: {
        exists: !!process.env.OKTA_ISSUER,
        value: process.env.OKTA_ISSUER || 'NOT_SET'
      },
      
      // AWS variables
      ACCESS_KEY_ID: {
        exists: !!process.env.ACCESS_KEY_ID,
        length: process.env.ACCESS_KEY_ID?.length || 0,
        preview: process.env.ACCESS_KEY_ID ? `${process.env.ACCESS_KEY_ID.substring(0, 8)}...` : 'NOT_SET'
      },
      SECRET_ACCESS_KEY: {
        exists: !!process.env.SECRET_ACCESS_KEY,
        length: process.env.SECRET_ACCESS_KEY?.length || 0,
        preview: process.env.SECRET_ACCESS_KEY ? `${process.env.SECRET_ACCESS_KEY.substring(0, 8)}...` : 'NOT_SET'
      },
      REGION: {
        exists: !!process.env.REGION,
        value: process.env.REGION || 'NOT_SET'
      },
      S3_BUCKET_NAME: {
        exists: !!process.env.S3_BUCKET_NAME,
        value: process.env.S3_BUCKET_NAME || 'NOT_SET'
      },
      
      // Lambda URL
      LAMBDA_FUNCTION_URL: {
        exists: !!process.env.LAMBDA_FUNCTION_URL,
        length: process.env.LAMBDA_FUNCTION_URL?.length || 0,
        preview: process.env.LAMBDA_FUNCTION_URL ? `${process.env.LAMBDA_FUNCTION_URL.substring(0, 20)}...` : 'NOT_SET'
      },
      NEXT_PUBLIC_LAMBDA_FUNCTION_URL: {
        exists: !!process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL,
        length: process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL?.length || 0,
        preview: process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL ? `${process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL.substring(0, 20)}...` : 'NOT_SET'
      }
    };
    
    const allEnvVars = Object.keys(process.env).filter(key => 
      key.includes('NEXTAUTH') || 
      key.includes('OKTA') || 
      key.includes('ACCESS') || 
      key.includes('SECRET') || 
      key.includes('REGION') || 
      key.includes('S3') ||
      key.includes('LAMBDA') ||
      key.includes('AWS')
    );
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environmentCheck: envCheck,
      allRelevantEnvVars: allEnvVars,
      totalEnvVars: Object.keys(process.env).length,
      nodeEnv: process.env.NODE_ENV
    });
    
  } catch (error) {
    console.error('Debug Environment error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
