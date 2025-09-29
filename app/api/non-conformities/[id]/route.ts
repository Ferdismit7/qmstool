import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';

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
    // Get current user ID from JWT token
    const user = await getUserFromToken(request);
    if (!user || !user.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const userId = user.userId;
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const nonConformityId = parseInt(id);
    if (isNaN(nonConformityId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    // Check if the non-conformity exists and belongs to user's business areas
    const existingNonConformity = await prisma.nonConformity.findFirst({
      where: {
        id: nonConformityId,
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null // Only allow soft delete of non-deleted records
      }
    });

    if (!existingNonConformity) {
      return NextResponse.json(
        { success: false, error: 'Non-conformity not found or access denied' },
        { status: 404 }
      );
    }

    // Soft delete with audit trail
    const softDeletedNonConformity = await prisma.nonConformity.update({
      where: { id: nonConformityId },
      data: {
        deleted_at: new Date(),
        deleted_by: userId
      },
      include: {
        businessareas: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Non-conformity deleted successfully',
      deletedAt: softDeletedNonConformity.deleted_at,
      deletedBy: softDeletedNonConformity.deleted_by
    });
  } catch (error) {
    console.error('Error deleting non-conformity:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
