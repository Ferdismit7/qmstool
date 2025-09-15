import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    
    const sessions = await query(`
      SELECT ts.*, ba.business_area 
      FROM trainingsessions ts
      LEFT JOIN businessareas ba ON ts.business_area = ba.business_area
      WHERE ts.business_area IN (${placeholders})
      ORDER BY ts.session_date DESC
    `, userBusinessAreas);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching training sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { business_area, sessions, session_date, remarks } = body;

    // Validate required fields
    if (!business_area || !sessions || !session_date) {
      return NextResponse.json(
        { error: 'Business area, sessions, and session date are required' },
        { status: 400 }
      );
    }

    // Check if user has access to the specified business area
    if (!userBusinessAreas.includes(business_area)) {
      return NextResponse.json(
        { error: 'Unauthorized to create training session for this business area' },
        { status: 403 }
      );
    }

    const result = await query(`
      INSERT INTO trainingsessions (business_area, sessions, session_date, remarks)
      VALUES (?, ?, ?, ?)
    `, [business_area, sessions, new Date(session_date), remarks || '']);

    // Get the inserted ID from the result
    const insertResult = result as unknown as { insertId: number };

    return NextResponse.json({ 
      id: insertResult.insertId,
      business_area,
      sessions,
      session_date,
      remarks
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating training session:', error);
    return NextResponse.json(
      { error: 'Failed to create training session' },
      { status: 500 }
    );
  }
} 