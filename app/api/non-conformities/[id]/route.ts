import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const nonConformityId = parseInt(id);
    if (isNaN(nonConformityId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const nonConformity = await prisma.nonConformity.findFirst({
      where: {
        id: nonConformityId,
        deleted_at: null,
        business_area: { in: userBusinessAreas }
      }
    });

    if (!nonConformity) {
      return NextResponse.json({ success: false, error: 'Non-conformity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: nonConformity });
  } catch (error) {
    console.error('Error fetching non-conformity:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const nonConformityId = parseInt(id);
    if (isNaN(nonConformityId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
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

    const nonConformity = await prisma.nonConformity.update({
      where: { id: nonConformityId },
      data: {
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

    return NextResponse.json({ success: true, data: nonConformity });
  } catch (error) {
    console.error('Error updating non-conformity:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const nonConformityId = parseInt(id);
    if (isNaN(nonConformityId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    // Soft delete
    await prisma.nonConformity.update({
      where: { id: nonConformityId },
      data: {
        deleted_at: new Date()
      }
    });

    return NextResponse.json({ success: true, message: 'Non-conformity deleted successfully' });
  } catch (error) {
    console.error('Error deleting non-conformity:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
