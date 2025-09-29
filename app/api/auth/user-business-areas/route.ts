import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import {prisma } from '@/lib/prisma';

interface UserBusinessArea {
  business_area: string;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID and primary business area from the users table
    const userRecord = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, business_area: true }
    });

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Try to fetch business areas from user_business_areas table
    let businessAreas: string[] = [];
    
    try {
      const userBusinessAreas = await prisma.$queryRaw`
        SELECT business_area 
        FROM user_business_areas 
        WHERE user_id = ${userRecord.id}
        ORDER BY business_area ASC
      ` as UserBusinessArea[];

      businessAreas = userBusinessAreas.map((row: UserBusinessArea) => row.business_area);
    } catch {
      console.log('user_business_areas table does not exist or is empty, using primary business area');
    }

    // If no business areas found in user_business_areas table, use primary business area
    if (businessAreas.length === 0 && userRecord.business_area) {
      businessAreas = [userRecord.business_area];
    }

    return NextResponse.json({
      businessAreas: businessAreas
    });
  } catch (error) {
    console.error('Error fetching user business areas:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 