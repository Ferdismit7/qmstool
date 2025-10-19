import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function GET() {
  try {
    console.log('Test upload file endpoint called');
    
    // Test secrets initialization
    console.log('Testing secrets initialization...');
    await initializeSecrets();
    console.log('Secrets initialized successfully');
    
    // Check Lambda function URL
    const lambdaUrl = process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL || process.env.LAMBDA_FUNCTION_URL;
    console.log('Lambda URL check:', {
      hasNextPublicUrl: !!process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL,
      hasLambdaUrl: !!process.env.LAMBDA_FUNCTION_URL,
      finalUrl: lambdaUrl ? 'SET' : 'NOT SET'
    });
    
    // Test Lambda function call
    if (lambdaUrl) {
      console.log('Testing Lambda function call...');
      const response = await fetch(lambdaUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Lambda response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Lambda response data:', data);
        
        return NextResponse.json({
          success: true,
          message: 'All tests passed',
          lambdaUrl: lambdaUrl,
          lambdaStatus: response.status,
          lambdaResponse: data
        });
      } else {
        const errorText = await response.text();
        console.error('Lambda function error:', errorText);
        
        return NextResponse.json({
          success: false,
          message: 'Lambda function test failed',
          lambdaUrl: lambdaUrl,
          lambdaStatus: response.status,
          lambdaError: errorText
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({
        success: false,
        message: 'Lambda function URL not configured',
        lambdaUrl: null
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Test upload file error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
