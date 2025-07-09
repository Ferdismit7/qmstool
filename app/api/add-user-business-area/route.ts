import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

interface UserBusinessArea {
  business_area: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, businessAreas } = await request.json();

    if (!email || !businessAreas || !Array.isArray(businessAreas)) {
      return NextResponse.json({
        error: 'Email and businessAreas array are required'
      }, { status: 400 });
    }

    // Get user ID
    const [user] = await query<{ id: number }[]>(`
      SELECT id FROM users WHERE email = ?
    `, [email]);

    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 });
    }

    let addedCount = 0;
    const errors: string[] = [];

    // Add each business area for the user
    for (const businessArea of businessAreas) {
      try {
        await query(`
          INSERT IGNORE INTO user_business_areas (user_id, business_area)
          VALUES (?, ?)
        `, [user.id, businessArea]);
        
        addedCount++;
        console.log(`Added business area ${businessArea} for user ${email}`);
      } catch (error) {
        errors.push(`Failed to add ${businessArea}: ${error}`);
        console.error(`Error adding business area ${businessArea} for user ${email}:`, error);
      }
    }

    // Get updated list of user's business areas
    const userBusinessAreas = await query<UserBusinessArea[]>(`
      SELECT business_area 
      FROM user_business_areas 
      WHERE user_id = ?
      ORDER BY business_area ASC
    `, [user.id]);

    return NextResponse.json({
      message: 'Business areas added successfully',
      userEmail: email,
      addedCount: addedCount,
      totalUserBusinessAreas: userBusinessAreas.length,
      userBusinessAreas: userBusinessAreas.map((row: UserBusinessArea) => row.business_area),
      errors: errors
    });
  } catch (error) {
    console.error('Error adding user business areas:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 