import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';
import { handleFileUploadFromJson, prepareFileDataForPrisma } from '@/lib/fileUpload';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const evaluation = await prisma.thirdPartyEvaluation.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        business_area: {
          in: userBusinessAreas
        }
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

    if (!evaluation) {
      return NextResponse.json({ success: false, error: 'Evaluation not found' }, { status: 404 });
    }

    const transformedData = {
      ...evaluation,
      file_size: evaluation.file_size ? Number(evaluation.file_size) : null,
      fileVersions: evaluation.fileVersions.map(fv => ({
        id: fv.id,
        third_party_evaluation_id: fv.third_party_evaluation_id,
        evaluation_version: fv.evaluation_version,
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
    console.error('Error fetching third-party evaluation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch evaluation' },
      { status: 500 }
    );
  }
}

// Helper function to get local time in UTC+2 timezone
const getLocalTime = () => {
  const now = new Date();
  // Add 2 hours to UTC to get your local time
  const localTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  return localTime;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const body = await request.json();
    console.log('Received update body:', body);

    // Get current evaluation to check if file is being changed
    const currentEvaluation = await prisma.thirdPartyEvaluation.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        business_area: {
          in: userBusinessAreas
        }
      }
    });

    if (!currentEvaluation) {
      return NextResponse.json({ success: false, error: 'Evaluation not found' }, { status: 404 });
    }

    // Handle file upload data - pass the already-parsed body instead of request
    const fileUploadResult = await handleFileUploadFromJson(body);
    if (!fileUploadResult.success && fileUploadResult.error) {
      return NextResponse.json({ error: fileUploadResult.error }, { status: 400 });
    }

    const fileData = fileUploadResult.data ? prepareFileDataForPrisma(fileUploadResult.data) : {};

    // Get user for uploaded_by field
    const user = await getUserFromToken(request);
    const userId = user?.userId || null;

    // If a new file is being uploaded and it's different from the current one,
    // save the current file to versions table before updating
    if (
      fileData.file_url &&
      fileData.file_url !== currentEvaluation.file_url &&
      currentEvaluation.file_url &&
      currentEvaluation.version
    ) {
      await prisma.thirdPartyEvaluationFileVersion.create({
        data: {
          third_party_evaluation_id: parseInt(resolvedParams.id),
          evaluation_version: currentEvaluation.version,
          file_url: currentEvaluation.file_url,
          file_name: currentEvaluation.file_name || '',
          file_size: currentEvaluation.file_size,
          file_type: currentEvaluation.file_type,
          uploaded_by: userId
        }
      });
    }

    const evaluation = await prisma.thirdPartyEvaluation.update({
      where: {
        id: parseInt(resolvedParams.id),
        business_area: {
          in: userBusinessAreas
        }
      },
      data: {
        supplier_name: body.supplier_name,
        business_area: body.business_area,
        evaluation_system_in_place: body.evaluation_system_in_place,
        document_reference: body.document_reference || '',
        last_evaluation_date: body.last_evaluation_date ? new Date(body.last_evaluation_date) : null,
        status_percentage: body.status_percentage || 0,
        doc_status: body.doc_status || 'Not Started',
        progress: body.progress || 'New',
        version: body.version,
        notes: body.notes || '',
        ...fileData,
        updated_at: getLocalTime()
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
      ...evaluation,
      file_size: evaluation.file_size ? Number(evaluation.file_size) : null,
      fileVersions: evaluation.fileVersions.map(fv => ({
        id: fv.id,
        third_party_evaluation_id: fv.third_party_evaluation_id,
        evaluation_version: fv.evaluation_version,
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
    console.error('Error updating third-party evaluation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update evaluation' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    await prisma.thirdPartyEvaluation.delete({
      where: {
        id: parseInt(resolvedParams.id),
        business_area: {
          in: userBusinessAreas
        }
      }
    });

    return NextResponse.json({ message: 'Evaluation deleted successfully' });
  } catch (error) {
    console.error('Error deleting third-party evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to delete evaluation' },
      { status: 500 }
    );
  }
} 