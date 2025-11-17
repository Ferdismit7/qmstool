import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const lambdaUrl = process.env.LAMBDA_FUNCTION_URL || process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL;
  
  console.log('🔍 [Lambda Test] Testing Lambda connection...');
  console.log('🔍 [Lambda Test] Lambda URL:', lambdaUrl);
  
  if (!lambdaUrl) {
    return NextResponse.json({
      success: false,
      error: 'LAMBDA_FUNCTION_URL not set',
      envVars: {
        LAMBDA_FUNCTION_URL: !!process.env.LAMBDA_FUNCTION_URL,
        NEXT_PUBLIC_LAMBDA_FUNCTION_URL: !!process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL,
      }
    }, { status: 500 });
  }

  try {
    console.log('🔍 [Lambda Test] Calling Lambda...');
    const response = await fetch(lambdaUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('🔍 [Lambda Test] Response status:', response.status);
    console.log('🔍 [Lambda Test] Response headers:', Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log('🔍 [Lambda Test] Response body (raw):', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('🔍 [Lambda Test] JSON parse error:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Lambda returned non-JSON response',
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        status: response.status,
        body: text.substring(0, 500),
      }, { status: 500 });
    }

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Lambda returned error status',
        status: response.status,
        data: data,
      }, { status: 500 });
    }

    const requiredKeys = [
      'DATABASE_URL',
      'JWT_SECRET',
      'S3_BUCKET_NAME',
      'REGION',
      'ACCESS_KEY_ID',
      'SECRET_ACCESS_KEY',
    ];

    return NextResponse.json({
      success: true,
      lambdaStatus: response.status,
      hasSecrets: !!data.secrets,
      secretKeys: data.secrets ? Object.keys(data.secrets) : [],
      allSecretsPresent: data.secrets ? requiredKeys.every(key => data.secrets[key]) : false,
    });
  } catch (error) {
    console.error('🔍 [Lambda Test] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

