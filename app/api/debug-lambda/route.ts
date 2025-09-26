import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Debug Lambda endpoint called');
    
    // Check if Lambda URL is set
    const lambdaUrl = process.env.LAMBDA_FUNCTION_URL;
    console.log('Lambda URL set:', !!lambdaUrl);
    console.log('Lambda URL value:', lambdaUrl ? 'SET' : 'NOT SET');
    
    // Check other environment variables
    console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);
    console.log('DATABASE_URL set:', !!process.env.DATABASE_URL);
    
    return NextResponse.json({
      success: true,
      lambdaUrlSet: !!lambdaUrl,
      lambdaUrlValue: lambdaUrl ? 'SET' : 'NOT SET',
      jwtSecretSet: !!process.env.JWT_SECRET,
      databaseUrlSet: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug Lambda error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
