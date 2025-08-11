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
    const recordKeepingSystemId = parseInt(id);
    if (isNaN(recordKeepingSystemId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const recordKeepingSystem = await prisma.recordKeepingSystem.findFirst({
      where: {
        id: recordKeepingSystemId,
        deleted_at: null,
        business_area: { in: userBusinessAreas }
      }
    });

    if (!recordKeepingSystem) {
      return NextResponse.json({ success: false, error: 'Record keeping system not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: recordKeepingSystem });
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
      notes,
      file_url,
      file_name,
      file_size,
      file_type
    } = body;

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
        notes,
        file_url,
        file_name,
        file_size: file_size ? BigInt(file_size) : null,
        file_type
      }
    });

    return NextResponse.json({ success: true, data: recordKeepingSystem });
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
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const recordKeepingSystemId = parseInt(id);
    if (isNaN(recordKeepingSystemId)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    // Soft delete
    await prisma.recordKeepingSystem.update({
      where: { id: recordKeepingSystemId },
      data: {
        deleted_at: new Date()
      }
    });

    return NextResponse.json({ success: true, message: 'Record keeping system deleted successfully' });
  } catch (error) {
    console.error('Error deleting record keeping system:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
