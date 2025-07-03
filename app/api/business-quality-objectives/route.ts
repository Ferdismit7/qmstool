import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    
    const objectives = await query(
      `SELECT * FROM businessqualityobjectives WHERE business_area IN (${placeholders}) ORDER BY id DESC`,
      userBusinessAreas
    );
    return NextResponse.json({ success: true, data: objectives });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business quality objectives' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, target, current_value, unit, target_date, status } = body;

    // Use the first business area for new records
    const userBusinessArea = userBusinessAreas[0];

    const result = await query(
      `INSERT INTO businessqualityobjectives 
      (name, description, target, current_value, unit, target_date, status, business_area)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, target, current_value, unit, target_date, status, userBusinessArea]
    );

    return NextResponse.json({
      success: true,
      data: { id: result.insertId },
      message: 'Business quality objective created successfully'
    });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create business quality objective' },
      { status: 500 }
    );
  }
}