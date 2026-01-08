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
    const businessImprovementId = parseInt(id);
    if (isNaN(businessImprovementId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const businessImprovement = await prisma.businessImprovement.findFirst({
      where: {
        id: businessImprovementId,
        deleted_at: null,
        business_area: { in: userBusinessAreas }
      },
      include: {
        fileVersions: {
          orderBy: {
            uploaded_at: 'desc'
          },
          include: {
            uploadedBy: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!businessImprovement) {
      return NextResponse.json({ success: false, error: 'Business improvement not found' }, { status: 404 });
    }

    const transformedData = {
      ...businessImprovement,
      file_size: businessImprovement.file_size ? Number(businessImprovement.file_size) : null,
      fileVersions: businessImprovement.fileVersions.map(fv => ({
        id: fv.id,
        business_improvement_id: fv.business_improvement_id,
        improvement_version: fv.improvement_version,
        file_url: fv.file_url,
        file_name: fv.file_name,
        file_size: fv.file_size ? Number(fv.file_size) : null,
        file_type: fv.file_type,
        uploaded_at: fv.uploaded_at,
        uploaded_by: fv.uploaded_by,
        uploadedBy: fv.uploadedBy
      }))
    };

    return NextResponse.json({ success: true, data: transformedData });
  } catch (error) {
    console.error('Error fetching business improvement:', error);
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
    const businessImprovementId = parseInt(id);
    if (isNaN(businessImprovementId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
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
      version,
      notes,
      file_url,
      file_name,
      file_size,
      file_type
    } = body;

    // Get current business improvement to check if file is being changed
    const currentBusinessImprovement = await prisma.businessImprovement.findFirst({
      where: {
        id: businessImprovementId,
        deleted_at: null,
        business_area: { in: userBusinessAreas }
      }
    });

    if (!currentBusinessImprovement) {
      return NextResponse.json({ success: false, error: 'Business improvement not found' }, { status: 404 });
    }

    // Get user for uploaded_by field
    const user = await getUserFromToken(request);
    const userId = user?.userId || null;

    // If a new file is being uploaded and it's different from the current one,
    // save the current file to versions table before updating
    if (
      file_url &&
      file_url !== currentBusinessImprovement.file_url &&
      currentBusinessImprovement.file_url &&
      currentBusinessImprovement.version
    ) {
      await prisma.businessImprovementFileVersion.create({
        data: {
          business_improvement_id: businessImprovementId,
          improvement_version: currentBusinessImprovement.version,
          file_url: currentBusinessImprovement.file_url,
          file_name: currentBusinessImprovement.file_name || '',
          file_size: currentBusinessImprovement.file_size,
          file_type: currentBusinessImprovement.file_type,
          uploaded_by: userId
        }
      });
    }

    const businessImprovement = await prisma.businessImprovement.update({
      where: { id: businessImprovementId },
      data: {
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
        version,
        notes,
        file_url,
        file_name,
        file_size: file_size ? BigInt(file_size) : null,
        file_type
      },
      include: {
        fileVersions: {
          orderBy: {
            uploaded_at: 'desc'
          },
          include: {
            uploadedBy: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        }
      }
    });

    const transformedData = {
      ...businessImprovement,
      file_size: businessImprovement.file_size ? Number(businessImprovement.file_size) : null,
      fileVersions: businessImprovement.fileVersions.map(fv => ({
        id: fv.id,
        business_improvement_id: fv.business_improvement_id,
        improvement_version: fv.improvement_version,
        file_url: fv.file_url,
        file_name: fv.file_name,
        file_size: fv.file_size ? Number(fv.file_size) : null,
        file_type: fv.file_type,
        uploaded_at: fv.uploaded_at,
        uploaded_by: fv.uploaded_by,
        uploadedBy: fv.uploadedBy
      }))
    };

    return NextResponse.json({ success: true, data: transformedData });
  } catch (error) {
    console.error('Error updating business improvement:', error);
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
    const businessImprovementId = parseInt(id);
    if (isNaN(businessImprovementId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    // Soft delete
    await prisma.businessImprovement.update({
      where: { id: businessImprovementId },
      data: {
        deleted_at: new Date()
      }
    });

    return NextResponse.json({ success: true, message: 'Business improvement deleted successfully' });
  } catch (error) {
    console.error('Error deleting business improvement:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
