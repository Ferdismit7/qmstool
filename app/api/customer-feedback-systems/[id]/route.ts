import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas } from '@/lib/auth';
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
      }
    });

    if (!feedbackSystem) {
      return NextResponse.json({ error: 'Feedback system not found' }, { status: 404 });
    }

    return NextResponse.json(feedbackSystem);
  } catch (error) {
    console.error('Error fetching customer feedback system:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback system' },
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

    // Handle file upload data
    const fileUploadResult = await handleFileUploadFromJson(request);
    if (!fileUploadResult.success && fileUploadResult.error) {
      return NextResponse.json({ error: fileUploadResult.error }, { status: 400 });
    }

    const fileData = fileUploadResult.data ? prepareFileDataForPrisma(fileUploadResult.data) : {};

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
        notes: body.notes || '',
        ...fileData,
        updated_at: getLocalTime()
      }
    });

    return NextResponse.json(feedbackSystem);
  } catch (error) {
    console.error('Error updating customer feedback system:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback system' },
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