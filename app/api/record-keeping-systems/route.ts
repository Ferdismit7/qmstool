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

    const recordKeepingSystems = await prisma.recordKeepingSystem.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: recordKeepingSystems });
  } catch (error) {
    console.error('Error fetching record keeping systems:', error);
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

    // Use the first business area for new records
    const userBusinessArea = userBusinessAreas[0];

    const recordKeepingSystem = await prisma.recordKeepingSystem.create({
      data: {
        business_area: userBusinessArea,
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

    return NextResponse.json({
      success: true,
      data: { id: recordKeepingSystem.id },
      message: 'Record keeping system created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating record keeping system:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
