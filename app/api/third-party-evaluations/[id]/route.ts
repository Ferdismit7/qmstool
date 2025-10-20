import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserBusinessAreas } from '@/lib/auth';
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
      }
    });

    if (!evaluation) {
      return NextResponse.json({ success: false, error: 'Evaluation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: evaluation });
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

    // Handle file upload data
    const fileUploadResult = await handleFileUploadFromJson(request);
    if (!fileUploadResult.success && fileUploadResult.error) {
      return NextResponse.json({ error: fileUploadResult.error }, { status: 400 });
    }

    const fileData = fileUploadResult.data ? prepareFileDataForPrisma(fileUploadResult.data) : {};

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
        notes: body.notes || '',
        ...fileData,
        updated_at: getLocalTime()
      }
    });

    return NextResponse.json({ success: true, data: evaluation });
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