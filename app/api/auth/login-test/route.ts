import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Test login attempt started');
    const { email } = await request.json();
    console.log('Test login attempt for email:', email);

    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not available');
      return NextResponse.json(
        { message: 'Server configuration error - JWT_SECRET missing' },
        { status: 500 }
      );
    }

    // For testing, just return a mock response
    console.log('Test login successful - returning mock response');
    return NextResponse.json({ 
      message: 'Test login route working',
      email: email,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    });
  } catch (error) {
    console.error('Test login error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { message: 'Test login error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 