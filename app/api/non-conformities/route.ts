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

    const nonConformities = await prisma.nonConformity.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: nonConformities });
  } catch (error) {
    console.error('Error fetching non-conformities:', error);
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
      nc_number,
      nc_type,
      description,
      root_cause,
      corrective_action,
      responsible_person,
      target_date,
      completion_date,
      status,
      priority,
      impact_level,
      verification_method,
      effectiveness_review,
      lessons_learned,
      related_documents,
      file_url,
      file_name,
      file_size,
      file_type
    } = body;

    // Use the first business area for new records
    const userBusinessArea = userBusinessAreas[0];

    const nonConformity = await prisma.nonConformity.create({
      data: {
        business_area: userBusinessArea,
        sub_business_area,
        nc_number,
        nc_type,
        description,
        root_cause,
        corrective_action,
        responsible_person,
        target_date: target_date ? new Date(target_date) : null,
        completion_date: completion_date ? new Date(completion_date) : null,
        status,
        priority,
        impact_level,
        verification_method,
        effectiveness_review,
        lessons_learned,
        related_documents,
        file_url,
        file_name,
        file_size: file_size ? BigInt(file_size) : null,
        file_type
      }
    });

    return NextResponse.json({
      success: true,
      data: { id: nonConformity.id },
      message: 'Non-conformity created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating non-conformity:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
