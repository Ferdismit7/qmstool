import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// File upload functionality is handled directly in the request body

// GET a single performance monitoring control
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const control = await prisma.performanceMonitoringControl.findFirst({
      where: {
        id: parseInt(id),
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null
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

    if (!control) {
      return NextResponse.json({ success: false, error: 'Performance monitoring control not found' }, { status: 404 });
    }

    const transformedControl = {
      ...control,
      file_size: control.file_size ? Number(control.file_size) : null,
      fileVersions: control.fileVersions.map(fv => ({
        id: fv.id,
        performance_monitoring_control_id: fv.performance_monitoring_control_id,
        control_version: fv.control_version,
        file_url: fv.file_url,
        file_name: fv.file_name,
        file_size: fv.file_size ? Number(fv.file_size) : null,
        file_type: fv.file_type,
        uploaded_at: fv.uploaded_at,
        uploaded_by: fv.uploaded_by,
        uploadedBy: fv.uploadedBy
      }))
    };

    return NextResponse.json({ success: true, data: transformedControl });
  } catch (error) {
    console.error('Error fetching performance monitoring control:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance monitoring control' },
      { status: 500 }
    );
  }
}

// PUT (update) a performance monitoring control
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      sub_business_area,
      Name_reports,
      doc_type,
      priority,
      doc_status,
      progress,
      status_percentage,
      version,
      target_date,
      proof,
      frequency,
      responsible_persons,
      remarks,
      file_url,
      file_name,
      file_size,
      file_type,
      uploaded_at
    } = data;

    // Get current control to check if file is being changed
    const currentControl = await prisma.performanceMonitoringControl.findFirst({
      where: {
        id: parseInt(id),
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null
      }
    });

    if (!currentControl) {
      return NextResponse.json({ success: false, error: 'Performance monitoring control not found' }, { status: 404 });
    }

    // Get user for uploaded_by field
    const user = await getUserFromToken(request);
    const userId = user?.userId || null;

    // If a new file is being uploaded and it's different from the current one,
    // save the current file to versions table before updating
    if (
      file_url &&
      file_url !== currentControl.file_url &&
      currentControl.file_url &&
      currentControl.version
    ) {
      await prisma.performanceMonitoringControlFileVersion.create({
        data: {
          performance_monitoring_control_id: parseInt(id),
          control_version: currentControl.version,
          file_url: currentControl.file_url,
          file_name: currentControl.file_name || '',
          file_size: currentControl.file_size,
          file_type: currentControl.file_type,
          uploaded_by: userId
        }
      });
    }

    // Update using Prisma
    const updatedControl = await prisma.performanceMonitoringControl.updateMany({
      where: {
        id: parseInt(id),
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null
      },
      data: {
        sub_business_area,
        Name_reports,
        doc_type,
        priority,
        doc_status,
        progress,
        status_percentage,
        version,
        target_date: target_date ? new Date(target_date) : null,
        proof,
        frequency,
        responsible_persons,
        remarks,
        file_url,
        file_name,
        file_size: file_size ? BigInt(file_size) : null,
        file_type,
        uploaded_at: uploaded_at ? new Date(uploaded_at) : new Date()
      }
    });

    if (updatedControl.count === 0) {
      return NextResponse.json({ success: false, error: 'Performance monitoring control not found' }, { status: 404 });
    }

    // Fetch the updated record with relations
    const updatedRecord = await prisma.performanceMonitoringControl.findFirst({
      where: {
        id: parseInt(id),
        business_area: {
          in: userBusinessAreas
        },
        deleted_at: null
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

    if (!updatedRecord) {
      return NextResponse.json({ success: false, error: 'Performance monitoring control not found' }, { status: 404 });
    }

    const transformedControl = {
      ...updatedRecord,
      file_size: updatedRecord.file_size ? Number(updatedRecord.file_size) : null,
      fileVersions: updatedRecord.fileVersions.map(fv => ({
        id: fv.id,
        performance_monitoring_control_id: fv.performance_monitoring_control_id,
        control_version: fv.control_version,
        file_url: fv.file_url,
        file_name: fv.file_name,
        file_size: fv.file_size ? Number(fv.file_size) : null,
        file_type: fv.file_type,
        uploaded_at: fv.uploaded_at,
        uploaded_by: fv.uploaded_by,
        uploadedBy: fv.uploadedBy
      }))
    };

    return NextResponse.json({ success: true, data: transformedControl });
  } catch (error) {
    console.error('Error updating performance monitoring control:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update performance monitoring control' },
      { status: 500 }
    );
  }
}

// DELETE a performance monitoring control
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create placeholders for IN clause
    const placeholders = userBusinessAreas.map(() => '?').join(',');
    const queryParams = [...userBusinessAreas, parseInt(id)];

    // Check if control exists and user has access
    const [existingControl] = await query(`
      SELECT business_area FROM performancemonitoringcontrol 
      WHERE business_area IN (${placeholders}) AND id = ?
    `, queryParams);

    if (!existingControl) {
      return NextResponse.json({ success: false, error: 'Performance monitoring control not found' }, { status: 404 });
    }

    const result = await query(`
      DELETE FROM performancemonitoringcontrol 
      WHERE id = ? AND business_area IN (${placeholders})
    `, queryParams);

    if ((result as unknown as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Performance monitoring control not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Performance monitoring control deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting performance monitoring control:', error);
    return NextResponse.json(
      { error: 'Failed to delete performance monitoring control' },
      { status: 500 }
    );
  }
}