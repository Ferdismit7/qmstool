import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { query } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user ID and primary business area from the users table
    const [userRecord] = await query(`
      SELECT id, business_area FROM users WHERE email = ?
    `, [user.email]);

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Try to fetch business areas from user_business_areas table
    let businessAreas: string[] = [];
    
    try {
      const userBusinessAreas = await query(`
        SELECT business_area 
        FROM user_business_areas 
        WHERE user_id = ?
        ORDER BY business_area ASC
      `, [userRecord.id]);

      businessAreas = userBusinessAreas.map((row: any) => row.business_area);
    } catch (error) {
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