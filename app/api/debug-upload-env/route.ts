import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check all environment variables related to S3 upload
    const envVars = {
      S3_UPLOAD_LAMBDA_URL: process.env.S3_UPLOAD_LAMBDA_URL ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_S3_UPLOAD_LAMBDA_URL: process.env.NEXT_PUBLIC_S3_UPLOAD_LAMBDA_URL ? 'SET' : 'NOT SET',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME ? 'SET' : 'NOT SET',
      REGION: process.env.REGION ? 'SET' : 'NOT SET',
      LAMBDA_FUNCTION_URL: process.env.LAMBDA_FUNCTION_URL ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_LAMBDA_FUNCTION_URL: process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL ? 'SET' : 'NOT SET',
    };

    // Get actual values (for debugging - remove in production)
    const actualValues = {
      S3_UPLOAD_LAMBDA_URL: process.env.S3_UPLOAD_LAMBDA_URL || 'undefined',
      NEXT_PUBLIC_S3_UPLOAD_LAMBDA_URL: process.env.NEXT_PUBLIC_S3_UPLOAD_LAMBDA_URL || 'undefined',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'undefined',
      REGION: process.env.REGION || 'undefined',
    };

    return NextResponse.json({
      success: true,
      message: 'Environment variables debug',
      environmentVariables: envVars,
      actualValues: actualValues,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug environment variables error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
