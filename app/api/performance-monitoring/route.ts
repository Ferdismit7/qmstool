import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    const controls = await query(`
      SELECT * FROM performancemonitoringcontrol
      ORDER BY id DESC
    `);
    return NextResponse.json(controls);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance monitoring controls' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      business_area,
      sub_business_area,
      Name_reports,
      type,
      priority,
      status,
      progress,
      status_percentage,
      target_date,
      proof,
      frequency,
      responsible_persons,
      remarks
    } = body;

    const result = await query(`
      INSERT INTO performancemonitoringcontrol (
        business_area,
        sub_business_area,
        Name_reports,
        type,
        priority,
        status,
        progress,
        status_percentage,
        target_date,
        proof,
        frequency,
        responsible_persons,
        remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      business_area,
      sub_business_area,
      Name_reports,
      type,
      priority,
      status,
      progress,
      status_percentage,
      target_date,
      proof,
      frequency,
      responsible_persons,
      remarks
    ]);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to create performance monitoring control' },
      { status: 500 }
    );
  }
} 