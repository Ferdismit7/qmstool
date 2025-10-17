import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const lambdaUrl = process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL;
    
    if (!lambdaUrl) {
      return NextResponse.json({
        success: false,
        error: 'NEXT_PUBLIC_LAMBDA_FUNCTION_URL not set'
      }, { status: 500 });
    }
    
    console.log('Testing Lambda function directly...');
    console.log('Lambda URL:', lambdaUrl);
    
    const response = await fetch(lambdaUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Lambda response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: `Lambda function returned status: ${response.status}`,
        errorText: errorText
      }, { status: 500 });
    }
    
    const data = await response.json();
    console.log('Lambda response data:', data);
    
    return NextResponse.json({
      success: true,
      lambdaUrl: lambdaUrl,
      responseStatus: response.status,
      hasSecrets: !!data.secrets,
      secretKeys: data.secrets ? Object.keys(data.secrets) : [],
      hasAccessKey: !!(data.secrets?.ACCESS_KEY_ID),
      hasSecretKey: !!(data.secrets?.SECRET_ACCESS_KEY),
      fullResponse: data
    });
    
  } catch (error) {
    console.error('Error testing Lambda function:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}