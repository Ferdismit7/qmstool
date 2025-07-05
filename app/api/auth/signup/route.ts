import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, email, password, businessAreas } = await request.json();
    console.log('Received signup request for:', { username, email, businessAreas });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
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
        username,
        email,
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