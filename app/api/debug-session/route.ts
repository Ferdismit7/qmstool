import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookies = request.cookies.getAll();
    const headers = Object.fromEntries(request.headers.entries());
    
    // Check for various possible NextAuth cookie names
    const possibleSessionCookies = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'authjs.session-token',
      '__Secure-authjs.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token'
    ];
    
    const foundCookies = cookies.map(cookie => ({
      name: cookie.name,
      hasValue: !!cookie.value,
      valueLength: cookie.value?.length || 0,
      isNextAuth: possibleSessionCookies.includes(cookie.name)
    }));
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cookies: foundCookies,
      totalCookies: cookies.length,
      nextAuthCookies: foundCookies.filter(c => c.isNextAuth),
      headers: {
        userAgent: headers['user-agent'],
        referer: headers.referer,
        origin: headers.origin
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
