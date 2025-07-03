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
      SELECT id, email, business_area FROM users WHERE email = ?
    `, [user.email]);

    if (!userRecord) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user_business_areas table exists
    const [tableExists] = await query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'user_business_areas'
    `);

    let userBusinessAreas = [];
    let tableExistsBool = tableExists.count > 0;

    if (tableExistsBool) {
      // Get all business areas for this user
      userBusinessAreas = await query(`
        SELECT business_area 
        FROM user_business_areas 
        WHERE user_id = ?
        ORDER BY business_area ASC
      `, [userRecord.id]);
    }

    // Get all business areas from businessareas table
    const allBusinessAreas = await query(`
      SELECT business_area 
      FROM businessareas 
      ORDER BY business_area ASC
    `);

    return NextResponse.json({
      user: {
        id: userRecord.id,
        email: userRecord.email,
        primaryBusinessArea: userRecord.business_area
      },
      tableExists: tableExistsBool,
      userBusinessAreas: userBusinessAreas.map((row: any) => row.business_area),
      allBusinessAreas: allBusinessAreas.map((row: any) => row.business_area),
      userBusinessAreasCount: userBusinessAreas.length,
      allBusinessAreasCount: allBusinessAreas.length
    });
  } catch (error) {
    console.error('Error debugging user business areas:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 