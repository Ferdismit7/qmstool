import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUserBusinessArea, getUserFromToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET single risk management control
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userBusinessArea = await getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await prisma.racmMatrix.findFirst({
      where: {
        id: parseInt(id),
        business_area: userBusinessArea,
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
    
    if (!result) {
      return NextResponse.json({ error: 'Risk management control not found' }, { status: 404 });
    }
    
    const transformedData = {
      ...result,
      file_size: result.file_size ? Number(result.file_size) : null,
      fileVersions: result.fileVersions.map(fv => ({
        id: fv.id,
        racm_matrix_id: fv.racm_matrix_id,
        matrix_version: fv.matrix_version,
        file_url: fv.file_url,
        file_name: fv.file_name,
        file_size: fv.file_size ? Number(fv.file_size) : null,
        file_type: fv.file_type,
        uploaded_at: fv.uploaded_at,
        uploaded_by: fv.uploaded_by,
        uploadedBy: fv.uploadedBy
      }))
    };
    
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk management control' },
      { status: 500 }
    );
  }
}

// PUT (update) a risk management control
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userBusinessArea = await getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      process_name,
      activity_description,
      issue_description,
      issue_type,
      inherent_risk_likeliness,
      inherent_risk_impact,
      inherent_risk_score,
      control_description,
      control_type,
      control_owner,
      control_effectiveness,
      residual_risk_likeliness,
      status,
      doc_status,
      version,
      control_progress,
      control_target_date,
      residual_risk_impact,
      residual_risk_overall_score,
      file_url,
      file_name,
      file_size,
      file_type
    } = data;

    // Get current control to check if file is being changed
    const currentControl = await prisma.racmMatrix.findFirst({
      where: {
        id: parseInt(id),
        business_area: userBusinessArea,
        deleted_at: null
      }
    });

    if (!currentControl) {
      return NextResponse.json({ error: 'Risk management control not found' }, { status: 404 });
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
      await prisma.racmMatrixFileVersion.create({
        data: {
          racm_matrix_id: parseInt(id),
          matrix_version: currentControl.version,
          file_url: currentControl.file_url,
          file_name: currentControl.file_name || '',
          file_size: currentControl.file_size,
          file_type: currentControl.file_type,
          uploaded_by: userId
        }
      });
    }

    // Update using Prisma
    const updatedControl = await prisma.racmMatrix.update({
      where: {
        id: parseInt(id),
        business_area: userBusinessArea,
        deleted_at: null
      },
      data: {
        process_name,
        activity_description,
        issue_description,
        issue_type,
        inherent_risk_likeliness,
        inherent_risk_impact,
        inherent_risk_score,
        control_description,
        control_type,
        control_owner,
        control_effectiveness,
        residual_risk_likeliness,
        status,
        doc_status,
        version,
        control_progress,
        control_target_date: control_target_date ? new Date(control_target_date) : null,
        residual_risk_impact,
        residual_risk_overall_score,
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

    // Create history record for the update
    await query(`
      INSERT INTO racm_matrix_history (
        racm_matrix_id, 
        inherent_risk_score, 
        residual_risk_overall_score, 
        change_type, 
        change_date
      ) VALUES (?, ?, ?, 'updated', NOW())
    `, [
      id, 
      updatedControl.inherent_risk_score, 
      updatedControl.residual_risk_overall_score
    ]);

    const transformedData = {
      ...updatedControl,
      file_size: updatedControl.file_size ? Number(updatedControl.file_size) : null,
      fileVersions: updatedControl.fileVersions.map(fv => ({
        id: fv.id,
        racm_matrix_id: fv.racm_matrix_id,
        matrix_version: fv.matrix_version,
        file_url: fv.file_url,
        file_name: fv.file_name,
        file_size: fv.file_size ? Number(fv.file_size) : null,
        file_type: fv.file_type,
        uploaded_at: fv.uploaded_at,
        uploaded_by: fv.uploaded_by,
        uploadedBy: fv.uploadedBy
      }))
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error updating risk management control:', error);
    return NextResponse.json(
      { error: 'Failed to update risk management control' },
      { status: 500 }
    );
  }
}

// DELETE a risk management control
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userBusinessArea = await getCurrentUserBusinessArea(request);
    if (!userBusinessArea) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await query(`
      DELETE FROM racm_matrix WHERE id = ? AND business_area = ?
    `, [id, userBusinessArea]);

    if ((result as unknown as { affectedRows: number }).affectedRows === 0) {
      return NextResponse.json({ error: 'Risk management control not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Risk management control deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting risk management control:', error);
    return NextResponse.json(
      { error: 'Failed to delete risk management control' },
      { status: 500 }
    );
  }
}
