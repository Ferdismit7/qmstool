import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function GET() {
  try {
    // Initialize secrets first
    await initializeSecrets();
    
    const credentials = {
      ACCESS_KEY_ID: {
        exists: !!process.env.ACCESS_KEY_ID,
        length: process.env.ACCESS_KEY_ID?.length || 0,
        preview: process.env.ACCESS_KEY_ID ? `${process.env.ACCESS_KEY_ID.substring(0, 4)}...` : 'EMPTY'
      },
      SECRET_ACCESS_KEY: {
        exists: !!process.env.SECRET_ACCESS_KEY,
        length: process.env.SECRET_ACCESS_KEY?.length || 0,
        preview: process.env.SECRET_ACCESS_KEY ? `${process.env.SECRET_ACCESS_KEY.substring(0, 4)}...` : 'EMPTY'
      },
      REGION: {
        exists: !!process.env.REGION,
        value: process.env.REGION || 'NOT_SET'
      },
      S3_BUCKET_NAME: {
        exists: !!process.env.S3_BUCKET_NAME,
        value: process.env.S3_BUCKET_NAME || 'NOT_SET'
      }
    };
    
    const allEnvVars = Object.keys(process.env).filter(key => 
      key.includes('ACCESS') || 
      key.includes('SECRET') || 
      key.includes('REGION') || 
      key.includes('S3') ||
      key.includes('AWS')
    );
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      credentials,
      allRelevantEnvVars: allEnvVars,
      totalEnvVars: Object.keys(process.env).length
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
