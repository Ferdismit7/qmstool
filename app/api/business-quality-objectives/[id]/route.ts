import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const objectives = await query(
      'SELECT * FROM businessqualityobjectives WHERE id = ?',
      [params.id]
    );
    
    if (objectives.length === 0) {
      return NextResponse.json(
        { error: 'Business quality objective not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(objectives[0]);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business quality objective' },
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
      category,
      business_area,
      sub_business_area,
      qms_main_objectives,
      qms_objective_description,
      kpi_or_sla_targets,
      performance_monitoring,
      proof_of_measuring,
      proof_of_reporting,
      frequency,
      responsible_person_team,
      review_date,
      progress,
      status_percentage
    } = body;

    const result = await query(`
      UPDATE businessqualityobjectives
      SET
        category = ?,
        business_area = ?,
        sub_business_area = ?,
        qms_main_objectives = ?,
        qms_objective_description = ?,
        kpi_or_sla_targets = ?,
        performance_monitoring = ?,
        proof_of_measuring = ?,
        proof_of_reporting = ?,
        frequency = ?,
        responsible_person_team = ?,
        review_date = ?,
        progress = ?,
        status_percentage = ?
      WHERE id = ?
    `, [
      category,
      business_area,
      sub_business_area,
      qms_main_objectives,
      qms_objective_description,
      kpi_or_sla_targets,
      performance_monitoring,
      proof_of_measuring,
      proof_of_reporting,
      frequency,
      responsible_person_team,
      review_date,
      progress,
      status_percentage,
      params.id
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Business quality objective not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Business quality objective updated successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to update business quality objective' },
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
      'DELETE FROM businessqualityobjectives WHERE id = ?',
      [params.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Business quality objective not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Business quality objective deleted successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete business quality objective' },
      { status: 500 }
    );
  }
} 