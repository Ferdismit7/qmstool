import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const lambdaUrl = process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL;
    
    if (!lambdaUrl) {
      return NextResponse.json({
        success: false,
        error: 'LAMBDA_FUNCTION_URL not set'
      }, { status: 500 });
    }
    
    console.log('Testing getSecrets Lambda function...');
    console.log('Lambda URL:', lambdaUrl);
    
    const response = await fetch(lambdaUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Lambda response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Lambda function returned status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Lambda response data:', data);
    
    // Check what secrets are actually returned
    const returnedSecrets = data.secrets || {};
    const secretKeys = Object.keys(returnedSecrets);
    
    return NextResponse.json({
      success: true,
      lambdaUrl: lambdaUrl,
      responseStatus: response.status,
      hasSecrets: !!data.secrets,
      secretKeys: secretKeys,
      hasAccessKey: !!returnedSecrets.ACCESS_KEY_ID,
      hasSecretKey: !!returnedSecrets.SECRET_ACCESS_KEY,
      accessKeyLength: returnedSecrets.ACCESS_KEY_ID?.length || 0,
      secretKeyLength: returnedSecrets.SECRET_ACCESS_KEY?.length || 0,
      accessKeyPreview: returnedSecrets.ACCESS_KEY_ID ? `${returnedSecrets.ACCESS_KEY_ID.substring(0, 4)}...` : 'NOT_FOUND',
      fullResponse: data
    });
    
  } catch (error) {
    console.error('Error testing getSecrets Lambda:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
