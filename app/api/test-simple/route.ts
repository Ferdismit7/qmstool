import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Test simple route accessed');
    console.log('Environment variables check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Simple API route working',
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0
      }
    });
  } catch (error) {
    console.error('Simple test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 