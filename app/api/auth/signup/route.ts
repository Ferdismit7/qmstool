import { NextRequest, NextResponse } from 'next/server';
import {prisma }from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { validateEnvironmentVariables, sanitizeInput, isValidEmail, validatePasswordStrength, checkRateLimit } from '@/lib/security';
import { initializeSecrets } from '@/lib/awsSecretsManager';

export async function POST(request: NextRequest) {
  try {
    // Initialize secrets from AWS Secrets Manager
    await initializeSecrets();
    
    // Validate environment variables
    validateEnvironmentVariables();
    
    const { username, email, password, businessAreas } = await request.json();
    
    // SECURITY: Sanitize and validate input
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedEmail = sanitizeInput(email);
    
    if (!isValidEmail(sanitizedEmail)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // SECURITY: Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { message: 'Password does not meet security requirements', errors: passwordValidation.errors },
        { status: 400 }
      );
    }
    
    // SECURITY: Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`signup:${clientIP}`, 3, 300000)) { // 3 attempts per 5 minutes
      return NextResponse.json(
        { message: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }
    
    console.log('Received signup request for:', { username: sanitizedUsername, email: sanitizedEmail, businessAreas });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');

    // Store only the first business area to avoid foreign key constraint issues
    // If no business areas are selected, use null
    const primaryBusinessArea = Array.isArray(businessAreas) && businessAreas.length > 0 
      ? businessAreas[0] 
      : null;

    // Create new user using Prisma
    const user = await prisma.user.create({
      data: {
        username: sanitizedUsername,
        email: sanitizedEmail,
        password: hashedPassword,
        business_area: primaryBusinessArea,
        created_at: new Date()
      }
    });

    console.log('User created successfully with ID:', user.id);

    // Store all business areas in a separate table
    if (Array.isArray(businessAreas) && businessAreas.length > 0) {
      // Create user_business_areas table if it doesn't exist
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS user_business_areas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          business_area VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (business_area) REFERENCES businessareas(business_area) ON DELETE CASCADE,
          UNIQUE KEY unique_user_business (user_id, business_area)
        )
      `;

      // Insert all business areas for this user
      for (const businessArea of businessAreas) {
        try {
          await prisma.$executeRaw`
            INSERT INTO user_business_areas (user_id, business_area)
            VALUES (${user.id}, ${businessArea})
          `;
        } catch (error) {
          console.error(`Failed to insert business area ${businessArea} for user ${user.id}:`, error);
          // Continue with other business areas even if one fails
        }
      }
    }

    console.log('User and business areas created successfully');
    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Detailed signup error:', error);
    return NextResponse.json(
      { message: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 