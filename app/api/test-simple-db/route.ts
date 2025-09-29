import { NextResponse } from 'next/server';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('Simple database test endpoint called');
    
    // Initialize secrets first
    await initializeSecrets();
    console.log('✅ Secrets initialized successfully');
    
    // Test a simple database query
    console.log('Testing simple database query...');
    const result = await query('SELECT 1 as test_value');
    console.log('✅ Database query successful:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Simple database test successful',
      result: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Simple database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
