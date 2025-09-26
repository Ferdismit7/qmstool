import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Debug build-time endpoint called');
    
    // Check all environment variables
    const envVars = {
      LAMBDA_FUNCTION_URL: process.env.LAMBDA_FUNCTION_URL ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME ? 'SET' : 'NOT SET',
      REGION: process.env.REGION ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV ? 'SET' : 'NOT SET',
      AMPLIFY_ROLE_ARN: process.env.AMPLIFY_ROLE_ARN ? 'SET' : 'NOT SET'
    };
    
    console.log('Environment variables status:', envVars);
    
    return NextResponse.json({
      success: true,
      environmentVariables: envVars,
      timestamp: new Date().toISOString(),
      buildTime: process.env.NODE_ENV === 'production' ? 'Production Build' : 'Development Build'
    });
  } catch (error) {
    console.error('Debug build-time error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
