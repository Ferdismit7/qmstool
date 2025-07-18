import { NextRequest, NextResponse } from 'next/server';
import {prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const objectives = await prisma.businessQualityObjective.findMany({
      where: {
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null // Filter out soft deleted records
      },
      orderBy: {
        id: 'desc'
      }
    });
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
    const { 
      category, 
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
      doc_status 
    } = body;

    // Use the first business area for new records
    const userBusinessArea = userBusinessAreas[0];

    const objective = await prisma.businessQualityObjective.create({
      data: {
        category,
        sub_business_area,
        qms_main_objectives,
        qms_objective_description,
        kpi_or_sla_targets,
        performance_monitoring,
        proof_of_measuring,
        proof_of_reporting,
        frequency,
        responsible_person_team,
        review_date: review_date ? new Date(review_date) : null,
        progress,
        status_percentage,
        doc_status,
        business_area: userBusinessArea
      }
    });

    return NextResponse.json({
      success: true,
      data: { id: objective.id },
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