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
    const recordKeepingSystemId = parseInt(id);
    if (isNaN(recordKeepingSystemId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const recordKeepingSystem = await prisma.recordKeepingSystem.findFirst({
      where: {
        id: recordKeepingSystemId,
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

    if (!recordKeepingSystem) {
      return NextResponse.json({ success: false, error: 'Record keeping system not found' }, { status: 404 });
    }

    const transformedData = {
      ...recordKeepingSystem,
      file_size: recordKeepingSystem.file_size ? Number(recordKeepingSystem.file_size) : null,
      fileVersions: recordKeepingSystem.fileVersions.map(fv => ({
        id: fv.id,
        record_keeping_system_id: fv.record_keeping_system_id,
        rks_version: fv.rks_version,
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
    console.error('Error fetching record keeping system:', error);
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
    const recordKeepingSystemId = parseInt(id);
    if (isNaN(recordKeepingSystemId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      sub_business_area,
      record_type,
      system_name,
      system_description,
      retention_period,
      storage_location,
      access_controls,
      backup_procedures,
      disposal_procedures,
      compliance_status,
      last_audit_date,
      next_audit_date,
      audit_findings,
      corrective_actions,
      responsible_person,
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

    // Get current record keeping system to check if file is being changed
    const currentRecordKeepingSystem = await prisma.recordKeepingSystem.findFirst({
      where: {
        id: recordKeepingSystemId,
        deleted_at: null,
        business_area: { in: userBusinessAreas }
      }
    });

    if (!currentRecordKeepingSystem) {
      return NextResponse.json({ success: false, error: 'Record keeping system not found' }, { status: 404 });
    }

    // Get user for uploaded_by field
    const user = await getUserFromToken(request);
    const userId = user?.userId || null;

    // If a new file is being uploaded and it's different from the current one,
    // save the current file to versions table before updating
    if (
      file_url &&
      file_url !== currentRecordKeepingSystem.file_url &&
      currentRecordKeepingSystem.file_url &&
      currentRecordKeepingSystem.version
    ) {
      await prisma.recordKeepingSystemFileVersion.create({
        data: {
          record_keeping_system_id: recordKeepingSystemId,
          rks_version: currentRecordKeepingSystem.version,
          file_url: currentRecordKeepingSystem.file_url,
          file_name: currentRecordKeepingSystem.file_name || '',
          file_size: currentRecordKeepingSystem.file_size,
          file_type: currentRecordKeepingSystem.file_type,
          uploaded_by: userId
        }
      });
    }

    const recordKeepingSystem = await prisma.recordKeepingSystem.update({
      where: { id: recordKeepingSystemId },
      data: {
        sub_business_area,
        record_type,
        system_name,
        system_description,
        retention_period,
        storage_location,
        access_controls,
        backup_procedures,
        disposal_procedures,
        compliance_status,
        last_audit_date: last_audit_date ? new Date(last_audit_date) : null,
        next_audit_date: next_audit_date ? new Date(next_audit_date) : null,
        audit_findings,
        corrective_actions,
        responsible_person,
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
      ...recordKeepingSystem,
      file_size: recordKeepingSystem.file_size ? Number(recordKeepingSystem.file_size) : null,
      fileVersions: recordKeepingSystem.fileVersions.map(fv => ({
        id: fv.id,
        record_keeping_system_id: fv.record_keeping_system_id,
        rks_version: fv.rks_version,
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
    console.error('Error updating record keeping system:', error);
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
    const recordKeepingSystemId = parseInt(id);
    if (isNaN(recordKeepingSystemId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    // Check if the record exists and belongs to user's business areas
    const existingRecord = await prisma.recordKeepingSystem.findFirst({
      where: {
        id: recordKeepingSystemId,
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null // Only allow soft delete of non-deleted records
      }
    });

    if (!existingRecord) {
      return NextResponse.json(
        { success: false, error: 'Record not found or access denied' },
        { status: 404 }
      );
    }

    // Soft delete with audit trail
    const softDeletedRecord = await prisma.recordKeepingSystem.update({
      where: { id: recordKeepingSystemId },
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
      message: 'Record keeping system deleted successfully',
      deletedAt: softDeletedRecord.deleted_at,
      deletedBy: softDeletedRecord.deleted_by
    });
  } catch (error) {
    console.error('Error deleting record keeping system:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
