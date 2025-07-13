import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing environment variables...');
    
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      DB_HOST: process.env.DB_HOST ? 'Set' : 'Not set',
      DB_USER: process.env.DB_USER ? 'Set' : 'Not set',
      DB_NAME: process.env.DB_NAME ? 'Set' : 'Not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set'
    };
    
    console.log('Environment variables:', envVars);
    
    return NextResponse.json({
      success: true,
      message: 'Environment variables check completed',
      environment: envVars
    });
  } catch (error) {
    console.error('Environment test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Environment test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 