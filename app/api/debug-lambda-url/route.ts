import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Debug Lambda URL endpoint called');
    
    const lambdaUrl = process.env.LAMBDA_FUNCTION_URL || process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL;
    
    return NextResponse.json({
      success: true,
      message: 'Lambda URL debug information',
      lambdaUrl: lambdaUrl || 'NOT SET',
      environmentVariables: {
        LAMBDA_FUNCTION_URL: process.env.LAMBDA_FUNCTION_URL ? 'SET' : 'NOT SET',
        NEXT_PUBLIC_LAMBDA_FUNCTION_URL: process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL ? 'SET' : 'NOT SET',
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug Lambda URL error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
