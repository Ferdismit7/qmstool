import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Test simple route accessed');
    console.log('Environment variables check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    // SECURITY FIX: Removed environment variable logging
    // console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET); // REMOVED
    // console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL); // REMOVED
    
    return NextResponse.json({ 
      success: true, 
      message: 'Simple API route working',
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        // SECURITY FIX: Removed environment variable exposure
        // hasJwtSecret: !!process.env.JWT_SECRET, // REMOVED
        // hasDatabaseUrl: !!process.env.DATABASE_URL, // REMOVED
        // jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0 // REMOVED
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