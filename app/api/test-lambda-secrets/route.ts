import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function GET() {
  try {
    console.log('Testing Lambda-based secrets endpoint called');
    
    // Test 1: Check if we can import the Lambda secrets manager
    console.log('✅ Lambda secrets manager imported successfully');
    
    // Test 2: Try to initialize secrets from Lambda
    console.log('Attempting to initialize secrets from Lambda function...');
    await initializeSecrets();
    console.log('✅ Secrets initialized successfully from Lambda');
    
    // Test 3: Check if environment variables are set
    const envStatus = {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      S3_BUCKET_NAME: process.env.S3_BUCKET_NAME ? 'SET' : 'NOT SET',
      REGION: process.env.REGION ? 'SET' : 'NOT SET',
      LAMBDA_FUNCTION_URL: process.env.LAMBDA_FUNCTION_URL ? 'SET' : 'NOT SET',
      NEXT_PUBLIC_LAMBDA_FUNCTION_URL: process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL ? 'SET' : 'NOT SET',
    };
    
    console.log('Environment variables status:', envStatus);
    
    return NextResponse.json({
      success: true,
      message: 'Lambda-based secrets manager working correctly',
      environmentVariables: envStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Lambda secrets test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
