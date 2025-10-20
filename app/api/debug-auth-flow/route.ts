import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function GET() {
  try {
    console.log('🔍 [Debug] Starting auth flow debug...');
    
    // Initialize secrets first
    await initializeSecrets();
    console.log('✅ [Debug] Secrets initialized');
    
    // Check environment variables
    const envCheck = {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      OKTA_CLIENT_ID: !!process.env.OKTA_CLIENT_ID,
      OKTA_CLIENT_SECRET: !!process.env.OKTA_CLIENT_SECRET,
      OKTA_ISSUER: !!process.env.OKTA_ISSUER,
    };
    
    console.log('🔍 [Debug] Environment check:', envCheck);
    
    // Test NextAuth configuration
    try {
      const { authOptions } = await import('@/lib/auth-config');
      console.log('✅ [Debug] Auth config imported successfully');
      
      // Check if we can create a NextAuth instance
      const NextAuth = (await import('next-auth')).default;
      const testAuth = NextAuth(authOptions);
      console.log('✅ [Debug] NextAuth instance created successfully');
      
      return NextResponse.json({
        success: true,
        message: 'Auth flow debug successful',
        envCheck,
        timestamp: new Date().toISOString()
      });
      
    } catch (authError) {
      console.error('❌ [Debug] Auth config error:', authError);
      return NextResponse.json({
        success: false,
        error: 'Auth configuration failed',
        details: authError instanceof Error ? authError.message : 'Unknown error',
        envCheck,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ [Debug] General error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
