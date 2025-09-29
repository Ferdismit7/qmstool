import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function GET() {
  try {
    console.log('Debug DATABASE_URL endpoint called');
    
    // Initialize secrets first
    await initializeSecrets();
    console.log('✅ Secrets initialized successfully');
    
    // Get the DATABASE_URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL not available',
        timestamp: new Date().toISOString()
      });
    }
    
    // Parse the URL to show the components
    const urlMatch = databaseUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!urlMatch) {
      return NextResponse.json({
        success: false,
        error: 'Invalid DATABASE_URL format',
        databaseUrl: databaseUrl,
        timestamp: new Date().toISOString()
      });
    }
    
    const [, username, password, host, port, databaseName] = urlMatch;
    
    return NextResponse.json({
      success: true,
      message: 'DATABASE_URL parsed successfully',
      databaseUrl: databaseUrl,
      parsedComponents: {
        username: username,
        password: password.substring(0, 5) + '...' + password.substring(password.length - 5), // Masked password
        passwordLength: password.length,
        host: host,
        port: parseInt(port),
        databaseName: databaseName
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Debug DATABASE_URL error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
