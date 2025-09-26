import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function GET() {
  try {
    console.log('Testing Lambda function integration...');
    console.log('LAMBDA_FUNCTION_URL:', process.env.LAMBDA_FUNCTION_URL ? 'SET' : 'NOT SET');
    
    // Test the secrets initialization
    await initializeSecrets();
    
    return NextResponse.json({
      success: true,
      message: 'Lambda function integration working',
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      lambdaUrlSet: !!process.env.LAMBDA_FUNCTION_URL
    });
  } catch (error) {
    console.error('Lambda test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      lambdaUrlSet: !!process.env.LAMBDA_FUNCTION_URL
    }, { status: 500 });
  }
}
