import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessArea = searchParams.get('business_area');

    const whereClause: { deleted_at: null; business_area?: string | { in: string[] } } = {
      deleted_at: null
    };

    if (businessArea) {
      whereClause.business_area = businessArea;
    } else {
      whereClause.business_area = { in: userBusinessAreas };
    }

    const businessImprovements = await prisma.businessImprovement.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: businessImprovements });
  } catch (error) {
    console.error('Error fetching business improvements:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
      sub_business_area,
      improvement_title,
      improvement_type,
      description,
      business_case,
      expected_benefits,
      implementation_plan,
      success_criteria,
      responsible_person,
      start_date,
      target_completion_date,
      actual_completion_date,
      status,
      priority,
      budget_allocated,
      actual_cost,
      roi_calculation,
      lessons_learned,
      next_steps,
      related_processes,
      status_percentage,
      doc_status,
      progress,
      notes,
      file_url,
      file_name,
      file_size,
      file_type
    } = body;

    // Use the first business area for new records
    const userBusinessArea = userBusinessAreas[0];

    const businessImprovement = await prisma.businessImprovement.create({
      data: {
        business_area: userBusinessArea,
        sub_business_area,
        improvement_title,
        improvement_type,
        description,
        business_case,
        expected_benefits,
        implementation_plan,
        success_criteria,
        responsible_person,
        start_date: start_date ? new Date(start_date) : null,
        target_completion_date: target_completion_date ? new Date(target_completion_date) : null,
        actual_completion_date: actual_completion_date ? new Date(actual_completion_date) : null,
        status,
        priority,
        budget_allocated: budget_allocated ? parseFloat(budget_allocated) : null,
        actual_cost: actual_cost ? parseFloat(actual_cost) : null,
        roi_calculation,
        lessons_learned,
        next_steps,
        related_processes,
        status_percentage: status_percentage ? parseFloat(status_percentage) : null,
        doc_status,
        progress,
        notes,
        file_url,
        file_name,
        file_size: file_size ? BigInt(file_size) : null,
        file_type
      }
    });

    return NextResponse.json({
      success: true,
      data: { id: businessImprovement.id },
      message: 'Business improvement created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating business improvement:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
