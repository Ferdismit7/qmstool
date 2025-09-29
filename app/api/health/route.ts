import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function GET() {
  try {
    // Initialize secrets from AWS Secrets Manager
    await initializeSecrets();
    
    // Test database connection
    await query('SELECT 1');
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
} 