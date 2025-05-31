import { NextResponse } from 'next/server';
import { query } from '@/app/lib/db';

export async function GET() {
  try {
    const objectives = await query(`
      SELECT * FROM businessqualityobjectives
      ORDER BY id DESC
    `);
    return NextResponse.json(objectives);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business quality objectives' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
      INSERT INTO businessqualityobjectives (
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      status_percentage
    ]);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to create business quality objective' },
      { status: 500 }
    );
  }
} 