import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Logout request received');
    
    // Create response
    const response = NextResponse.json({ 
      message: 'Logged out successfully' 
    });

    // Clear all authentication cookies
    response.cookies.set('authToken', '', { 
      maxAge: 0, 
      path: '/',
      httpOnly: true 
    });
    
    response.cookies.set('clientAuthToken', '', { 
      maxAge: 0, 
      path: '/',
      httpOnly: false 
    });

    console.log('Logout successful, cookies cleared');
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    );
  }
}
