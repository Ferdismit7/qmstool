import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const controls = await query(
      'SELECT * FROM performancemonitoringcontrol WHERE id = ?',
      [params.id]
    );
    
    if (controls.length === 0) {
      return NextResponse.json(
        { error: 'Performance monitoring control not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(controls[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance monitoring control' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      UPDATE performancemonitoringcontrol
      SET
        business_area = ?,
        sub_business_area = ?,
        Name_reports = ?,
        type = ?,
        priority = ?,
        status = ?,
        progress = ?,
        status_percentage = ?,
        target_date = ?,
        proof = ?,
        frequency = ?,
        responsible_persons = ?,
        remarks = ?
      WHERE id = ?
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
      remarks,
      params.id
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Performance monitoring control not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Performance monitoring control updated successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to update performance monitoring control' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query(
      'DELETE FROM performancemonitoringcontrol WHERE id = ?',
      [params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Performance monitoring control not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Performance monitoring control deleted successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete performance monitoring control' },
      { status: 500 }
    );
  }
} 