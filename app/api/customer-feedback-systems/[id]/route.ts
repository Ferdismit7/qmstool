import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas, getUserFromToken } from '@/lib/auth';
import { handleFileUploadFromJson, prepareFileDataForPrisma } from '@/lib/fileUpload';

// Helper function to get local time in UTC+2 timezone
const getLocalTime = () => {
  const now = new Date();
  // Add 2 hours to UTC to get your local time
  const localTime = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  return localTime;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const feedbackSystem = await prisma.customerFeedbackSystem.findFirst({
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

    if (!feedbackSystem) {
      return NextResponse.json({ success: false, error: 'Feedback system not found' }, { status: 404 });
    }

    const transformedData = {
      ...feedbackSystem,
      file_size: feedbackSystem.file_size ? Number(feedbackSystem.file_size) : null,
      fileVersions: feedbackSystem.fileVersions.map(fv => ({
        id: fv.id,
        customer_feedback_system_id: fv.customer_feedback_system_id,
        feedback_version: fv.feedback_version,
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
    console.error('Error fetching customer feedback system:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback system' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Received update body:', body);

    // Get current feedback system to check if file is being changed
    const currentFeedbackSystem = await prisma.customerFeedbackSystem.findFirst({
      where: {
        id: parseInt(resolvedParams.id),
        business_area: {
          in: userBusinessAreas
        }
      }
    });

    if (!currentFeedbackSystem) {
      return NextResponse.json({ success: false, error: 'Feedback system not found' }, { status: 404 });
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
      fileData.file_url !== currentFeedbackSystem.file_url &&
      currentFeedbackSystem.file_url &&
      currentFeedbackSystem.version
    ) {
      await prisma.customerFeedbackSystemFileVersion.create({
        data: {
          customer_feedback_system_id: parseInt(resolvedParams.id),
          feedback_version: currentFeedbackSystem.version,
          file_url: currentFeedbackSystem.file_url,
          file_name: currentFeedbackSystem.file_name || '',
          file_size: currentFeedbackSystem.file_size,
          file_type: currentFeedbackSystem.file_type,
          uploaded_by: userId
        }
      });
    }

    const feedbackSystem = await prisma.customerFeedbackSystem.update({
      where: {
        id: parseInt(resolvedParams.id),
        business_area: {
          in: userBusinessAreas
        }
      },
      data: {
        business_area: body.business_area,
        has_feedback_system: body.has_feedback_system,
        document_reference: body.document_reference || '',
        last_review_date: body.last_review_date ? new Date(body.last_review_date) : null,
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
      ...feedbackSystem,
      file_size: feedbackSystem.file_size ? Number(feedbackSystem.file_size) : null,
      fileVersions: feedbackSystem.fileVersions.map(fv => ({
        id: fv.id,
        customer_feedback_system_id: fv.customer_feedback_system_id,
        feedback_version: fv.feedback_version,
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
    console.error('Error updating customer feedback system:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update feedback system' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userBusinessAreas = await getCurrentUserBusinessAreas(request);
    if (userBusinessAreas.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.customerFeedbackSystem.delete({
      where: {
        id: parseInt(resolvedParams.id),
        business_area: {
          in: userBusinessAreas
        }
      }
    });

    return NextResponse.json({ message: 'Feedback system deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer feedback system:', error);
    return NextResponse.json(
      { error: 'Failed to delete feedback system' },
      { status: 500 }
    );
  }
} 