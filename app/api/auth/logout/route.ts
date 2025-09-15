import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security';

export async function POST(request: Request) {
  try {
    // SECURITY: Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`logout:${clientIP}`, 10, 60000)) { // 10 requests per minute
      return NextResponse.json(
        { message: 'Too many logout attempts' },
        { status: 429 }
      );
    }
    
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
      httpOnly: true // SECURITY FIX: Made HttpOnly
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
