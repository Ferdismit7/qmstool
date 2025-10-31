import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { initializeSecrets } from '@/lib/awsSecretsManager';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth-config';

/**
 * Generate JWT token for Okta-authenticated users
 * This endpoint is called after Okta login to create a client-side token
 * that API routes can use for authentication
 */
export async function POST() {
  try {
    console.log('Generate token request started');
    
    // Initialize secrets and get auth options
    await initializeSecrets();
    const authOptions = await getAuthOptions();
    
    // Get NextAuth session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }
    
    const userEmail = session.user.email;
    const userName = session.user.name || session.user.email.split('@')[0];
    
    console.log('Session found for user:', userEmail);
    
    // Get or create user in database
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { 
        id: true, 
        email: true, 
        username: true, 
        business_area: true 
      }
    });
    
    // If user doesn't exist, create them
    if (!user) {
      console.log('User not found, creating new user');
      user = await prisma.user.create({
        data: {
          email: userEmail,
          username: userName.substring(0, 20), // Username has max length
        },
        select: { 
          id: true, 
          email: true, 
          username: true, 
          business_area: true 
        }
      });
      console.log('User created:', user);
    }
    
    // Get business areas for the user
    let businessAreas: string[] = [];
    try {
      const userBusinessAreas = await prisma.$queryRaw`
        SELECT business_area 
        FROM user_business_areas 
        WHERE user_id = ${user.id}
        ORDER BY business_area ASC
      ` as Array<{ business_area: string }>;
      
      businessAreas = userBusinessAreas.map(row => row.business_area);
    } catch (error) {
      console.log('Error fetching business areas:', error);
    }
    
    // If no business areas mapped, use primary business area or all areas
    if (businessAreas.length === 0) {
      if (user.business_area) {
        businessAreas = [user.business_area];
      } else {
        const allAreas = await prisma.businessAreas.findMany({ 
          select: { business_area: true } 
        });
        businessAreas = allAreas.map(a => a.business_area);
      }
    }
    
    // Use first business area as primary (for backward compatibility)
    const primaryBusinessArea = businessAreas[0] || '';
    
    // Generate JWT token with user data
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }
    
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        username: user.username,
        businessArea: primaryBusinessArea
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    console.log('Token generated successfully for user:', user.email);
    
    // Return token in response body
    return NextResponse.json({ 
      token,
      user: {
        userId: user.id,
        email: user.email,
        username: user.username,
        businessArea: primaryBusinessArea,
        businessAreas
      }
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

