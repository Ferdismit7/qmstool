import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // TEMP DEBUG: Log all environment variables
    console.log('All env:', process.env);
    console.log('Login attempt started');
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);

    // Check if Prisma is available
    if (!prisma) {
      console.error('Prisma client not available');
      return NextResponse.json(
        { message: 'Database client not available - check environment variables' },
        { status: 500 }
      );
    }

    // Test database connection first
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { message: 'Database connection failed', error: dbError instanceof Error ? dbError.message : 'Unknown database error' },
        { status: 500 }
      );
    }

    // Get user from database using Prisma
    console.log('Attempting to find user...');
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          username: true,
          password: true,
          business_area: true
        }
      });
    } catch (userError) {
      console.error('User lookup failed:', userError);
      return NextResponse.json(
        { message: 'User lookup failed', error: userError instanceof Error ? userError.message : 'Unknown user lookup error' },
        { status: 500 }
      );
    }

    console.log('User lookup result:', user ? 'User found' : 'User not found');

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    console.log('Verifying password...');
    let isValid;
    try {
      isValid = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Password verification failed:', bcryptError);
      return NextResponse.json(
        { message: 'Password verification failed' },
        { status: 500 }
      );
    }
    console.log('Password verification result:', isValid);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not available');
      return NextResponse.json(
        { message: 'Server configuration error - JWT_SECRET missing' },
        { status: 500 }
      );
    }

    // Generate JWT token with business area - Extended to 30 days
    console.log('Generating JWT token...');
    let token;
    try {
      token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          username: user.username,
          businessArea: user.business_area 
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' } // Extended from '24h' to '30d'
      );
    } catch (jwtError) {
      console.error('JWT generation failed:', jwtError);
      return NextResponse.json(
        { message: 'Token generation failed' },
        { status: 500 }
      );
    }

    // Create response with proper CORS headers
    const response = NextResponse.json({ 
      token,
      user: {
        userId: user.id,
        email: user.email,
        username: user.username,
        businessArea: user.business_area
      }
    });

    // Set cookie with improved settings for production compatibility
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = isProduction ? process.env.COOKIE_DOMAIN : undefined;
    
    response.cookies.set('authToken', token, {
      httpOnly: false, // Allow client-side access for better UX
      secure: isProduction, // Only use secure in production
      sameSite: 'lax', // More permissive for better compatibility
      maxAge: 30 * 24 * 60 * 60, // 30 days (matching JWT expiration)
      path: '/',
      ...(domain && { domain }) // Only set domain if specified
    });

    // Add CORS headers for better compatibility
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    console.log('Login successful for user:', user.email);
    return response;
  } catch (error) {
    console.error('Login error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('Failed to disconnect Prisma:', disconnectError);
      }
    }
  }
} 