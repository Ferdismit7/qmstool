import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    // Fetch business areas using MySQL query
    const businessAreas = await query(`
      SELECT business_area 
      FROM businessareas 
      ORDER BY business_area ASC
    `);

    return NextResponse.json({ success: true, data: businessAreas });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business areas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { business_area } = await request.json();

    if (!business_area || typeof business_area !== 'string' || business_area.trim() === '') {
      return NextResponse.json(
        { message: 'Business area is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const trimmedBusinessArea = business_area.trim();

    // Check if business area already exists
    const existingAreas = await query(`
      SELECT business_area 
      FROM businessareas 
      WHERE business_area = ?
    `, [trimmedBusinessArea]);

    if (existingAreas.length > 0) {
      return NextResponse.json(
        { message: 'Business area already exists' },
        { status: 400 }
      );
    }

    // Add new business area
    await query(`
      INSERT INTO businessareas (business_area) 
      VALUES (?)
    `, [trimmedBusinessArea]);

    return NextResponse.json(
      { message: 'Business area added successfully', business_area: trimmedBusinessArea },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to add business area' },
      { status: 500 }
    );
  }
} 