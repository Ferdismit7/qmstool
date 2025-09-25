import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {prisma }from '@/lib/prisma';
import { validateEnvironmentVariables, sanitizeInput, isValidEmail, checkRateLimit } from '@/lib/security';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function POST(request: Request) {
  try {
    // Try to initialize secrets from AWS Secrets Manager (optional for login)
    try {
      await initializeSecrets();
    } catch (secretsError) {
      console.warn('Could not initialize secrets, using fallback environment variables:', secretsError);
    }
    
    // Validate environment variables at startup (optional if secrets failed)
    try {
      validateEnvironmentVariables();
    } catch (envError) {
      console.warn('Environment validation failed, proceeding with available variables:', envError);
    }
    
    // SECURITY FIX: Removed environment variable logging
    // console.log('All env:', process.env); // REMOVED - NEVER log all env vars
    console.log('Login attempt started');
    const { email, password } = await request.json();
    
    // SECURITY: Sanitize and validate input
    const sanitizedEmail = sanitizeInput(email);
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // SECURITY: Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`login:${clientIP}`, 5, 60000)) {
      return NextResponse.json(
        { message: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    console.log('Login attempt for email:', sanitizedEmail);

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
        where: { email: sanitizedEmail },
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

    // Create response with token in body
    const response = NextResponse.json({ 
      token,
      user: {
        userId: user.id,
        email: user.email,
        username: user.username,
        businessArea: user.business_area
      }
    });

    // Set secure HttpOnly cookie for server-side access
    response.cookies.set('authToken', token, {
      httpOnly: true, // Secure for server-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days (matching JWT expiration)
      path: '/'
    });

    // SECURITY FIX: Remove client-side accessible token
    // Both cookies should be HttpOnly for security
    // Client-side authentication should use the response body token
    response.cookies.set('clientAuthToken', token, {
      httpOnly: true, // SECURITY FIX: Made HttpOnly
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days (matching JWT expiration)
      path: '/'
    });

    console.log('Login successful for user:', user.email);
    return response;
  } catch (error) {
    console.error('Login error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { message: 'Login failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 