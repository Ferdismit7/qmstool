import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Get user from database
    const [user] = await query(`
      SELECT id, email, username, password, business_area 
      FROM users 
      WHERE email = ?
    `, [email]);

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token with business area
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        username: user.username,
        businessArea: user.business_area 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Set cookie
    const response = NextResponse.json({ token });
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 