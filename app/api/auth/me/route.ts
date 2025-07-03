import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return user information (excluding sensitive data like password)
    return NextResponse.json({
      userId: user.userId,
      email: user.email,
      username: user.username,
      businessArea: user.businessArea
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 