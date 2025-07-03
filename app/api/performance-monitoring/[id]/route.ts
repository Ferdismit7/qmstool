import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/app/lib/db';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

// GET a single performance monitoring control
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [...userBusinessAreas, parseInt(params.id)];

    const [control] = await query(`
      SELECT * FROM performancemonitoringcontrol 
      WHERE business_area IN (${placeholders}) AND id = ?
    `, queryParams);

    if (!control) {
      return NextResponse.json({ error: 'Performance monitoring control not found' }, { status: 404 });
    }

    return NextResponse.json(control);
  } catch (error) {
    console.error('Error fetching performance monitoring control:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance monitoring control' },
      { status: 500 }
    );
  }
}

// PUT (update) a performance monitoring control
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      sub_business_area,
      Name_reports,
      doc_type,
      priority,
      doc_status,
      progress,
      status_percentage,
      target_date,
      proof,
      frequency,
      responsible_persons,
      remarks
    } = data;

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [...userBusinessAreas, parseInt(params.id)];

    // Check if control exists and user has access
    const [existingControl] = await query(`
      SELECT business_area FROM performancemonitoringcontrol 
      WHERE business_area IN (${placeholders}) AND id = ?
    `, queryParams);

    if (!existingControl) {
      return NextResponse.json({ error: 'Performance monitoring control not found' }, { status: 404 });
    }

    // Use the first business area for updates
    const userBusinessArea = userBusinessAreas[0];

    const result = await query(`
      UPDATE performancemonitoringcontrol SET
        business_area = ?,
        sub_business_area = ?,
        Name_reports = ?,
        doc_type = ?,
        priority = ?,
        doc_status = ?,
        progress = ?,
        status_percentage = ?,
        target_date = ?,
        proof = ?,
        frequency = ?,
        responsible_persons = ?,
        remarks = ?
      WHERE id = ? AND business_area IN (${placeholders})
    `, [
      userBusinessArea, sub_business_area, Name_reports, doc_type, priority,
      doc_status, progress, status_percentage, target_date ? new Date(target_date) : null,
      proof, frequency, responsible_persons, remarks, parseInt(params.id), ...userBusinessAreas
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Performance monitoring control not found' }, { status: 404 });
    }

    // Fetch the updated record
    const [updatedControl] = await query(`
      SELECT * FROM performancemonitoringcontrol 
      WHERE id = ? AND business_area IN (${placeholders})
    `, [parseInt(params.id), ...userBusinessAreas]);

    return NextResponse.json(updatedControl);
  } catch (error) {
    console.error('Error updating performance monitoring control:', error);
    return NextResponse.json(
      { error: 'Failed to update performance monitoring control' },
      { status: 500 }
    );
  }
}

// DELETE a performance monitoring control
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [...userBusinessAreas, parseInt(params.id)];

    // Check if control exists and user has access
    const [existingControl] = await query(`
      SELECT business_area FROM performancemonitoringcontrol 
      WHERE business_area IN (${placeholders}) AND id = ?
    `, queryParams);

    if (!existingControl) {
      return NextResponse.json({ error: 'Performance monitoring control not found' }, { status: 404 });
    }

    const result = await query(`
      DELETE FROM performancemonitoringcontrol 
      WHERE id = ? AND business_area IN (${placeholders})
    `, queryParams);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Performance monitoring control not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Performance monitoring control deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting performance monitoring control:', error);
    return NextResponse.json(
      { error: 'Failed to delete performance monitoring control' },
      { status: 500 }
    );
  }
} 