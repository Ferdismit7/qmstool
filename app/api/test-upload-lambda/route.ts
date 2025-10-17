import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function POST() {
  try {
    console.log('Test upload Lambda endpoint called');
    
    // Initialize secrets
    await initializeSecrets();
    
    // Get Lambda function URL
    const lambdaUrl = process.env.NEXT_PUBLIC_LAMBDA_FUNCTION_URL || process.env.LAMBDA_FUNCTION_URL;
    
    if (!lambdaUrl) {
      return NextResponse.json({
        success: false,
        error: 'Lambda function URL not configured'
      }, { status: 500 });
    }
    
    // Test the Lambda function with a simple upload request
    const testData = {
      action: 'uploadFile',
      fileData: Buffer.from('test file content').toString('base64'),
      fileName: 'test.txt',
      contentType: 'text/plain',
      businessArea: 'General',
      documentType: 'business-documents',
      recordId: 123
    };
    
    console.log('Testing Lambda function with data:', {
      action: testData.action,
      fileName: testData.fileName,
      businessArea: testData.businessArea,
      documentType: testData.documentType,
      recordId: testData.recordId
    });
    
    const response = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Lambda response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lambda function error:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'Lambda function test failed',
        lambdaStatus: response.status,
        lambdaError: errorText
      }, { status: 500 });
    }
    
    const result = await response.json();
    console.log('Lambda response data:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Lambda upload test successful',
      lambdaResponse: result
    });
    
  } catch (error) {
    console.error('Test upload Lambda error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
