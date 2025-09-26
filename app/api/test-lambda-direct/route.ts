import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing Lambda function directly...');
    
    const lambdaUrl = process.env.LAMBDA_FUNCTION_URL;
    console.log('Lambda URL:', lambdaUrl);
    
    if (!lambdaUrl) {
      return NextResponse.json({
        success: false,
        error: 'LAMBDA_FUNCTION_URL not set',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    console.log('Calling Lambda function...');
    
    const response = await fetch(lambdaUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Lambda response status:', response.status);
    console.log('Lambda response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Lambda error response:', errorText);
      
      return NextResponse.json({
        success: false,
        error: `Lambda function returned status: ${response.status}`,
        errorResponse: errorText,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    const data = await response.json();
    console.log('Lambda response data:', data);
    
    return NextResponse.json({
      success: true,
      lambdaResponse: data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Lambda test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
